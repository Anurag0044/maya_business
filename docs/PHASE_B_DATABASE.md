# Phase B — Database Models

Implemented the V1 data layer for the 17-table architecture.

## Tables
1. businesses
2. users
3. business_settings
4. business_hours
5. knowledge_documents
6. knowledge_chunks
7. faqs
8. courses
9. leads
10. lead_activities
11. calls
12. call_transcripts
13. call_events
14. appointments
15. followups
16. followup_attempts
17. notifications

## Important design decisions
- UUID primary keys.
- PostgreSQL is the target database.
- `business_id` provides tenant isolation on operational tables.
- `knowledge_chunks.embedding` uses pgvector with dimension 1536.
- Foreign keys use explicit delete behavior.
- High-use fields have indexes for tenant, status, phone, time and relationship lookups.
- Alembic migration `0001_initial_schema` creates the initial schema and enables pgvector.

## Next
Phase C — Authentication:
- registration
- login
- password hashing
- JWT access token
- current-user dependency
- role/tenant authorization
- refresh-token strategy
