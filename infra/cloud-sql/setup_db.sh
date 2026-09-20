#!/usr/bin/env bash
# =============================================================================
# MAYA Front Desk — Phase 3: Database, User & pgvector Setup
# Run from: GCP Cloud Shell AFTER provision.sh completes
# Owner: Anurag (DevOps)
# =============================================================================
set -euo pipefail

PROJECT_ID="maya-frontdesk"
INSTANCE_NAME="maya-frontdesk-dev"
DB_NAME="maya_frontdesk"
DB_USER="maya_app"

echo "=================================================="
echo " MAYA Front Desk — Database Setup"
echo " Instance: $INSTANCE_NAME"
echo " Database: $DB_NAME"
echo " App User: $DB_USER"
echo "=================================================="

# ── Generate passwords ────────────────────────────────────────────────────────
echo ""
echo ">>> [1/5] Generating secure passwords..."
DB_PASSWORD=$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9!@#%^&*' | head -c 24)
ROOT_PASSWORD=$(openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 24)

echo "  DB_PASSWORD  (maya_app user): $DB_PASSWORD"
echo "  ROOT_PASSWORD (postgres):     $ROOT_PASSWORD"
echo ""
echo "  ⚠️  COPY BOTH PASSWORDS NOW — they will be stored in Secret Manager next."
echo "  Press ENTER when ready to continue..."
read -r

# ── Set postgres root password ─────────────────────────────────────────────────
echo ">>> [2/5] Setting postgres superuser password..."
gcloud sql users set-password postgres \
  --instance="$INSTANCE_NAME" \
  --password="$ROOT_PASSWORD" \
  --project="$PROJECT_ID"
echo "  ✅ postgres password set"

# ── Create application database ────────────────────────────────────────────────
echo ""
echo ">>> [3/5] Creating database '$DB_NAME'..."
gcloud sql databases create "$DB_NAME" \
  --instance="$INSTANCE_NAME" \
  --charset=UTF8 \
  --collation=en_US.UTF8 \
  --project="$PROJECT_ID"
echo "  ✅ Database created"

# ── Create application user ────────────────────────────────────────────────────
echo ""
echo ">>> [4/5] Creating application user '$DB_USER'..."
gcloud sql users create "$DB_USER" \
  --instance="$INSTANCE_NAME" \
  --password="$DB_PASSWORD" \
  --project="$PROJECT_ID"
echo "  ✅ User created"

# ── Open psql to enable pgvector & set grants ──────────────────────────────────
echo ""
echo ">>> [5/5] Opening psql to enable pgvector and configure grants..."
echo "  You will be prompted for the postgres password: $ROOT_PASSWORD"
echo ""
echo "  Run these SQL commands inside psql:"
echo "  ─────────────────────────────────────────────────────────"
cat << 'SQL'
  -- Enable pgvector (required for knowledge_chunks.embedding)
  CREATE EXTENSION IF NOT EXISTS vector;

  -- Verify
  SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

  -- Grant all privileges to the application user
  GRANT ALL PRIVILEGES ON DATABASE maya_frontdesk TO maya_app;
  GRANT ALL ON SCHEMA public TO maya_app;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO maya_app;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO maya_app;

  -- Confirm user
  \du maya_app

  -- Exit
  \q
SQL
echo "  ─────────────────────────────────────────────────────────"
echo ""
echo "  Press ENTER to open the psql connection..."
read -r

gcloud sql connect "$INSTANCE_NAME" \
  --user=postgres \
  --database="$DB_NAME" \
  --project="$PROJECT_ID"

echo ""
echo "=================================================="
echo "  ✅ Database setup complete!"
echo "  Next: Run secrets/store_secrets.sh"
echo "  DB_PASSWORD to store: $DB_PASSWORD"
echo "=================================================="
