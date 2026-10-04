from __future__ import annotations
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import urlencode, quote
import httpx
import jwt
from app.core.config import settings
GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"
SCOPES = ("openid", "email", "profile", "https://www.googleapis.com/auth/calendar")
class GoogleCalendarClient:
    def __init__(self, access_token: str, refresh_token: str | None = None): self.access_token, self.refresh_token = access_token, refresh_token
    @staticmethod
    def authorization_url(state: str) -> str:
        if not settings.google_calendar_client_id or not settings.google_calendar_redirect_uri: raise RuntimeError("Google Calendar OAuth is not configured")
        params={"client_id":settings.google_calendar_client_id,"redirect_uri":settings.google_calendar_redirect_uri,"response_type":"code","scope":" ".join(SCOPES),"access_type":"offline","prompt":"consent","include_granted_scopes":"true","state":state}
        return f"{GOOGLE_AUTHORIZE_URL}?{urlencode(params)}"
    @staticmethod
    def make_state(business_id: str, user_id: str) -> str:
        return jwt.encode({"business_id":business_id,"user_id":user_id,"purpose":"google-calendar-connect","exp":datetime.now(timezone.utc)+timedelta(minutes=10)}, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    @staticmethod
    def decode_state(state: str) -> dict[str, Any]:
        payload=jwt.decode(state, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        if payload.get("purpose") != "google-calendar-connect": raise ValueError("Invalid OAuth state purpose")
        return payload
    @staticmethod
    async def exchange_code(code: str) -> dict[str, Any]:
        if not settings.google_calendar_client_id or not settings.google_calendar_client_secret: raise RuntimeError("Google Calendar OAuth credentials are not configured")
        return await _request("POST", GOOGLE_TOKEN_URL, data={"code":code,"client_id":settings.google_calendar_client_id,"client_secret":settings.google_calendar_client_secret,"redirect_uri":settings.google_calendar_redirect_uri,"grant_type":"authorization_code"})
    async def refresh(self) -> dict[str, Any]:
        if not self.refresh_token: raise RuntimeError("Google refresh token is not available")
        response=await _request("POST", GOOGLE_TOKEN_URL, data={"client_id":settings.google_calendar_client_id,"client_secret":settings.google_calendar_client_secret,"refresh_token":self.refresh_token,"grant_type":"refresh_token"})
        self.access_token=response["access_token"]; return response
    async def userinfo(self) -> dict[str, Any]: return await self._request_api("GET", GOOGLE_USERINFO_URL)
    async def list_events(self, calendar_id: str="primary", *, time_min: datetime|None=None, time_max: datetime|None=None, max_results: int=50) -> dict[str, Any]:
        params={"singleEvents":"true","orderBy":"startTime","maxResults":max(1,min(max_results,2500))}
        if time_min: params["timeMin"]=_google_datetime(time_min)
        if time_max: params["timeMax"]=_google_datetime(time_max)
        return await self._request_api("GET",f"{GOOGLE_CALENDAR_API}/calendars/{quote(calendar_id,safe='')}/events",params=params)
    async def create_event(self, calendar_id: str, event: dict[str,Any]) -> dict[str,Any]: return await self._request_api("POST",f"{GOOGLE_CALENDAR_API}/calendars/{quote(calendar_id,safe='')}/events",json=event)
    async def update_event(self, calendar_id: str, event_id: str, event: dict[str,Any]) -> dict[str,Any]: return await self._request_api("PATCH",f"{GOOGLE_CALENDAR_API}/calendars/{quote(calendar_id,safe='')}/events/{quote(event_id,safe='')}",json=event)
    async def delete_event(self, calendar_id: str, event_id: str) -> None: await self._request_api("DELETE",f"{GOOGLE_CALENDAR_API}/calendars/{quote(calendar_id,safe='')}/events/{quote(event_id,safe='')}")
    async def _request_api(self, method: str, url: str, **kwargs) -> dict[str,Any]:
        headers=kwargs.pop("headers",{}); headers["Authorization"]=f"Bearer {self.access_token}"; headers.setdefault("Accept","application/json")
        try: return await _request(method,url,headers=headers,**kwargs)
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code==401 and self.refresh_token:
                await self.refresh(); headers["Authorization"]=f"Bearer {self.access_token}"; return await _request(method,url,headers=headers,**kwargs)
            raise
async def _request(method: str, url: str, **kwargs) -> dict[str,Any]:
    async with httpx.AsyncClient(timeout=httpx.Timeout(20.0,connect=10.0)) as client:
        response=await client.request(method,url,**kwargs); response.raise_for_status()
        if response.status_code==204 or not response.content: return {}
        return response.json()
def _google_datetime(value: datetime) -> str:
    if value.tzinfo is None: value=value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat().replace("+00:00","Z")
