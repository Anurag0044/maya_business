#!/usr/bin/env bash
# =============================================================================
# MAYA Front Desk — Phase 5: Cloud Run IAM Service Account Setup
# Run from: GCP Cloud Shell AFTER store_secrets.sh completes
# Owner: Anurag (DevOps)
# =============================================================================
set -euo pipefail

PROJECT_ID="maya-frontdesk"
SA_NAME="maya-cloudrun-sa"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "=================================================="
echo " MAYA Front Desk — Cloud Run Service Account"
echo " SA: $SA_EMAIL"
echo "=================================================="

# ── Create service account ────────────────────────────────────────────────────
echo ""
echo ">>> [1/4] Creating service account..."
gcloud iam service-accounts create "$SA_NAME" \
  --display-name="MAYA Front Desk — Cloud Run SA" \
  --project="$PROJECT_ID" 2>/dev/null || \
  echo "  Service account already exists — skipping."
echo "  ✅ Service account: $SA_EMAIL"

# ── Grant Cloud SQL Client role ───────────────────────────────────────────────
echo ""
echo ">>> [2/4] Granting Cloud SQL Client role (enables Auth Proxy)..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/cloudsql.client" \
  --condition=None
echo "  ✅ roles/cloudsql.client granted"

# ── Grant Secret Manager Accessor ────────────────────────────────────────────
echo ""
echo ">>> [3/4] Granting Secret Manager Accessor (for DB password at runtime)..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/secretmanager.secretAccessor" \
  --condition=None
echo "  ✅ roles/secretmanager.secretAccessor granted"

# ── Grant Artifact Registry Reader (pull container images) ───────────────────
echo ""
echo ">>> [4/4] Granting Artifact Registry Reader (pull container images)..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/artifactregistry.reader" \
  --condition=None
echo "  ✅ roles/artifactregistry.reader granted"

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "=================================================="
echo "  ✅ Cloud Run Service Account Configured"
echo ""
echo "  SA Email    : $SA_EMAIL"
echo "  Roles granted:"
echo "    - roles/cloudsql.client           (Auth Proxy access)"
echo "    - roles/secretmanager.secretAccessor (read DB password)"
echo "    - roles/artifactregistry.reader   (pull container images)"
echo ""
echo "  Next: Run cloud-sql/verify_connection.sh"
echo "  Then: Share connection_info.env.template with Siddharth"
echo "=================================================="
