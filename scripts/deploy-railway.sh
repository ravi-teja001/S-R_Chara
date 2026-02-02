#!/usr/bin/env bash
# Deploy backend to Railway (after one-time setup in dashboard).
# Run from repo root: ./scripts/deploy-railway.sh
# Options: --schema = also run database schema (needs psql + link to project with DATABASE_URL)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
RUN_SCHEMA=false

for arg in "$@"; do
  case $arg in
    --schema) RUN_SCHEMA=true ;;
  esac
done

echo "==> Biochar API – Railway deploy"
echo "    Repo root: $REPO_ROOT"
echo "    Backend:   $BACKEND_DIR"
echo ""

# 1. Ensure Railway CLI
if ! command -v railway >/dev/null 2>&1; then
  echo "==> Railway CLI not found. Install with:"
  echo "    npm i -g @railway/cli"
  echo "    or: brew install railway"
  exit 1
fi

# 2. Ensure logged in
if ! railway whoami >/dev/null 2>&1; then
  echo "==> Not logged in. Run: railway login"
  railway login
fi

# 3. Deploy from backend directory (must be linked to your API service)
cd "$BACKEND_DIR"
if [ ! -f .railway/config.json ] 2>/dev/null && [ -z "$RAILWAY_TOKEN" ]; then
  echo "==> Project not linked. Run once: railway link"
  echo "    (Choose your project and the API service, not Postgres)"
  railway link
fi

echo "==> Deploying backend..."
railway up --detach

if [ "$RUN_SCHEMA" = true ]; then
  echo "==> Running database schema (needs psql and DATABASE_URL from Railway)..."
  if ! command -v psql >/dev/null 2>&1; then
    echo "    psql not found. Install Postgres client or run schema manually in Railway dashboard."
    exit 1
  fi
  railway run bash -c 'psql "$DATABASE_URL" -f database/schema.sql'
  echo "==> Schema done."
fi

echo ""
echo "==> Deploy finished. Check your Railway dashboard for logs and URL."
