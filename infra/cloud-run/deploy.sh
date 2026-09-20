#!/usr/bin/env bash
# =============================================================================
# MAYA Front Desk — Cloud Run Deployment
# Run from: GCP Cloud Shell (after container image is in Artifact Registry)
# Owner: DevOps team
#
# How DATABASE_URL reaches the app:
#   --set-secrets "DATABASE_URL=maya-database-url:latest"
#   Cloud Run injects the secret as an env var.
#   config.py reads it: settings.database_url → asyncpg socket URL.
#   session.py creates the engine with this URL.
# =============================================================================
set -euo pipefail

PROJECT_ID="maya-frontdesk"
REGION="asia-south1"
SERVICE="maya-frontdesk-api"
SA="maya-cloudrun-sa@maya-frontdesk.iam.gserviceaccount.com"
AR_REPO="maya-repo"
IMAGE_NAME="backend"
IMAGE_TAG="${1:-latest}"

CONNECTION_NAME="maya-frontdesk:asia-south1:maya-frontdesk-dev"
IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${AR_REPO}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  MAYA Front Desk — Cloud Run Deploy                  ║"
echo "║  Service  : $SERVICE"
echo "║  Image    : $IMAGE"
echo "║  SQL Conn : $CONNECTION_NAME"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

gcloud run deploy "$SERVICE" \
  --image="$IMAGE" \
  --region="$REGION" \
  --platform=managed \
  --service-account="$SA" \
  --add-cloudsql-instances="$CONNECTION_NAME" \
  --set-secrets="DATABASE_URL=maya-database-url:latest" \
  --set-env-vars="ENVIRONMENT=production" \
  --set-env-vars="DEBUG=false" \
  --set-env-vars="TIMEZONE=Asia/Kolkata" \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=10 \
  --memory=512Mi \
  --cpu=1 \
  --port=8000 \
  --project="$PROJECT_ID"

echo ""
SERVICE_URL=$(gcloud run services describe "$SERVICE" \
  --region="$REGION" --format="value(status.url)" --project="$PROJECT_ID")
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✅ Deployed!                                        ║"
echo "║  URL: $SERVICE_URL"
echo "║  Health: ${SERVICE_URL}/health"
echo "╚══════════════════════════════════════════════════════╝"
