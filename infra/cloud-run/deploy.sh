#!/usr/bin/env bash
# =============================================================================
# MAYA Front Desk — Cloud Run Deployment
# Run from: GCP Cloud Shell (after container image is pushed to Artifact Registry)
# Owner: Anurag (DevOps)
# =============================================================================
set -euo pipefail

PROJECT_ID="maya-frontdesk"
REGION="asia-south1"
SERVICE_NAME="maya-frontdesk-api"
SA_EMAIL="maya-cloudrun-sa@maya-frontdesk.iam.gserviceaccount.com"
AR_REPO="maya-repo"
IMAGE_NAME="backend"
IMAGE_TAG="${1:-latest}"  # pass a tag as arg, defaults to 'latest'

# Construct the full image path
IMAGE="$REGION-docker.pkg.dev/$PROJECT_ID/$AR_REPO/$IMAGE_NAME:$IMAGE_TAG"

# Fetch connection name
CONNECTION_NAME=$(gcloud secrets versions access latest \
  --secret=maya-db-connection-name \
  --project="$PROJECT_ID")

echo "=================================================="
echo " MAYA Front Desk — Cloud Run Deployment"
echo " Service   : $SERVICE_NAME"
echo " Image     : $IMAGE"
echo " Region    : $REGION"
echo " SQL Conn  : $CONNECTION_NAME"
echo "=================================================="

gcloud run deploy "$SERVICE_NAME" \
  --image="$IMAGE" \
  --region="$REGION" \
  --platform=managed \
  --service-account="$SA_EMAIL" \
  --add-cloudsql-instances="$CONNECTION_NAME" \
  --set-secrets="DATABASE_PASSWORD=maya-db-password:latest" \
  --set-env-vars="DATABASE_HOST=/cloudsql/$CONNECTION_NAME" \
  --set-env-vars="DATABASE_NAME=maya_frontdesk" \
  --set-env-vars="DATABASE_USER=maya_app" \
  --set-env-vars="DATABASE_PORT=5432" \
  --set-env-vars="ENVIRONMENT=production" \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=10 \
  --memory=512Mi \
  --cpu=1 \
  --port=8000 \
  --project="$PROJECT_ID"

echo ""
echo "=================================================="
echo "  ✅ Cloud Run deployment complete!"
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" \
  --region="$REGION" --format="value(status.url)" --project="$PROJECT_ID")
echo "  Service URL: $SERVICE_URL"
echo "  Health check: $SERVICE_URL/health"
echo "=================================================="
