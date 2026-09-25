# MAYA Front Desk — Data Retention & Privacy

## Durable data

The following business/customer intelligence is retained until the business explicitly deletes it or the product's account/data-deletion policy removes it:

- Business configuration and approved knowledge/RAG documents.
- Lead/customer profile: name, phone, email, source, interest, status, priority, assignment and business notes.
- Customer intelligence summary and structured customer intelligence stored on the lead.
- Appointment records and appointment status.
- Follow-up state and operational history.
- Non-content operational call metadata may remain for analytics, but personal caller identity is anonymized when call content reaches retention expiry.

## Temporary data

The following are conversation working-memory data and are retained only for the configured conversation-retention period (default: 90 days):

- Full conversation messages/transcripts.
- Conversation chunks used for bounded historical retrieval.
- Detailed conversation working summaries.
- Temporary conversation structured state stored with the conversation record.
- Voice call transcripts and call events.

When temporary retention expires, conversation records cascade-delete their messages and chunks. Old voice transcripts/events are deleted and caller identity is anonymized on the retained operational call row.

## Retention settings

Each business has `conversation_retention_days`, defaulting to 90 days. Owners/admins can change it from Business Settings. Applying a shorter retention period immediately removes conversations already outside the new window.

## Manual deletion

Business owners can:

- delete one conversation's history;
- delete a lead/customer's conversation history;
- delete all conversation history for the business;
- delete a customer/lead and its durable customer intelligence.

Customer-data deletion first removes/anonymizes associated conversation and voice content, then removes the durable lead record. Appointment records are not automatically deleted solely because a lead is deleted; their lead reference is nullable by design.

## Architecture rule

`conversation_summary` is temporary working memory. `customer_intelligence_summary` and `customer_intelligence` on the lead are durable business intelligence and must not be removed by the normal conversation-retention cleanup job.

## Automatic cleanup

The API starts a background retention worker that checks every six hours. The cleanup is idempotent and only removes data past its retention boundary. A protected manual cleanup endpoint is also available for operational/admin use.

For horizontally scaled production deployments, the same cleanup service should also be invoked by a scheduled Cloud Scheduler/Cloud Run job so cleanup does not depend on an individual API instance staying alive.
