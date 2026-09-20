#!/usr/bin/env bash
# =============================================================================
# MAYA Front Desk — Phase 4: Store Secrets in GCP Secret Manager
# Run from: GCP Cloud Shell AFTER setup_db.sh completes
# Owner: Anurag (DevOps)
# =============================================================================
set -euo pipefail

PROJECT_ID="maya-frontdesk"
REGION="asia-south1"
INSTANCE_NAME="maya-frontdesk-dev"

echo "=================================================="
echo " MAYA Front Desk — Secret Manager Setup"
echo "=================================================="
echo ""

# ── Prompt for passwords (from setup_db.sh output) ───────────────────────────
echo "Enter the DB_PASSWORD (maya_app user) from setup_db.sh:"
read -rs DB_PASSWORD
echo ""
echo "Enter the ROOT_PASSWORD (postgres) from setup_db.sh:"
read -rs ROOT_PASSWORD
echo ""

# ── Fetch connection name ─────────────────────────────────────────────────────
CONNECTION_NAME=$(gcloud sql instances describe "$INSTANCE_NAME" \
  --format="value(connectionName)" --project="$PROJECT_ID")
echo "Connection name: $CONNECTION_NAME"

# ── Store secrets ─────────────────────────────────────────────────────────────
echo ""
echo ">>> Storing maya-db-password..."
echo -n "$DB_PASSWORD" | gcloud secrets create maya-db-password \
  --data-file=- \
  --replication-policy=user-managed \
  --locations="$REGION" \
  --project="$PROJECT_ID" 2>/dev/null || \
  echo -n "$DB_PASSWORD" | gcloud secrets versions add maya-db-password \
    --data-file=- --project="$PROJECT_ID"

echo ">>> Storing maya-db-root-password..."
echo -n "$ROOT_PASSWORD" | gcloud secrets create maya-db-root-password \
  --data-file=- \
  --replication-policy=user-managed \
  --locations="$REGION" \
  --project="$PROJECT_ID" 2>/dev/null || \
  echo -n "$ROOT_PASSWORD" | gcloud secrets versions add maya-db-root-password \
    --data-file=- --project="$PROJECT_ID"

echo ">>> Storing maya-db-connection-name..."
echo -n "$CONNECTION_NAME" | gcloud secrets create maya-db-connection-name \
  --data-file=- \
  --replication-policy=user-managed \
  --locations="$REGION" \
  --project="$PROJECT_ID" 2>/dev/null || \
  echo -n "$CONNECTION_NAME" | gcloud secrets versions add maya-db-connection-name \
    --data-file=- --project="$PROJECT_ID"

echo ""
echo ">>> Verifying secrets..."
gcloud secrets list --project="$PROJECT_ID" \
  --filter="name:maya-db" \
  --format="table(name,createTime)"

echo ""
echo "=================================================="
echo "  ✅ All secrets stored in Secret Manager"
echo "  Next: Run cloud-run/service-account-setup.sh"
echo "=================================================="
