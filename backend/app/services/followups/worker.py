import asyncio
from datetime import datetime, timezone

from app.db.session import AsyncSessionLocal
from app.services.followups.service import FollowupService
from app.services.notifications.service import NotificationService


WORKER_INTERVAL_SECONDS = 60
BATCH_SIZE = 100


async def _process_followup(followup) -> None:
    """
    Process one due follow-up.

    V1 execution channel:
        INTERNAL notification

    Later this execution layer can dispatch to:
        WhatsApp
        SMS
        Email
        Voice
    """

    async with AsyncSessionLocal() as db:
        followup_service = FollowupService(db)
        notification_service = NotificationService(db)

        try:
            # --------------------------------------------------
            # Create an attempt
            # --------------------------------------------------

            attempt = await followup_service.add_attempt(
                followup.business_id,
                followup.id,
                channel="INTERNAL",
                status="STARTED",
                notes="Follow-up worker started processing.",
            )

            # --------------------------------------------------
            # V1 execution
            # --------------------------------------------------
            # We currently don't have WhatsApp/SMS/Voice
            # connected, so create an internal notification.
            # --------------------------------------------------

            notification = await notification_service.create(
                followup.business_id,
                title="Follow-up Due",
                message=(
                    "A customer follow-up is due. "
                    f"Lead ID: {followup.lead_id}"
                ),
                notification_type="FOLLOWUP_DUE",
                channel="IN_APP",
                related_entity_type="FOLLOWUP",
                related_entity_id=followup.id,
            )

            if notification.delivery_status not in {"SENT", "DELIVERED"}:
                raise RuntimeError(
                    "Follow-up notification delivery failed: "
                    f"{notification.failure_reason or notification.delivery_status}"
                )

            # --------------------------------------------------
            # Mark attempt successful
            # --------------------------------------------------

            await followup_service.add_attempt(
                followup.business_id,
                followup.id,
                attempt_number=attempt.attempt_number,
                channel="INTERNAL",
                status="SUCCESS",
                notes="Internal follow-up notification created.",
            )

            # --------------------------------------------------
            # Complete follow-up
            # --------------------------------------------------

            await followup_service.complete(
                followup.business_id,
                followup.id,
            )

        except Exception as exc:
            # --------------------------------------------------
            # Failure must not kill the worker.
            # --------------------------------------------------

            try:
                await followup_service.add_attempt(
                    followup.business_id,
                    followup.id,
                    channel="INTERNAL",
                    status="FAILED",
                    notes=f"Follow-up processing failed: {exc}",
                )
            except Exception:
                pass


async def followup_worker(stop_event: asyncio.Event) -> None:
    """
    Continuously process due follow-ups.

    The worker checks every 60 seconds.
    """

    while not stop_event.is_set():

        try:
            async with AsyncSessionLocal() as db:
                service = FollowupService(db)

                # --------------------------------------------------
                # Find every business that has due follow-ups.
                # --------------------------------------------------

                from sqlalchemy import select
                from app.models.business import Business

                result = await db.scalars(
                    select(Business.id).where(
                        Business.is_active.is_(True)
                    )
                )

                business_ids = list(result)

                # --------------------------------------------------
                # Process due follow-ups business by business.
                # --------------------------------------------------

                for business_id in business_ids:

                    due_followups = await service.get_due_followups(
                        business_id,
                        now=datetime.now(timezone.utc),
                        limit=BATCH_SIZE,
                    )

                    print(
                        f"[FOLLOWUP WORKER] "
                        f"business={business_id} "
                        f"due_count={len(due_followups)}"
                    )

                    

                    for followup in due_followups:
                        await _process_followup(followup)

        except Exception as exc:
            print(f"[FOLLOWUP WORKER ERROR] {type(exc).__name__}: {exc}")

        # ------------------------------------------------------
        # Sleep until the next cycle.
        # ------------------------------------------------------

        try:
            await asyncio.wait_for(
                stop_event.wait(),
                timeout=WORKER_INTERVAL_SECONDS,
            )
        except asyncio.TimeoutError:
            continue