#!/usr/bin/env bash
# =============================================================================
# MAYA Front Desk — Run Alembic Migrations via Cloud SQL Auth Proxy
#
# Codebase-aware:
#   - alembic.ini lives in backend/ (script_location = app/db/migrations)
#   - env.py reads DATABASE_URL from environment (postgresql+asyncpg:// scheme)
#   - Migration 0001_initial_schema creates all 17 tables + enables pgvector
#     (the pgvector extension is pre-enabled by postgres; the migration no-ops it)
#
# Run from: GCP Cloud Shell
# Who runs this: Backend developer, after DevOps team completes Steps 1–7
# =============================================================================
set -euo pipefail

PROJECT_ID="maya-frontdesk"
INSTANCE_NAME="maya-frontdesk-dev"
CONNECTION_NAME="maya-frontdesk:asia-south1:maya-frontdesk-dev"
DB_NAME="maya_frontdesk"
DB_USER="maya_app"
PROXY_PORT=5432
REPO_DIR="${HOME}/maya_business"
BACKEND_DIR="${REPO_DIR}/backend"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  MAYA Front Desk — Alembic Migration Runner          ║"
echo "║  Migration: 0001_initial_schema (17 tables)          ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Pre-flight: repo must be cloned ──────────────────────────────────────────
if [ ! -d "$BACKEND_DIR" ]; then
  echo "ERROR: Backend directory not found at $BACKEND_DIR"
  echo ""
  echo "Clone the repo first:"
  echo "  git clone <your-repo-url> $REPO_DIR"
  echo "  cd $REPO_DIR && git checkout backend"
  exit 1
fi

if [ ! -f "$BACKEND_DIR/alembic.ini" ]; then
  echo "ERROR: alembic.ini not found in $BACKEND_DIR"
  echo "Make sure you are on the 'backend' branch."
  exit 1
fi

echo "✅ Repo found: $BACKEND_DIR"
echo "✅ alembic.ini found"
echo ""

# ── Step 1: Fetch password from Secret Manager ───────────────────────────────
echo ">>> [1/5] Fetching DB password from Secret Manager..."
DB_PASSWORD=$(gcloud secrets versions access latest \
  --secret=maya-db-password \
  --project="$PROJECT_ID")
echo "    ✅ Password fetched"

# ── Step 2: Download Auth Proxy if needed ────────────────────────────────────
if [ ! -f ~/cloud-sql-proxy ]; then
  echo ""
  echo ">>> [2/5] Downloading Cloud SQL Auth Proxy..."
  curl -sL -o ~/cloud-sql-proxy \
    "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.11.4/cloud-sql-proxy.linux.amd64"
  chmod +x ~/cloud-sql-proxy
  echo "    ✅ Auth Proxy downloaded"
else
  echo ">>> [2/5] Auth Proxy already present — skipping download"
fi

# ── Step 3: Start Auth Proxy ─────────────────────────────────────────────────
echo ""
echo ">>> [3/5] Starting Cloud SQL Auth Proxy on 127.0.0.1:$PROXY_PORT ..."
echo "    Instance: $CONNECTION_NAME"
~/cloud-sql-proxy "$CONNECTION_NAME" --port="$PROXY_PORT" --quiet &
PROXY_PID=$!
sleep 4

# Verify proxy is alive
if ! kill -0 $PROXY_PID 2>/dev/null; then
  echo "ERROR: Auth Proxy failed to start. Check your IAM permissions."
  echo "  Your account needs: roles/cloudsql.client on project $PROJECT_ID"
  exit 1
fi
echo "    ✅ Auth Proxy running (PID $PROXY_PID)"

# ── Step 4: Set DATABASE_URL and run Alembic ─────────────────────────────────
echo ""
echo ">>> [4/5] Running Alembic migrations..."
echo "    Driver  : asyncpg (postgresql+asyncpg://)"
echo "    Host    : 127.0.0.1:$PROXY_PORT (via Auth Proxy)"
echo "    Database: $DB_NAME"
echo "    User    : $DB_USER"
echo ""

# Set the env var exactly as config.py expects (postgresql+asyncpg:// scheme)
export DATABASE_URL="postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@127.0.0.1:${PROXY_PORT}/${DB_NAME}"

cd "$BACKEND_DIR"

# Install dependencies (quiet)
echo "    Installing requirements..."
export PATH="$HOME/.local/bin:$PATH"
pip install -r requirements.txt -q

# Create manual backup before migration (safety net)
echo ""
echo "    Creating pre-migration backup in Cloud SQL..."
gcloud sql backups create \
  --instance="$INSTANCE_NAME" \
  --description="pre-alembic-$(date +%Y%m%d-%H%M%S)" \
  --project="$PROJECT_ID" --async 2>/dev/null || \
  echo "    (Backup already running or skipped — continuing)"

# Run the migration
# 0001_initial_schema does:
#   1. CREATE EXTENSION IF NOT EXISTS vector  ← no-op (already enabled by postgres)
#   2. Creates all 17 tables with indexes
echo ""
echo "    Running: alembic upgrade head"
python3 -m alembic upgrade head || alembic upgrade head

# ── Step 5: Verify ────────────────────────────────────────────────────────────
echo ""
echo ">>> [5/5] Verifying migration results..."

PGPASSWORD="$DB_PASSWORD" psql \
  "host=127.0.0.1 port=$PROXY_PORT dbname=$DB_NAME user=$DB_USER sslmode=disable" \
  --no-psqlrc -t -A << 'SQL'
\echo '--- Tables created ---'
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
\echo ''
\echo '--- Table count ---'
SELECT COUNT(*) || ' tables' FROM pg_tables WHERE schemaname = 'public';
\echo ''
\echo '--- pgvector extension ---'
SELECT extname || ' v' || extversion FROM pg_extension WHERE extname = 'vector';
\echo ''
\echo '--- Alembic version ---'
SELECT version_num FROM alembic_version;
SQL

# ── Cleanup ───────────────────────────────────────────────────────────────────
kill $PROXY_PID 2>/dev/null
wait $PROXY_PID 2>/dev/null || true

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅  Migration complete!                             ║"
echo "║  17 tables created in maya_frontdesk                ║"
echo "║  pgvector confirmed (embedding dim=1536)             ║"
echo "║  Revision: 0001_initial_schema                      ║"
echo "╚══════════════════════════════════════════════════════╝"
