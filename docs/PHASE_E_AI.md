# Phase E — AI Layer

Implemented the first provider-neutral AI layer.

## Components

- Intent enum and structured intent result
- Deterministic V1 intent classifier
- Conversation context
- Agent decision schema
- Embedding provider interface
- Placeholder embedding adapter
- Tenant-aware knowledge retrieval
- Lexical V1 retrieval fallback
- Result ranking
- Tool registry
- Knowledge tools
- Lead tools
- Appointment tools
- Follow-up tools
- Human handoff tool
- System/receptionist/appointment/handoff prompts
- Agent orchestrator
- Voice session + message bridge
- Authenticated `/api/v1/ai/chat` test endpoint

## Important boundary

The LLM/agent does not write directly to PostgreSQL.

AI actions must flow through:

`Agent → Tool → Service → Model/DB`

## LLM provider boundary

The answer-generation path now goes through a provider-neutral `LLMProvider` interface.
V1 is configured for NVIDIA NIM's OpenAI-compatible Kimi K3 endpoint:

`moonshotai/kimi-k3` via `https://integrate.api.nvidia.com/v1`

Provider-specific SDK/base-URL/model details stay inside `app/ai/providers/llm.py`.
This keeps MAYA Business Intelligence independent of the current model provider and
allows a future local/self-hosted provider without rewriting the agent layer.

OpenAI remains available as an optional adapter and is still used by the current
embedding path.

## Current V1 retrieval

The retrieval layer uses a lightweight lexical fallback so the backend can operate
without selecting a production embedding provider.

The embedding interface is already isolated. A production provider can be plugged
in later without redesigning the agent.

## Human handoff

The agent can return a `HUMAN_HANDOFF` decision when:
- the customer explicitly asks for a human,
- verified knowledge is unavailable,
- confidence is too low.

## Next

Phase F — Voice Integration:
- complete voice session lifecycle
- `/voice/action`
- `/voice/end`
- call event integration
- actual Mamta Voice Engine client boundary
- transcript persistence
- transfer/handoff signaling
