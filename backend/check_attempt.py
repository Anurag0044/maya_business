import asyncio

from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.followup import FollowupAttempt


FOLLOWUP_ID = "64d7c2e4-cf28-4e8b-9492-3d1fdee38e1c"

async def main():
    async with AsyncSessionLocal() as db:
        result = await db.scalars(
            select(FollowupAttempt)
            .where(FollowupAttempt.followup_id == FOLLOWUP_ID)
            .order_by(FollowupAttempt.attempt_number)
        )

        attempts = list(result)

        for attempt in attempts:
            print(
                "ID:", attempt.id,
                "| Number:", attempt.attempt_number,
                "| Channel:", attempt.channel,
                "| Status:", attempt.status,
                "| Notes:", attempt.notes,
                "| Time:", attempt.attempted_at,
            )

        print("TOTAL ATTEMPTS:", len(attempts))


asyncio.run(main())