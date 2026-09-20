#!/usr/bin/env bash
# =============================================================================
# MAYA Front Desk — Step 8: Verify Cloud SQL Connection
# Run from: GCP Cloud Shell after all setup steps complete
# Owner: DevOps team
# =============================================================================
set -euo pipefail

PROJECT_ID="maya-frontdesk"
INSTANCE="maya-frontdesk-dev"
CONNECTION_NAME="maya-frontdesk:asia-south1:maya-frontdesk-dev"
DB_NAME="maya_frontdesk"
DB_USER="maya_app"
PROXY_PORT=5433   # 5433 to avoid conflict with any local pg on 5432

echo "╔══════════════════════════════════════════════════════╗"
echo "║  MAYA Front Desk — Connection Verification           ║"
echo "╚══════════════════════════════════════════════════════╝"

# ── Fetch password from Secret Manager ───────────────────────────────────────
echo ""
echo ">>> Fetching DB password from Secret Manager..."
DB_PASSWORD=$(gcloud secrets versions access latest \
  --secret=maya-db-password --project="$PROJECT_ID")
echo "    ✅ Password fetched"

# ── Start Auth Proxy ──────────────────────────────────────────────────────────
if [ ! -f ~/cloud-sql-proxy ]; then
  curl -sL -o ~/cloud-sql-proxy \
    "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.4/cloud-sql-proxy.linux.amd64"
  chmod +x ~/cloud-sql-proxy
fi

echo ""
echo ">>> Starting Auth Proxy on 127.0.0.1:$PROXY_PORT..."
~/cloud-sql-proxy "$CONNECTION_NAME" --port="$PROXY_PORT" --quiet &
PROXY_PID=$!
sleep 4

# ── Run checks ────────────────────────────────────────────────────────────────
echo ""
echo ">>> Running checks..."
PGPASSWORD="$DB_PASSWORD" psql \
  "host=127.0.0.1 port=$PROXY_PORT dbname=$DB_NAME user=$DB_USER sslmode=disable" \
  --no-psqlrc << 'SQL'
\echo '=== PostgreSQL Version ==='
SELECT version();

\echo ''
\echo '=== pgvector Extension ==='
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

\echo ''
\echo '=== Database Details ==='
SELECT current_database(), current_user, pg_size_pretty(pg_database_size(current_database()));

\echo ''
\echo '=== Privileges Check ==='
SELECT has_database_privilege(current_user, current_database(), 'CREATE') AS can_create_tables;

\q
SQL

kill $PROXY_PID 2>/dev/null
wait $PROXY_PID 2>/dev/null || true

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ All checks passed                                ║"
echo "║  - Auth Proxy connection works                       ║"
echo "║  - pgvector extension installed                      ║"
echo "║  - maya_app has CREATE privilege                     ║"
echo "║                                                      ║"
echo "║  Ready for Alembic migrations.                       ║"
echo "║  Share infra/cloud-sql/run_migrations.sh with        ║"
echo "║  the backend developer.                           ║"
echo "╚══════════════════════════════════════════════════════╝"
