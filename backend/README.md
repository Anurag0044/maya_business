# MAYA Front Desk — Backend

## Implemented
- Phase A — FastAPI foundation
- Phase B — PostgreSQL/SQLAlchemy data layer
- Phase C — authentication and tenant authorization
- Phase D — application services and operational APIs
- Phase E — AI intent/context/RAG/tools/orchestration layer

## AI endpoints
- `POST /api/v1/ai/chat`
- `POST /api/v1/voice/session`
- `POST /api/v1/voice/message`

## AI architecture
Customer → Context → Intent → Agent → Retrieval/Tools → Services → Response

The AI layer remains provider-neutral. The production LLM and embedding provider
can be connected through adapters without changing business services.
