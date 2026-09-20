#!/usr/bin/env bash
# =============================================================================
# MAYA Front Desk — Phase 1 & 2: GCP Project + Cloud SQL Provisioning
# Run from: GCP Cloud Shell
# Owner: Anurag (DevOps)
# =============================================================================
set -euo pipefail

# ── Variables ─────────────────────────────────────────────────────────────────
PROJECT_ID="maya-frontdesk"
REGION="asia-south1"
INSTANCE_NAME="maya-frontdesk-dev"
DB_NAME="maya_frontdesk"

echo "=================================================="
echo " MAYA Front Desk — Cloud SQL Provisioning"
echo " Project : $PROJECT_ID"
echo " Region  : $REGION"
echo " Instance: $INSTANCE_NAME"
echo "=================================================="

# ── Phase 1: Project & APIs ───────────────────────────────────────────────────
echo ""
echo ">>> [1/6] Creating GCP Project..."
gcloud projects create "$PROJECT_ID" --name="MAYA Front Desk" 2>/dev/null || \
  echo "  Project already exists — skipping creation."

echo ">>> Setting active project..."
gcloud config set project "$PROJECT_ID"

echo ""
echo ">>> [2/6] Enabling required APIs..."
echo "  (This may take 1–2 minutes)"
gcloud services enable \
  sqladmin.googleapis.com \
  compute.googleapis.com \
  secretmanager.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com
echo "  ✅ APIs enabled"

# ── Phase 2: Cloud SQL Instance ───────────────────────────────────────────────
echo ""
echo ">>> [3/6] Creating Cloud SQL instance: $INSTANCE_NAME"
echo "  Region  : $REGION (Mumbai)"
echo "  Version : PostgreSQL 15"
echo "  Tier    : db-g1-small (1.7 GB RAM)"
echo "  Storage : 10 GB SSD, auto-increase"
echo "  IP      : No public IP (Auth Proxy only)"
echo "  Backup  : Daily at 02:00 IST, 7-day retention + PITR"
echo "  (This takes 5–8 minutes ☕)"
gcloud sql instances create "$INSTANCE_NAME" \
  --database-version=POSTGRES_15 \
  --tier=db-g1-small \
  --region="$REGION" \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --backup \
  --backup-start-time=20:30 \
  --enable-bin-log \
  --retained-backups-count=7 \
  --retained-transaction-log-days=7 \
  --no-assign-ip \
  --deletion-protection \
  --project="$PROJECT_ID"

echo "  ✅ Cloud SQL instance created"

# ── Fetch and display connection name ─────────────────────────────────────────
echo ""
echo ">>> [4/6] Fetching connection details..."
CONNECTION_NAME=$(gcloud sql instances describe "$INSTANCE_NAME" \
  --format="value(connectionName)" --project="$PROJECT_ID")

echo ""
echo "=================================================="
echo "  Cloud SQL Connection Details"
echo "  Connection Name : $CONNECTION_NAME"
echo "  Database        : $DB_NAME"
echo "=================================================="
echo ""
echo "NEXT STEP: Run setup_db.sh to create the database, user, and enable pgvector."
