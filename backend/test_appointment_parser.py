from app.ai.agent.appointment_parser import parse_appointment_datetime


tests = [
    "Tomorrow at 5 PM.",
    "Today at 3 PM.",
    "Friday at 10 AM.",
    "Monday at 4:30 PM.",
]


for message in tests:
    result = parse_appointment_datetime(message)

    print(message)
    print("  ->", result)
    print()