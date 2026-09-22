"""Quick sync test — no OpenAI SDK, no async, just httpx with a hard timeout."""
import json
import os
from dotenv import load_dotenv
import httpx

load_dotenv()

api_key = os.getenv("NVIDIA_API_KEY")
model   = os.getenv("NVIDIA_CHAT_MODEL")
url     = "https://integrate.api.nvidia.com/v1/chat/completions"

print(f"Key loaded : {bool(api_key)}")
print(f"Model      : {model}")
print(f"Calling    : {url}\n")

payload = {
    "model": model,
    "messages": [
        {"role": "user", "content": "Say hi in one word"},
    ],
    "max_tokens": 10,
    # no temperature — matches the curl that worked
}

try:
    r = httpx.post(
        url,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json=payload,
        timeout=30,   # hard 30-second limit
    )
    print(f"HTTP status: {r.status_code}\n")
    if r.status_code == 200:
        data = r.json()
        print("Response:", data["choices"][0]["message"]["content"])
    else:
        print("Error body:", r.text)
except httpx.TimeoutException:
    print("TIMED OUT after 30s — model is not responding")
except Exception as e:
    print("ERROR:", repr(e))
