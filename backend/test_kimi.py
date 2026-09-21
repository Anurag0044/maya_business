import asyncio

from app.ai.providers.llm import get_llm_provider


async def main():
    provider = get_llm_provider()

    print("Provider:", type(provider).__name__)

    response = await provider.generate(
        system_prompt="You are MAYA.",
        user_prompt="Reply with exactly: KIMI CONNECTION WORKING",
        temperature=0.0,
    )

    print("Response:")
    print(response)


if __name__ == "__main__":
    asyncio.run(main())