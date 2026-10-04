from __future__ import annotations
import base64, hashlib
from datetime import datetime, timedelta, timezone
from uuid import UUID
from cryptography.fernet import Fernet
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.models.appointment import Appointment
from app.models.calendar_connection import CalendarConnection
from app.integrations.calendar.google import GoogleCalendarClient
class CalendarService:
    def __init__(self, db: AsyncSession): self.db=db
    async def get_connection(self,business_id:UUID): return await self.db.scalar(select(CalendarConnection).where(CalendarConnection.business_id==business_id))
    async def save_google_connection(self,business_id:UUID,user_id:UUID,token:dict,*,account_email:str|None=None):
        connection=await self.get_connection(business_id)
        if not connection:
            connection=CalendarConnection(business_id=business_id,connected_by=user_id,provider="GOOGLE",calendar_id="primary",access_token_encrypted=self._encrypt(token["access_token"])); self.db.add(connection)
        else:
            connection.connected_by=user_id; connection.provider="GOOGLE"; connection.calendar_id=connection.calendar_id or "primary"; connection.access_token_encrypted=self._encrypt(token["access_token"])
        if token.get("refresh_token"): connection.refresh_token_encrypted=self._encrypt(token["refresh_token"])
        connection.token_expires_at=_expiry(token.get("expires_in")); connection.account_email=account_email or connection.account_email; connection.scope=token.get("scope")
        await self.db.commit(); await self.db.refresh(connection); return connection
    async def connection_status(self,business_id:UUID)->dict:
        c=await self.get_connection(business_id)
        if not c:return {"connected":False,"provider":"GOOGLE"}
        return {"connected":True,"provider":c.provider,"calendar_id":c.calendar_id,"account_email":c.account_email,"token_expires_at":c.token_expires_at}
    async def list_events(self,business_id:UUID,*,time_min:datetime|None=None,time_max:datetime|None=None,max_results:int=50)->dict:
        c=await self.get_connection(business_id)
        if not c: raise RuntimeError("Google Calendar is not connected")
        client=await self._client(c); result=await client.list_events(c.calendar_id,time_min=time_min,time_max=time_max,max_results=max_results); await self._persist_refreshed_token(c,client); return result
    async def sync_create(self,appointment:Appointment)->None:
        c=await self.get_connection(appointment.business_id)
        if not c:return
        try:
            client=await self._client(c); event=await client.create_event(c.calendar_id,self._event_payload(appointment)); appointment.calendar_provider="GOOGLE"; appointment.calendar_event_id=event.get("id"); appointment.calendar_html_link=event.get("htmlLink"); await self._persist_refreshed_token(c,client,commit=False); await self.db.commit()
        except Exception: await self.db.rollback()
    async def sync_update(self,appointment:Appointment)->None:
        c=await self.get_connection(appointment.business_id)
        if not c:return
        try:
            if not appointment.calendar_event_id: await self.sync_create(appointment); return
            client=await self._client(c)
            if appointment.status in {"CANCELLED","CANCELED"}: await client.delete_event(c.calendar_id,appointment.calendar_event_id)
            else:
                event=await client.update_event(c.calendar_id,appointment.calendar_event_id,self._event_payload(appointment)); appointment.calendar_html_link=event.get("htmlLink",appointment.calendar_html_link)
            await self._persist_refreshed_token(c,client,commit=False); await self.db.commit()
        except Exception: await self.db.rollback()
    async def _client(self,c:CalendarConnection)->GoogleCalendarClient:
        client=GoogleCalendarClient(self._decrypt(c.access_token_encrypted),self._decrypt(c.refresh_token_encrypted) if c.refresh_token_encrypted else None)
        if c.token_expires_at and c.token_expires_at <= datetime.now(timezone.utc)+timedelta(minutes=1) and client.refresh_token:
            token=await client.refresh(); c.access_token_encrypted=self._encrypt(client.access_token); c.token_expires_at=_expiry(token.get("expires_in")); await self.db.flush()
        return client
    async def _persist_refreshed_token(self,c,client,*,commit=True):
        if self._decrypt(c.access_token_encrypted)!=client.access_token:c.access_token_encrypted=self._encrypt(client.access_token)
        if commit: await self.db.commit()
    @staticmethod
    def _event_payload(a:Appointment)->dict:
        p={"summary":a.title,"description":a.description or "Booked through MAYA Front Desk.","start":{"dateTime":_rfc3339(a.start_time)},"end":{"dateTime":_rfc3339(a.end_time)}}
        if a.location:p["location"]=a.location
        return p
    @staticmethod
    def _fernet()->Fernet:
        return Fernet(base64.urlsafe_b64encode(hashlib.sha256(settings.jwt_secret_key.encode()).digest()))
    @classmethod
    def _encrypt(cls,value:str)->str:return cls._fernet().encrypt(value.encode()).decode()
    @classmethod
    def _decrypt(cls,value:str)->str:return cls._fernet().decrypt(value.encode()).decode()
def _expiry(expires_in:int|str|None): return datetime.now(timezone.utc)+timedelta(seconds=int(expires_in)) if expires_in is not None else None
def _rfc3339(value:datetime)->str:
    if value.tzinfo is None:value=value.replace(tzinfo=timezone.utc)
    return value.isoformat()
