#!/usr/bin/env bash
# =============================================================================
# MAYA Front Desk — Steps 1–3: Project, APIs, Cloud SQL, Database & User
# Run from: GCP Cloud Shell
# Owner: DevOps team
# =============================================================================
set -euo pipefail

PROJECT_ID="maya-frontdesk"
REGION="asia-south1"
INSTANCE="maya-frontdesk-dev"
DB_NAME="maya_frontdesk"
DB_USER="maya_app"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  MAYA Front Desk — Cloud SQL Provisioning            ║"
echo "║  Project  : $PROJECT_ID"
echo "║  Region   : $REGION (Mumbai)"
echo "║  Instance : $INSTANCE"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ════════════════════════════════════════════════════════
# STEP 1 — GCP Project & APIs
# ════════════════════════════════════════════════════════
echo ">>> [STEP 1] Creating GCP project & enabling APIs..."

gcloud projects create "$PROJECT_ID" --name="MAYA Front Desk" 2>/dev/null && \
  echo "    Project created" || echo "    Project already exists — skipping"

gcloud config set project "$PROJECT_ID"

echo ""
echo "    Link billing before enabling APIs."
echo "    Run: gcloud billing accounts list"
echo "    Then: gcloud billing projects link $PROJECT_ID --billing-account=ACCOUNT_ID"
echo ""
echo "    Press ENTER once billing is linked..."
read -r

gcloud services enable \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  iam.googleapis.com
echo "    ✅ APIs enabled"

# ════════════════════════════════════════════════════════
# STEP 2 — Cloud SQL Instance
# ════════════════════════════════════════════════════════
echo ""
echo ">>> [STEP 2] Creating Cloud SQL instance (this takes 5–8 min ☕)..."
echo "    PostgreSQL 15 · db-g1-small · SSD 10 GB · No public IP"
echo "    Backup: daily 02:00 IST · 7-day retention · PITR enabled"

gcloud sql instances create "$INSTANCE" \
  --database-version=POSTGRES_15 \
  --tier=db-g1-small \
  --region="$REGION" \
  --storage-type=SSD \
  --storage-size=10GB \
  --storage-auto-increase \
  --backup \
  --backup-start-time=20:30 \
  --enable-point-in-time-recovery \
  --retained-backups-count=7 \
  --retained-transaction-log-days=7 \
  --deletion-protection \
  --project="$PROJECT_ID"

echo "    ✅ Cloud SQL instance ready"

# ════════════════════════════════════════════════════════
# STEP 3 — Database, Users, Passwords
# ════════════════════════════════════════════════════════
echo ""
echo ">>> [STEP 3] Generating passwords..."
DB_PASSWORD=$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9!@#%^&*' | head -c 24)
ROOT_PASSWORD=$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 24)

echo ""
echo "  ╔════════════════════════════════════════════════╗"
echo "  ║  SAVE THESE NOW — stored in Secret Manager next ║"
echo "  ║  maya_app password : $DB_PASSWORD"
echo "  ║  postgres password : $ROOT_PASSWORD"
echo "  ╚════════════════════════════════════════════════╝"
echo ""
echo "  Press ENTER to continue..."
read -r

# Set postgres superuser password
gcloud sql users set-password postgres \
  --instance="$INSTANCE" --password="$ROOT_PASSWORD" --project="$PROJECT_ID"

# Create database
gcloud sql databases create "$DB_NAME" \
  --instance="$INSTANCE" --charset=UTF8 --collation=en_US.UTF8 --project="$PROJECT_ID"

# Create application user (not postgres superuser)
gcloud sql users create "$DB_USER" \
  --instance="$INSTANCE" --password="$DB_PASSWORD" --project="$PROJECT_ID"

echo "    ✅ Database '$DB_NAME' created"
echo "    ✅ User '$DB_USER' created (non-superuser)"
echo ""
echo ">>> NEXT: Run setup_db.sh to enable pgvector and configure grants"
echo "    DB_PASSWORD=$DB_PASSWORD"
echo "    ROOT_PASSWORD=$ROOT_PASSWORD"
