# MAYA Front Desk — Infrastructure Runbook

**Owner:** Anurag (DevOps)
**Stack:** GCP Cloud SQL (PostgreSQL 15 + pgvector) + Cloud Run + Secret Manager

## Quick Reference

| Parameter | Value |
|-----------|-------|
| Project | `maya-frontdesk` |
| Region | `asia-south1` (Mumbai) |
| Cloud SQL Instance | `maya-frontdesk-dev` |
| Database | `maya_frontdesk` |
| App user | `maya_app` |
| Connection name | `maya-frontdesk:asia-south1:maya-frontdesk-dev` |
| Cloud Run SA | `maya-cloudrun-sa@maya-frontdesk.iam.gserviceaccount.com` |

## Architecture
- Cloud Shell → Auth Proxy → PostgreSQL (migrations / dev queries)
- Cloud Run → Cloud SQL Connector (Unix socket) → PostgreSQL (production app)
- No public IP on Cloud SQL. No Authorized Networks. IAM controls all access.

## Run order (from GCP Cloud Shell)
```
1. cloud-sql/provision.sh
2. cloud-sql/setup_db.sh          # opens psql for SQL grants + pgvector
3. secrets/store_secrets.sh
4. cloud-run/service-account-setup.sh
5. cloud-sql/verify_connection.sh  # health check
```

## Alembic migrations (Siddharth)
See `cloud-sql/alembic_migration_guide.sh` for the step-by-step migration workflow.

## .gitignore rules
```
infra/secrets/*.json
infra/**/*.env
*.key
```
