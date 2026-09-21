import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("NVIDIA_API_KEY")

invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Accept": "text/event-stream",
    "Content-Type": "application/json",
}

payload = {
    "messages": [
        {
            "role": "user",
            "content": "Reply with exactly: KIMI CONNECTION WORKING"
        }
    ],
    "model": "moonshotai/kimi-k3",
    "max_tokens": 100,
    "temperature": 1,
    "reasoning_effort": "low",
    "stream": True,
}

print("Calling NVIDIA Kimi K3...")
print("Endpoint:", invoke_url)
print("API key loaded:", bool(api_key))

try:
    response = requests.post(
        invoke_url,
        headers=headers,
        json=payload,
        stream=True,
        timeout=60,
    )

    print("HTTP status:", response.status_code)

    if response.status_code != 200:
        print("NVIDIA error:")
        print(response.text)
        raise SystemExit(1)

    print("Connected to Kimi K3.")
    print("Response:")

    for line in response.iter_lines():
        if line:
            print(line.decode("utf-8"))

except requests.exceptions.Timeout:
    print("ERROR: NVIDIA request timed out.")

except requests.exceptions.RequestException as e:
    print("ERROR:", repr(e))