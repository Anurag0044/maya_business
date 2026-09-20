# Phase D — Application Services

Implemented the service layer and connected API routes.

## Services

- Business Service
- Knowledge Service
- Lead Service
- Call Service
- Appointment Service
- Follow-up Service
- Notification Service
- Dashboard Service

## Important business rules now enforced

### Tenant isolation
Every service receives the authenticated user's `business_id` and queries operational
records within that tenant.

### Leads
Lead creation uses phone-based deduplication. A repeat enquiry updates the existing lead
instead of blindly creating another lead.

### Appointments
The service validates:
- end time must be after start time
- overlapping scheduled/confirmed appointments are rejected
- appointment cancellation, confirmation and rescheduling go through the service layer

### Calls
Call sessions are unique per `session_id`. Calls can record:
- lifecycle events
- transcripts
- outcome
- transfer state
- duration

### Follow-ups
Follow-ups have explicit lifecycle states and individual attempt records.

### Dashboard
Initial operational metrics:
- calls today
- total leads
- appointments today
- pending follow-ups
- lead status counts
- call status counts

## Next

Phase E — AI Layer:
- intent schemas/classifier
- conversation context
- RAG retrieval
- embedding adapter
- tool registry
- lead/appointment/knowledge tools
- human handoff
- agent orchestrator
