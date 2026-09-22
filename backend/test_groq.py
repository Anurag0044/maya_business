import asyncio
import sys

from app.core.config import settings
from app.ai.providers.llm import get_llm_provider

async def main():
    print("--------------------------------------------------")
    print(f"Active Provider : {settings.llm_provider.upper()}")
    
    if settings.llm_provider == "groq":
        print(f"Model           : {settings.groq_chat_model}")
        if "paste-your-groq" in (settings.groq_api_key or ""):
            print("\n❌ ERROR: You haven't pasted your Groq API key into the .env file yet.")
            print("   Go to https://console.groq.com/keys, get a key, and update backend/.env")
            sys.exit(1)
    
    print("--------------------------------------------------\n")
    print("Initializing provider...")
    
    try:
        provider = get_llm_provider()
    except Exception as e:
        print(f"❌ Failed to load provider: {e}")
        sys.exit(1)

    if not provider:
        print("❌ Provider returned None. Check your API keys in .env")
        sys.exit(1)

    print("Sending request to LLM (asking it to introduce itself)...")
    
    system_prompt = "You are MAYA, a helpful front desk AI for a business. Keep your answer to 2 sentences."
    user_prompt = "Hello! Who are you and what model is powering you?"

    try:
        # Time the request
        import time
        start_time = time.time()
        
        response = await provider.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.2
        )
        
        elapsed = time.time() - start_time
        
        print("\n✅ SUCCESS! Response received:")
        print(f"Time taken : {elapsed:.2f} seconds")
        print("--------------------------------------------------")
        print(response)
        print("--------------------------------------------------")
        
    except Exception as e:
        print(f"\n❌ ERROR during generation: {e}")

if __name__ == "__main__":
    asyncio.run(main())
