# MAYA Front Desk — Infrastructure Runbook

**Owner:** DevOps team · **Branch:** backend · **Environment:** dev  
**Stack:** GCP Cloud SQL (PostgreSQL 15 + pgvector) · Cloud Run · Secret Manager · IAM Auth Proxy

---

## Quick Reference

| Parameter | Value |
|-----------|-------|
| GCP Project | `maya-frontdesk` |
| Region | `asia-south1` (Mumbai) |
| Cloud SQL Instance | `maya-frontdesk-dev` |
| Database | `maya_frontdesk` |
| App user | `maya_app` |
| Connection name | `maya-frontdesk:asia-south1:maya-frontdesk-dev` |
| Cloud Run SA | `maya-cloudrun-sa@maya-frontdesk.iam.gserviceaccount.com` |
| Secret: DATABASE_URL | `maya-database-url` (asyncpg + Unix socket) |
| Secret: Password only | `maya-db-password` (for scripts) |

---

## Architecture

```
Cloud Shell ──Auth Proxy──► Cloud SQL PostgreSQL 15
                            (maya_frontdesk / maya_app / pgvector)
Cloud Run ───Auth Proxy──►  (built-in, Unix socket, --add-cloudsql-instances)
                ▲
          DATABASE_URL injected from Secret Manager (maya-database-url)
```

**No public IP. No Authorized Networks. IAM is the only access control.**

---

## Execution Order (GCP Cloud Shell)

```bash
# Step 1–3
bash infra/cloud-sql/provision.sh

# Step 4: enables pgvector as postgres (interactive psql)
bash infra/cloud-sql/setup_db.sh

# Step 5: store DATABASE_URL + password in Secret Manager
bash infra/secrets/store_secrets.sh

# Step 6–7: Cloud Run SA + developer access
bash infra/cloud-run/service-account-setup.sh

# Step 8: health check
bash infra/cloud-sql/verify_connection.sh
```

**Then hand `infra/cloud-sql/run_migrations.sh` to the backend developer.**

---

## Developer Connection (backend developer)

```bash
# From GCP Cloud Shell with roles/cloudsql.client granted:
bash infra/cloud-sql/run_migrations.sh
# Runs: alembic upgrade head (from backend/ directory)
# Creates: all 17 application tables
# pgvector: already enabled — migration's CREATE EXTENSION IF NOT EXISTS vector no-ops
```

DATABASE_URL formats (see `backend/.env.example` for full docs):
- **Local dev:** `postgresql+asyncpg://postgres:postgres@localhost:5432/maya_frontdesk`
- **Cloud Shell:** `postgresql+asyncpg://maya_app:PASSWORD@127.0.0.1:5432/maya_frontdesk`
- **Cloud Run:** `postgresql+asyncpg://maya_app:PASSWORD@/maya_frontdesk?host=/cloudsql/maya-frontdesk:asia-south1:maya-frontdesk-dev`

---

## Security

- `0.0.0.0/0` is **never** added to Authorized Networks
- No public IP (`--no-assign-ip`)
- App connects as `maya_app`, not `postgres`
- Credentials live in Secret Manager — never in source code
- `infra/**/*.env`, `*.key` are gitignored

---

## Backup Policy

| Setting | Value |
|---------|-------|
| Automated backups | Enabled |
| Window | 02:00–04:00 IST (20:30 UTC) |
| Retention | 7 days |
| Point-in-time recovery | Enabled (7-day log retention) |

```bash
# Manual backup before a risky migration:
gcloud sql backups create \
  --instance=maya-frontdesk-dev \
  --description="pre-migration-$(date +%Y%m%d)" \
  --project=maya-frontdesk
```
