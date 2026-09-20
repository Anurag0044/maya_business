#!/usr/bin/env bash
# =============================================================================
# MAYA Front Desk — Step 4: pgvector + Grants (interactive psql via Auth Proxy)
# Run from: GCP Cloud Shell immediately after provision.sh
# Owner: DevOps team
#
# Why pre-enable pgvector here (as postgres):
#   The Alembic migration 0001_initial_schema.py runs:
#     op.execute("CREATE EXTENSION IF NOT EXISTS vector")
#   For this to work, pgvector must already be available.
#   Pre-enabling as postgres means maya_app never needs SUPERUSER.
#   When Alembic runs, the extension already exists — it silently no-ops.
# =============================================================================
set -euo pipefail

PROJECT_ID="maya-frontdesk"
INSTANCE="maya-frontdesk-dev"
DB_NAME="maya_frontdesk"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  MAYA Front Desk — pgvector + DB Grants Setup        ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "This opens a psql session via Cloud SQL Auth Proxy."
echo "Copy and paste the SQL block shown below into the psql prompt."
echo ""
echo "────────────────── SQL TO RUN IN PSQL ──────────────────"
cat << 'SQL'
-- 1. Enable pgvector (so maya_app never needs SUPERUSER)
--    Alembic migration will find this already installed and no-op.
CREATE EXTENSION IF NOT EXISTS vector;
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

-- 2. Grant database access to the application user
GRANT ALL PRIVILEGES ON DATABASE maya_frontdesk TO maya_app;

-- 3. Grant schema-level access (required for Alembic CREATE TABLE)
GRANT ALL ON SCHEMA public TO maya_app;

-- 4. Grant on all future tables/sequences (so Alembic-created objects are accessible)
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO maya_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO maya_app;

-- 5. Confirm
\du maya_app

-- 6. Exit
\q
SQL
echo "────────────────────────────────────────────────────────"
echo ""
echo "You will be prompted for the postgres password (from provision.sh output)."
echo "Press ENTER to open psql..."
read -r

gcloud sql connect "$INSTANCE" \
  --user=postgres \
  --database="$DB_NAME" \
  --project="$PROJECT_ID"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ pgvector enabled, grants configured              ║"
echo "║  NEXT: Run secrets/store_secrets.sh                  ║"
echo "╚══════════════════════════════════════════════════════╝"
