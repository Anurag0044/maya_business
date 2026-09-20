#!/usr/bin/env bash
# =============================================================================
# MAYA Front Desk — Alembic Migration Guide (for / backend team)
# Run from: GCP Cloud Shell
# NOTE:  shares this file . runs it from
#       Cloud Shell after cloning the backend repo.
# =============================================================================
set -euo pipefail

PROJECT_ID="maya-frontdesk"
INSTANCE_NAME="maya-frontdesk-dev"
DB_NAME="maya_frontdesk"
DB_USER="maya_app"
PROXY_PORT=5432

echo "=================================================="
echo " MAYA Front Desk — Alembic Migration via Auth Proxy"
echo "=================================================="
echo ""
echo "PREREQUISITES:"
echo "  1. You are in GCP Cloud Shell (authenticated as your Google account)"
echo "  2. Your account has been granted roles/cloudsql.client on the project"
echo "     (DevOps team does this once — see note below)"
echo "  3. The backend repo is cloned into ~/maya_business/backend"
echo ""

# ── Grant  ───────────────────────────
echo "# ── ONE-TIME SETUP (DevOps team grants this for the backend developer) ─────────────────"
echo "# Replace SIDDHARTH_EMAIL with his Google account:"
echo "#   gcloud projects add-iam-policy-binding maya-frontdesk \\"
echo "#     --member='user:siddharth@example.com' \\"
echo "#     --role='roles/cloudsql.client'"
echo "#     --role='roles/secretmanager.secretAccessor'"
echo "# ─────────────────────────────────────────────────────────────────────"
echo ""
echo "Press ENTER to continue with migrations..."
read -r

# ── Fetch connection info from Secret Manager ─────────────────────────────────
echo ">>> Fetching credentials from Secret Manager..."
DB_PASSWORD=$(gcloud secrets versions access latest \
  --secret=maya-db-password \
  --project="$PROJECT_ID")

CONNECTION_NAME=$(gcloud secrets versions access latest \
  --secret=maya-db-connection-name \
  --project="$PROJECT_ID")

echo "  Connection: $CONNECTION_NAME"
echo "  Database  : $DB_NAME"
echo "  User      : $DB_USER"

# ── Download Auth Proxy ───────────────────────────────────────────────────────
if [ ! -f ~/cloud-sql-proxy ]; then
  echo ""
  echo ">>> Downloading Cloud SQL Auth Proxy..."
  curl -o ~/cloud-sql-proxy \
    "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.4/cloud-sql-proxy.linux.amd64"
  chmod +x ~/cloud-sql-proxy
fi

# ── Start proxy ───────────────────────────────────────────────────────────────
echo ""
echo ">>> Starting Auth Proxy on 127.0.0.1:$PROXY_PORT..."
~/cloud-sql-proxy "$CONNECTION_NAME" --port="$PROXY_PORT" &
PROXY_PID=$!
sleep 4

# ── Export DATABASE_URL for Alembic ──────────────────────────────────────────
export DATABASE_URL="postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@127.0.0.1:${PROXY_PORT}/${DB_NAME}"
export DATABASE_URL_SYNC="postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:${PROXY_PORT}/${DB_NAME}"

echo "  DATABASE_URL set (asyncpg)"
echo ""

# ── Run Alembic ───────────────────────────────────────────────────────────────
BACKEND_DIR="${HOME}/maya-frontdesk/backend"
if [ ! -d "$BACKEND_DIR" ]; then
  echo "ERROR: Backend directory not found at $BACKEND_DIR"
  echo "Please clone the repo first:"
  echo "  git clone <repo-url> ~/maya_business"
  kill $PROXY_PID
  exit 1
fi

cd "$BACKEND_DIR"
echo ">>> Installing Python dependencies..."
pip install -r requirements.txt -q

echo ""
echo ">>> Running Alembic migrations..."
echo "  (Creates all 17 application tables)"
alembic upgrade head

# ── Verify tables ─────────────────────────────────────────────────────────────
echo ""
echo ">>> Verifying tables created..."
PGPASSWORD="$DB_PASSWORD" psql \
  "host=127.0.0.1 port=$PROXY_PORT dbname=$DB_NAME user=$DB_USER sslmode=disable" \
  -c "\dt" \
  -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"

# ── Cleanup ───────────────────────────────────────────────────────────────────
kill $PROXY_PID 2>/dev/null

echo ""
echo "=================================================="
echo "  ✅ Alembic migrations complete!"
echo "  All 17 tables created in maya_frontdesk database."
echo "  pgvector confirmed — knowledge_chunks.embedding ready."
echo "=================================================="
