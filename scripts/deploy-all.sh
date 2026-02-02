#!/usr/bin/env bash
# Deploy backend + frontend to production automatically.
# 1) Get backend URL from Railway CLI and write .env.production for frontend
# 2) Build backend, commit, push → Railway deploys both services
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
ENV_PROD="$ROOT/biochar-bloom-main/.env.production"

echo "==> 1. Getting Railway backend URL..."
BACKEND_URL=""
if command -v railway >/dev/null 2>&1 && railway whoami >/dev/null 2>&1; then
  DOMAIN=$(railway domain 2>/dev/null | tr -d '\n\r ' || true)
  [ -z "$DOMAIN" ] && DOMAIN=$(cd backend && railway domain 2>/dev/null | tr -d '\n\r ') || true
  if [ -n "$DOMAIN" ]; then
    [[ "$DOMAIN" != https://* ]] && BACKEND_URL="https://$DOMAIN" || BACKEND_URL="$DOMAIN"
  fi
fi

if [ -z "$BACKEND_URL" ]; then
  echo "    Could not get backend URL. Run: railway login && railway link (from root or backend), then Generate Domain for the API service."
  echo "    Continuing without updating .env.production – ensure Railway frontend service has VITE_API_URL set."
else
  echo "VITE_API_URL=$BACKEND_URL" > "$ENV_PROD"
  echo "    Wrote biochar-bloom-main/.env.production with VITE_API_URL=$BACKEND_URL"
fi

echo "==> 2. Building backend..."
npm run build

echo "==> 3. Committing and pushing (Railway will deploy backend + frontend)..."
git add -A
git diff --staged --quiet && echo "    (no changes to commit)" || git commit -m "Deploy to Railway"
BRANCH=$(git branch --show-current)
git push origin "$BRANCH"

echo ""
echo "==> Done. Pushed $BRANCH."
echo "    Backend and frontend will deploy on Railway if both services are connected to this repo."
echo "    Frontend: Root Directory = biochar-bloom-main, Build = npm ci && npm run build, Start = npx serve -s dist -l \$PORT"
