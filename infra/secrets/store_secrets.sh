#!/usr/bin/env bash
# =============================================================================
# MAYA Front Desk — Step 5: Store Secrets in GCP Secret Manager
# Run from: GCP Cloud Shell after setup_db.sh
# Owner: DevOps team
#
# Stores DATABASE_URL in two formats:
#   1. maya-database-url  → Cloud Run format (Unix socket, asyncpg)
#   2. maya-db-password   → plain password (for scripts like run_migrations.sh)
#
# config.py reads exactly one env var: DATABASE_URL (postgresql+asyncpg://)
# Cloud Run injects maya-database-url as DATABASE_URL via --set-secrets
# =============================================================================
set -euo pipefail

PROJECT_ID="maya-frontdesk"
REGION="asia-south1"
INSTANCE="maya-frontdesk-dev"
DB_NAME="maya_frontdesk"
DB_USER="maya_app"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  MAYA Front Desk — Secret Manager Setup              ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

echo "Enter the DB_PASSWORD (maya_app) from provision.sh output:"
read -rsp "DB_PASSWORD: " DB_PASSWORD
echo ""

# ── Fetch the connection name ─────────────────────────────────────────────────
CONNECTION_NAME=$(gcloud sql instances describe "$INSTANCE" \
  --format="value(connectionName)" --project="$PROJECT_ID")
echo "Connection name: $CONNECTION_NAME"
echo ""

# ── Build DATABASE_URL for Cloud Run (Unix socket, asyncpg) ──────────────────
# This is what config.py receives as DATABASE_URL in Cloud Run
CLOUD_RUN_DB_URL="postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@/maya_frontdesk?host=/cloudsql/${CONNECTION_NAME}"

# ── Store secrets ─────────────────────────────────────────────────────────────
store_or_update() {
  local SECRET_NAME="$1"
  local SECRET_VALUE="$2"
  if gcloud secrets describe "$SECRET_NAME" --project="$PROJECT_ID" &>/dev/null; then
    echo -n "$SECRET_VALUE" | gcloud secrets versions add "$SECRET_NAME" \
      --data-file=- --project="$PROJECT_ID"
    echo "    Updated existing secret: $SECRET_NAME"
  else
    echo -n "$SECRET_VALUE" | gcloud secrets create "$SECRET_NAME" \
      --data-file=- \
      --replication-policy=user-managed \
      --locations="$REGION" \
      --project="$PROJECT_ID"
    echo "    Created new secret: $SECRET_NAME"
  fi
}

echo ">>> Storing maya-database-url (Cloud Run DATABASE_URL — asyncpg format)..."
store_or_update "maya-database-url" "$CLOUD_RUN_DB_URL"

echo ">>> Storing maya-db-password (used by run_migrations.sh + scripts)..."
store_or_update "maya-db-password" "$DB_PASSWORD"

echo ">>> Storing maya-db-connection-name..."
store_or_update "maya-db-connection-name" "$CONNECTION_NAME"

# ── Verify ────────────────────────────────────────────────────────────────────
echo ""
echo ">>> Verification:"
gcloud secrets list --project="$PROJECT_ID" \
  --format="table(name,createTime)"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ Secrets stored                                   ║"
echo "║  maya-database-url    → Cloud Run DATABASE_URL       ║"
echo "║  maya-db-password     → password for scripts         ║"
echo "║  maya-db-connection-name → instance connection name  ║"
echo "║                                                      ║"
echo "║  NEXT: Run cloud-run/service-account-setup.sh        ║"
echo "╚══════════════════════════════════════════════════════╝"
