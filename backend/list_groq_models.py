import os
from dotenv import load_dotenv
import httpx

load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

r = httpx.get(
    "https://api.groq.com/openai/v1/models",
    headers={"Authorization": f"Bearer {api_key}"}
)

if r.status_code == 200:
    print("Available Groq Models:")
    for model in r.json()["data"]:
        print(f"- {model['id']}")
else:
    print(f"Error fetching models: {r.status_code}\n{r.text}")
