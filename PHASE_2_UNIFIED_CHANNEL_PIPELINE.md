# Phase 2 — Unified Customer Interaction Pipeline

## Goal

All customer channels enter one internal message contract and one MAYA
Conversation Engine. Channel/provider code must not contain business logic or
a second AI/RAG pipeline.

```text
Provider / Web Chat
        |
        v
Channel Adapter
        |
        v
NormalizedInboundMessage
        |
        v
ChannelGateway
        |
        v
ChannelMessageService
        |
        v
ConversationService
        |
        v
MAYA Agent / Intent / RAG / Memory / Tools
        |
        +--> transcript + channel_messages + lead intelligence
        |
        v
NormalizedOutboundMessage
        |
        v
Channel Adapter
        |
        v
Customer
```

## Implemented

### 1. Canonical channel contract

`backend/app/services/channels/types.py`

Every inbound message now carries:

- business ID
- channel
- external user ID
- message
- external message ID
- session ID
- provider
- optional customer identity hints
- message type
- attachments
- received timestamp
- raw event ID
- provider metadata

Every outbound message carries:

- business ID
- channel
- external user ID
- message
- conversation ID
- reply-to external message ID
- provider
- message type
- attachments
- metadata

### 2. Adapter boundary

`backend/app/services/channels/adapters/`

`ChannelAdapter` is the only boundary between provider payloads and MAYA.

Implemented adapters:

- `CHAT`
- `WEBSITE`

Reserved for later provider work:

- `WHATSAPP`
- `INSTAGRAM`
- `FACEBOOK`
- `SMS`
- `EMAIL`
- `VOICE`
- `LINKEDIN`

### 3. Single gateway

`backend/app/services/channels/gateway.py`

`ChannelGateway` provides:

- `normalize_inbound()`
- `receive()`
- `send()`

Provider webhook routers in later phases should call this gateway after
provider signature verification.

### 4. One AI path

`/api/v1/ai/chat` now enters `ChannelGateway` and then
`ChannelMessageService`.

There is no channel-specific AI pipeline.

The existing flow remains:

```text
inbound
  -> idempotency
  -> conversation
  -> MAYA
  -> transcript
  -> memory
  -> lead intelligence
  -> outbound channel record
```

### 5. Authenticated normalized-message test ingress

`POST /api/v1/channels/{channel}/messages`

This is for development/internal testing. It is authenticated and is NOT a
replacement for public provider webhooks.

It lets the team prove that a future WhatsApp/Instagram/SMS/etc. adapter can
feed the exact same pipeline.

### 6. Capability endpoint

`GET /api/v1/channels/capabilities`

Shows the complete channel contract and which adapters are currently
registered.

## Important boundary for Phase 3

Do not put Meta WhatsApp parsing, Graph API calls, webhook verification, or
WhatsApp-specific business logic into `ChannelMessageService`.

Phase 3 should add:

```text
Meta webhook
   -> WhatsApp adapter
   -> NormalizedInboundMessage
   -> ChannelGateway
   -> existing MAYA pipeline
```

and:

```text
MAYA
   -> NormalizedOutboundMessage
   -> WhatsApp adapter
   -> Meta Graph API
   -> customer
```

That means WhatsApp becomes a transport adapter, not another AI system.

## Phase 2 acceptance criteria

- [x] One canonical inbound message object
- [x] One canonical outbound message object
- [x] Adapter interface
- [x] Adapter registry
- [x] Channel gateway
- [x] Website/chat uses the gateway
- [x] Idempotency remains in the unified message service
- [x] Conversation persistence remains centralized
- [x] MAYA executes once per inbound message
- [x] Transcript/memory/lead intelligence remain centralized
- [x] No LangChain/LangGraph/n8n/MCP added to V1 core
- [x] WhatsApp can be plugged in without changing MAYA business logic
