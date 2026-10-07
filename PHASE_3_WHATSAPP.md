# Phase 3 — WhatsApp Cloud API

## Goal

Connect real Meta WhatsApp Cloud API traffic to the Phase 2 unified channel
pipeline:

```text
Customer WhatsApp
    -> Meta Cloud API
    -> MAYA webhook
    -> signature verification
    -> WhatsApp adapter
    -> NormalizedInboundMessage
    -> ChannelGateway
    -> ChannelMessageService
    -> MAYA
    -> NormalizedOutboundMessage
    -> WhatsApp adapter
    -> Meta Graph API
    -> Customer WhatsApp
```

## Implemented

### 1. Business-specific WhatsApp connection

`app/models/whatsapp_connection.py`

Stores:

- business
- Meta phone number ID
- WhatsApp Business Account ID
- display phone number
- encrypted access token
- active state
- metadata

Access tokens are encrypted with the same Fernet strategy already used by
the calendar integration.

### 2. Connection management

Authenticated owner/admin endpoints:

```text
PUT /api/v1/whatsapp/connection
GET /api/v1/whatsapp/connection
```

The access token is accepted only over the authenticated API and is never
returned by the status endpoint.

### 3. Meta client

`app/integrations/whatsapp/client.py`

Supports:

- Meta Graph API text-message sending
- configurable Graph API version
- request timeout
- access-token authorization
- `X-Hub-Signature-256` verification

### 4. WhatsApp adapter

`app/services/channels/adapters/whatsapp.py`

Converts Meta webhook messages into the existing canonical contract.

It captures:

- WhatsApp sender ID
- external Meta message ID
- sender display name
- phone/wa_id
- timestamp
- text body
- message type
- basic attachment metadata
- Meta phone number ID
- raw event ID

Supported inbound message types are normalized into the existing
`MessageType` enum. Text is the fully supported V1 processing path.

### 5. Public Meta webhook

```text
GET  /api/v1/webhooks/whatsapp
POST /api/v1/webhooks/whatsapp
```

GET performs Meta's verification challenge.

POST:

1. reads the raw body
2. verifies `X-Hub-Signature-256`
3. parses the WhatsApp Business Account event
4. maps `phone_number_id` to a MAYA business
5. normalizes each message
6. sends it through Phase 2
7. ignores status-only events for AI processing
8. updates outbound message delivery status

### 6. Outbound delivery

The unified gateway now delivers a generated response through the registered
channel adapter.

For WhatsApp:

```text
MAYA response
    -> NormalizedOutboundMessage
    -> WhatsApp adapter
    -> Meta Graph API
```

The provider message ID is stored on `channel_messages`.

### 7. Delivery status tracking

Meta status events update the outbound record:

```text
SENT
DELIVERED
READ
FAILED
```

### 8. Idempotency

The existing Phase 2 idempotency mechanism remains unchanged.

Meta's message ID becomes:

```text
external_message_id
```

so webhook retries cannot execute MAYA twice.

## Environment variables

Add these to the real backend `.env`:

```text
WHATSAPP_GRAPH_API_BASE=https://graph.facebook.com
WHATSAPP_GRAPH_API_VERSION=<Meta Graph API version enabled for your app>
WHATSAPP_APP_SECRET=<Meta App Secret>
WHATSAPP_WEBHOOK_VERIFY_TOKEN=<random private webhook verification token>
WHATSAPP_HTTP_TIMEOUT_SECONDS=20
WHATSAPP_HTTP_CONNECT_TIMEOUT_SECONDS=10
```

The business-specific access token is stored through:

```text
PUT /api/v1/whatsapp/connection
```

Do not commit `.env` or Meta secrets.

## Database migration

New migration:

```text
b2c3d4e5f6a7_phase3_whatsapp.py
```

It creates:

```text
whatsapp_connections
```

Run:

```powershell
alembic upgrade head
```

## Meta setup sequence

1. Create/configure the Meta developer app and WhatsApp Business Platform.
2. Configure the webhook callback URL:
   `https://<public-host>/api/v1/webhooks/whatsapp`
3. Set the exact `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
4. Subscribe the WhatsApp Business Account to the webhook.
5. Obtain the phone number ID and access token.
6. Connect that number to the MAYA business with:
   `PUT /api/v1/whatsapp/connection`.
7. Send a real WhatsApp text message to the connected number.
8. Confirm:
   WhatsApp -> MAYA -> Meta -> WhatsApp.

## Phase 3 acceptance criteria

- [x] Meta credentials have a business-specific storage model
- [x] Access token encrypted at rest
- [x] Meta webhook verification
- [x] X-Hub-Signature-256 verification
- [x] phone_number_id -> MAYA business mapping
- [x] WhatsApp -> normalized inbound message
- [x] normalized message -> existing Phase 2 pipeline
- [x] MAYA executes once per external message ID
- [x] MAYA response -> normalized outbound message
- [x] outbound text -> Meta Graph API
- [x] provider message ID persisted
- [x] sent/delivered/read/failed status updates
- [x] no separate WhatsApp AI/RAG system
- [x] no LangChain/LangGraph/n8n/MCP added to V1 core

## Remaining real-world validation

The code is implemented, but production connectivity cannot be claimed until
the Meta developer configuration and real credentials are supplied and a
real webhook round trip is tested.

The first real acceptance test is:

```text
Real WhatsApp "Hello"
    -> Meta
    -> MAYA webhook
    -> MAYA
    -> Meta
    -> WhatsApp reply
```
