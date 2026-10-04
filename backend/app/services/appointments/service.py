from datetime import datetime
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import AppException
from app.models.appointment import Appointment
class AppointmentService:
    def __init__(self,db:AsyncSession):self.db=db
    async def list(self,business_id:UUID,*,start_from:datetime|None=None,start_to:datetime|None=None,status:str|None=None)->list[Appointment]:
        q=select(Appointment).where(Appointment.business_id==business_id).order_by(Appointment.start_time)
        if start_from:q=q.where(Appointment.start_time>=start_from)
        if start_to:q=q.where(Appointment.start_time<=start_to)
        if status:q=q.where(Appointment.status==status)
        return list(await self.db.scalars(q))
    async def get(self,business_id:UUID,appointment_id:UUID)->Appointment:
        a=await self.db.scalar(select(Appointment).where(Appointment.id==appointment_id,Appointment.business_id==business_id))
        if not a:raise AppException("Appointment not found","APPOINTMENT_NOT_FOUND",404)
        return a
    async def check_availability(self,business_id:UUID,*,start_time:datetime,end_time:datetime,exclude_appointment_id:UUID|None=None)->bool:
        q=select(Appointment).where(Appointment.business_id==business_id,Appointment.status.in_(["SCHEDULED","CONFIRMED"]),Appointment.start_time<end_time,Appointment.end_time>start_time)
        if exclude_appointment_id:q=q.where(Appointment.id!=exclude_appointment_id)
        return await self.db.scalar(q) is None
    async def get_latest_upcoming_for_lead(self,business_id:UUID,lead_id:UUID)->Appointment|None:
        now=datetime.now().astimezone(); return await self.db.scalar(select(Appointment).where(Appointment.business_id==business_id,Appointment.lead_id==lead_id,Appointment.status.in_(["SCHEDULED","CONFIRMED"]),Appointment.start_time>=now).order_by(Appointment.start_time.asc()).limit(1))
    async def create(self,business_id:UUID,*,title:str,start_time:datetime,end_time:datetime,lead_id:UUID|None=None,assigned_to:UUID|None=None,description:str|None=None,appointment_type:str="COUNSELLING",location:str|None=None,meeting_link:str|None=None,created_by:UUID|None=None)->Appointment:
        if end_time<=start_time:raise AppException("Appointment end time must be after start time","INVALID_APPOINTMENT_TIME",422)
        if not await self.check_availability(business_id,start_time=start_time,end_time=end_time):raise AppException("The requested time slot is unavailable","APPOINTMENT_SLOT_UNAVAILABLE",409)
        a=Appointment(business_id=business_id,lead_id=lead_id,assigned_to=assigned_to,title=title,description=description,start_time=start_time,end_time=end_time,status="SCHEDULED",appointment_type=appointment_type,location=location,meeting_link=meeting_link,created_by=created_by); self.db.add(a); await self.db.commit(); await self.db.refresh(a)
        from app.integrations.calendar.service import CalendarService
        await CalendarService(self.db).sync_create(a); await self.db.refresh(a); return a
    async def update(self,business_id:UUID,appointment_id:UUID,**fields)->Appointment:
        a=await self.get(business_id,appointment_id); allowed={"title","description","start_time","end_time","status","appointment_type","location","meeting_link","assigned_to","lead_id"}
        for k,v in fields.items():
            if k in allowed and v is not None:setattr(a,k,v)
        if a.end_time<=a.start_time:raise AppException("Appointment end time must be after start time","INVALID_APPOINTMENT_TIME",422)
        if a.status in {"SCHEDULED","CONFIRMED"} and not await self.check_availability(business_id,start_time=a.start_time,end_time=a.end_time,exclude_appointment_id=a.id):raise AppException("The requested time slot is unavailable","APPOINTMENT_SLOT_UNAVAILABLE",409)
        await self.db.commit(); await self.db.refresh(a)
        from app.integrations.calendar.service import CalendarService
        await CalendarService(self.db).sync_update(a); await self.db.refresh(a); return a
    async def cancel(self,business_id:UUID,appointment_id:UUID)->Appointment:
        a=await self.get(business_id,appointment_id)
        if a.status not in {"SCHEDULED","CONFIRMED"}:raise AppException("Appointment is not active and cannot be cancelled","APPOINTMENT_NOT_ACTIVE",409)
        return await self.update(business_id,appointment_id,status="CANCELLED")
    async def confirm(self,business_id:UUID,appointment_id:UUID)->Appointment:return await self.update(business_id,appointment_id,status="CONFIRMED")
    async def reschedule(self,business_id:UUID,appointment_id:UUID,*,start_time:datetime,end_time:datetime)->Appointment:return await self.update(business_id,appointment_id,start_time=start_time,end_time=end_time,status="SCHEDULED")
