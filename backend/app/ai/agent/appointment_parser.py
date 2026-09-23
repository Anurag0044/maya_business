from __future__ import annotations

import re
from datetime import datetime
from zoneinfo import ZoneInfo


WEEKDAYS = {
    "monday": 0,
    "tuesday": 1,
    "wednesday": 2,
    "thursday": 3,
    "friday": 4,
    "saturday": 5,
    "sunday": 6,
}


def _infer_hour_without_meridiem(hour: int) -> int:
    """
    Infer AM/PM when the customer gives a simple business-time expression
    such as "today at 4".

    V1 assumption:
    - 1–6  -> PM
    - 7–11 -> AM
    - 12   -> PM

    This is only a temporary conversational heuristic.
    Later this should use the business's configured working hours.
    """

    if 1 <= hour <= 6:
        return hour + 12

    if 7 <= hour <= 11:
        return hour

    if hour == 12:
        return 12

    raise ValueError("Invalid hour")


def parse_appointment_datetime(
    message: str,
    *,
    timezone: str = "Asia/Kolkata",
) -> datetime | None:

    text = message.lower().strip()

    # ---------------------------------------------------------
    # TIME
    # Supports:
    #   5 PM
    #   5:30 PM
    #   5 pm
    #   5
    #   5:30
    # ---------------------------------------------------------

    time_match = re.search(
        r"\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b",
        text,
    )

    if not time_match:
        return None

    hour = int(time_match.group(1))
    minute = int(time_match.group(2) or 0)
    meridiem = time_match.group(3)

    if hour < 1 or hour > 12:
        return None

    if minute < 0 or minute > 59:
        return None

    # ---------------------------------------------------------
    # CONVERT TO 24-HOUR FORMAT
    # ---------------------------------------------------------

    if meridiem == "pm":
        if hour != 12:
            hour += 12

    elif meridiem == "am":
        if hour == 12:
            hour = 0

    else:
        # No AM/PM supplied.
        # Use business-hours conversational heuristic.
        try:
            hour = _infer_hour_without_meridiem(hour)
        except ValueError:
            return None

    # ---------------------------------------------------------
    # TIMEZONE
    # ---------------------------------------------------------

    try:
        tz = ZoneInfo(timezone)
    except Exception:
        return None

    now = datetime.now(tz)

    # ---------------------------------------------------------
    # DETERMINE DATE
    # ---------------------------------------------------------

    if "day after tomorrow" in text:

        target_date = now.date()
        from datetime import timedelta

        target_date = target_date + timedelta(days=2)

    elif "tomorrow" in text:

        from datetime import timedelta

        target_date = now.date() + timedelta(days=1)

    elif "today" in text:

        target_date = now.date()

    else:

        # -----------------------------------------------------
        # WEEKDAY
        # -----------------------------------------------------

        target_date = None

        for weekday_name, weekday_number in WEEKDAYS.items():

            if weekday_name in text:

                days_ahead = (
                    weekday_number - now.weekday()
                ) % 7

                # If the requested weekday is today,
                # interpret it as the next occurrence.
                if days_ahead == 0:
                    days_ahead = 7

                from datetime import timedelta

                target_date = (
                    now.date()
                    + timedelta(days=days_ahead)
                )

                break

        if target_date is None:
            return None

    # ---------------------------------------------------------
    # BUILD DATETIME
    # ---------------------------------------------------------

    return datetime(
        target_date.year,
        target_date.month,
        target_date.day,
        hour,
        minute,
        tzinfo=tz,
    )

def parse_appointment_datetime_from_conversation(
    message: str,
    conversation: str,
    *,
    timezone: str = "Asia/Kolkata",
) -> datetime | None:
    """
    Parse an appointment datetime using the current message plus
    recent conversation context.

    Example:

        Previous: "I want an appointment tomorrow."
        Current:  "around 5"

    Result:
        tomorrow at 5 PM
    """

    # First try the current message by itself.
    result = parse_appointment_datetime(
        message,
        timezone=timezone,
    )

    if result is not None:
        return result

    # If the current message only contains a time,
    # use the recent conversation to recover the date.
    combined_text = f"{conversation} {message}"

    return parse_appointment_datetime(
        combined_text,
        timezone=timezone,
    )