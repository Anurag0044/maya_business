from pydantic import BaseModel


class DashboardOverview(BaseModel):
    calls_today: int
    leads_total: int
    appointments_today: int
    pending_followups: int


class StatusCount(BaseModel):
    status: str
    count: int
