#!/bin/bash

# TodayPool Database Setup Script
# This script helps you apply migrations to your Supabase project

set -e

echo "======================================"
echo "TodayPool Database Setup"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "⚠️  No .env file found in repo root."
  echo ""
  echo "Please create .env with:"
  echo "  SUPABASE_URL=https://xxxxx.supabase.co"
  echo "  SUPABASE_SERVICE_ROLE_KEY=eyJhbGc..."
  echo ""
  exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "⚠️  Missing required environment variables in .env:"
  echo "  - SUPABASE_URL"
  echo "  - SUPABASE_SERVICE_ROLE_KEY"
  echo ""
  echo "Get these from: https://supabase.com/dashboard > Settings > API"
  exit 1
fi

echo "✓ Found Supabase credentials"
echo ""

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "⚠️  jq is not installed (needed for JSON parsing)"
  echo "Install with: brew install jq"
  exit 1
fi

# Apply migrations
echo "Applying migrations..."
echo ""

# Migration 001
echo "📝 Applying 001_init.sql..."
MIGRATION_001=$(cat supabase/migrations/001_init.sql)

curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MIGRATION_001" | jq -Rs .)}" > /dev/null

if [ $? -eq 0 ]; then
  echo "✓ 001_init.sql applied successfully"
else
  echo "✗ Failed to apply 001_init.sql"
  echo "Try applying manually via SQL Editor in Supabase dashboard"
  exit 1
fi

echo ""

# Migration 002
echo "📝 Applying 002_indexes.sql..."
MIGRATION_002=$(cat supabase/migrations/002_indexes.sql)

curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(echo "$MIGRATION_002" | jq -Rs .)}" > /dev/null

if [ $? -eq 0 ]; then
  echo "✓ 002_indexes.sql applied successfully"
else
  echo "✗ Failed to apply 002_indexes.sql"
  echo "Try applying manually via SQL Editor in Supabase dashboard"
  exit 1
fi

echo ""
echo "======================================"
echo "✓ Database setup complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "  1. Sign in to web app: cd apps/web && pnpm dev"
echo "  2. Go to http://localhost:3000 and sign in"
echo "  3. Run tooling/scripts/create-pool.sh to create your first pool"
echo ""
