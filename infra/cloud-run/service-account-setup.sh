#!/usr/bin/env bash
# =============================================================================
# MAYA Front Desk — Step 6 & 7: Cloud Run IAM + Developer Access
# Run from: GCP Cloud Shell
# Owner: DevOps team
# =============================================================================
set -euo pipefail

PROJECT_ID="maya-frontdesk"
SA_NAME="maya-cloudrun-sa"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  MAYA Front Desk — IAM Setup                         ║"
echo "╚══════════════════════════════════════════════════════╝"

# ════════════════════════════════════════════════════════
# STEP 6 — Cloud Run Service Account
# ════════════════════════════════════════════════════════
echo ""
echo ">>> [STEP 6] Creating Cloud Run service account..."

gcloud iam service-accounts create "$SA_NAME" \
  --display-name="MAYA Front Desk — Cloud Run SA" \
  --project="$PROJECT_ID" 2>/dev/null || \
  echo "    Service account already exists — skipping"

# Cloud SQL access (Auth Proxy / Unix socket)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/cloudsql.client" --condition=None

# Secret Manager access (Cloud Run reads maya-database-url → DATABASE_URL)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/secretmanager.secretAccessor" --condition=None

# Artifact Registry access (pull container images)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/artifactregistry.reader" --condition=None

echo "    ✅ Cloud Run SA configured: $SA_EMAIL"
echo "       roles/cloudsql.client           (Auth Proxy)"
echo "       roles/secretmanager.secretAccessor (read DATABASE_URL)"
echo "       roles/artifactregistry.reader   (pull images)"

# ════════════════════════════════════════════════════════
# STEP 7 — Grant Developer Access for Migrations
# ════════════════════════════════════════════════════════
echo ""
echo ">>> [STEP 7] Grant developer Cloud SQL access for Alembic migrations..."
echo ""
echo "Enter the backend developer's Google account email (for migration access):"
read -rp "Email: " DEV_EMAIL

if [ -n "$DEV_EMAIL" ]; then
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="user:$DEV_EMAIL" \
    --role="roles/cloudsql.client" --condition=None

  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="user:$DEV_EMAIL" \
    --role="roles/secretmanager.secretAccessor" --condition=None

  echo "    ✅ $DEV_EMAIL can now:"
  echo "       - Connect to Cloud SQL via Auth Proxy"
  echo "       - Read secrets from Secret Manager"
  echo "       - Run: bash infra/cloud-sql/run_migrations.sh"
fi

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ IAM setup complete                               ║"
echo "║  NEXT: Run cloud-sql/verify_connection.sh            ║"
echo "║  THEN: Share run_migrations.sh                       ║"
echo "╚══════════════════════════════════════════════════════╝"
