from datetime import datetime, timezone

import pytest

from app.core.exceptions import AppException


def test_invalid_appointment_window_is_represented_by_app_exception():
    exc = AppException(
        "Appointment end time must be after start time",
        "INVALID_APPOINTMENT_TIME",
        422,
    )

    assert exc.error_code == "INVALID_APPOINTMENT_TIME"
    assert exc.status_code == 422
