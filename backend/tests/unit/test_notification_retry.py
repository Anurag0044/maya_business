import pytest

from app.services.notifications.service import NotificationService


class FakeDB:
    async def commit(self):
        pass

    async def refresh(self, notification):
        pass


@pytest.mark.asyncio
async def test_notification_failure_schedules_retry():
    """
    Verify that a failed notification delivery is moved back to
    PENDING and scheduled for a retry.
    """

    service = NotificationService(FakeDB())

    class FakeNotification:
        attempt_count = 1
        failed_at = None
        failure_reason = None
        delivery_status = "PROCESSING"
        scheduled_at = None

    notification = FakeNotification()

    await service._handle_failure(
        notification,
        "Test delivery failure",
    )

    assert notification.delivery_status == "PENDING"
    assert notification.failure_reason == "Test delivery failure"
    assert notification.failed_at is not None
    assert notification.scheduled_at is not None

@pytest.mark.asyncio
async def test_notification_failure_stops_after_max_attempts():
    """
    Verify that a notification becomes permanently FAILED
    after the maximum number of attempts.
    """

    service = NotificationService(FakeDB())

    class FakeNotification:
        attempt_count = 3
        failed_at = None
        failure_reason = None
        delivery_status = "PROCESSING"
        scheduled_at = None

    notification = FakeNotification()

    await service._handle_failure(
        notification,
        "Final test delivery failure",
    )

    assert notification.delivery_status == "FAILED"
    assert notification.failure_reason == "Final test delivery failure"
    assert notification.failed_at is not None
    assert notification.scheduled_at is None