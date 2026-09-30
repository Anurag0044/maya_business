import asyncio

from app.db.session import AsyncSessionLocal
from app.services.notifications.service import NotificationService

WORKER_INTERVAL_SECONDS = 30
BATCH_SIZE = 100


async def notification_worker(stop_event: asyncio.Event) -> None:
    """Dispatch scheduled notifications without blocking the API process."""
    while not stop_event.is_set():
        try:
            async with AsyncSessionLocal() as db:
                processed = await NotificationService(db).process_due(limit=BATCH_SIZE)
                if processed:
                    print(f"[NOTIFICATION WORKER] processed={processed}")
        except Exception as exc:
            print(
                f"[NOTIFICATION WORKER ERROR] "
                f"{type(exc).__name__}: {exc}"
            )

        try:
            await asyncio.wait_for(
                stop_event.wait(),
                timeout=WORKER_INTERVAL_SECONDS,
            )
        except asyncio.TimeoutError:
            continue
