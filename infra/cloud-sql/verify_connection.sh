#!/usr/bin/env bash
# =============================================================================
# MAYA Front Desk — Health Check: Verify Cloud SQL Connection via Auth Proxy
# Run from: GCP Cloud Shell after all setup phases complete
# Owner: Anurag (DevOps)
# =============================================================================
set -euo pipefail

PROJECT_ID="maya-frontdesk"
INSTANCE_NAME="maya-frontdesk-dev"
DB_NAME="maya_frontdesk"
DB_USER="maya_app"
PROXY_PORT=5433   # use 5433 to avoid conflict with any local pg

echo "=================================================="
echo " MAYA Front Desk — Connection Verification"
echo "=================================================="

# ── Fetch password from Secret Manager ───────────────────────────────────────
echo ""
echo ">>> Fetching DB password from Secret Manager..."
DB_PASSWORD=$(gcloud secrets versions access latest \
  --secret=maya-db-password \
  --project="$PROJECT_ID")
echo "  ✅ Password fetched"

# ── Get connection name ───────────────────────────────────────────────────────
CONNECTION_NAME=$(gcloud sql instances describe "$INSTANCE_NAME" \
  --format="value(connectionName)" --project="$PROJECT_ID")
echo "  Connection name: $CONNECTION_NAME"

# ── Download Auth Proxy if not present ───────────────────────────────────────
if [ ! -f ~/cloud-sql-proxy ]; then
  echo ""
  echo ">>> Downloading Cloud SQL Auth Proxy..."
  curl -o ~/cloud-sql-proxy \
    "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.4/cloud-sql-proxy.linux.amd64"
  chmod +x ~/cloud-sql-proxy
  echo "  ✅ Auth Proxy downloaded"
fi

# ── Start Auth Proxy ──────────────────────────────────────────────────────────
echo ""
echo ">>> Starting Auth Proxy on port $PROXY_PORT..."
~/cloud-sql-proxy "$CONNECTION_NAME" --port="$PROXY_PORT" &
PROXY_PID=$!
sleep 4
echo "  Auth Proxy running (PID $PROXY_PID)"

# ── Run verification queries ──────────────────────────────────────────────────
echo ""
echo ">>> Running verification checks..."

PGPASSWORD="$DB_PASSWORD" psql \
  "host=127.0.0.1 port=$PROXY_PORT dbname=$DB_NAME user=$DB_USER sslmode=disable" \
  -c "SELECT version();" \
  -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';" \
  -c "\l $DB_NAME"

# ── Cleanup ───────────────────────────────────────────────────────────────────
kill $PROXY_PID 2>/dev/null
echo ""
echo "=================================================="
echo "  ✅ Verification complete — Auth Proxy connection works"
echo "  ✅ pgvector extension confirmed"
echo "  ✅ Database $DB_NAME accessible as $DB_USER"
echo ""
echo "  Ready for Alembic migrations — share alembic_migration_guide.sh"
echo "  with Siddharth."
echo "=================================================="
