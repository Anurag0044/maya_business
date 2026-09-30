# MAYA Front Desk — Notification Engine V1

## Purpose

The Notification Engine is the central communication infrastructure for MAYA Business. Other modules create notification requests; the engine owns targeting, channel selection, delivery state, read state, scheduling, and delivery audit history.

## V1 flow

```text
Business event
    ↓
NotificationService.create()
    ↓
Notification record
    ↓
Immediate IN_APP dispatch OR scheduled PENDING notification
    ↓
Channel registry
    ↓
InAppChannel (V1)
    ↓
Delivery status + NotificationAttempt
    ↓
Dashboard/API reads notification
    ↓
User marks READ
```

## Current channel

`IN_APP` is implemented and persisted in PostgreSQL.

The channel registry is intentionally separate from the service so future adapters can be added without changing business modules:

- WhatsApp — later
- SMS — later
- Email — later
- Instagram — later
- Voice — later

Those external channels are not implemented in V1 because they belong to the later communication-integration stage.

## Notification states

Read state:

- `UNREAD`
- `READ`

Delivery state:

- `PENDING`
- `PROCESSING`
- `SENT`
- `DELIVERED`
- `FAILED`
- `CANCELLED`

A notification can therefore be delivered while still unread. This separation is intentional.

## Main API

- `GET /api/v1/notifications`
- `GET /api/v1/notifications/count`
- `GET /api/v1/notifications/channels`
- `POST /api/v1/notifications`
- `GET /api/v1/notifications/{notification_id}`
- `GET /api/v1/notifications/{notification_id}/attempts`
- `POST /api/v1/notifications/{notification_id}/read`
- `POST /api/v1/notifications/{notification_id}/unread`
- `POST /api/v1/notifications/read-all`
- `POST /api/v1/notifications/{notification_id}/cancel`

## Follow-up integration

The Follow-up Worker creates an `IN_APP` notification when a follow-up becomes due. It only marks the follow-up attempt successful when notification delivery reports `SENT` or `DELIVERED`.

## Background worker

`app/services/notifications/worker.py` checks every 30 seconds for scheduled notifications whose `scheduled_at` has arrived. This gives the engine a scheduling mechanism without coupling scheduling logic to a communication provider.
