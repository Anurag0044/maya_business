"""Compatibility exports for the calendar integration.

The Google implementation lives in ``google.py``.  This module is kept so
existing imports of ``app.integrations.calendar.client`` remain valid.
"""

from app.integrations.calendar.google import GoogleCalendarClient

__all__ = ["GoogleCalendarClient"]
