import asyncio

from sqlalchemy import text
from app.db.session import engine


async def main():
    async with engine.connect() as conn:
        database = await conn.scalar(
            text("SELECT current_database()")
        )

        version = await conn.scalar(
            text("SELECT version()")
        )

        print("DATABASE:", database)
        print("POSTGRES:", version)

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())