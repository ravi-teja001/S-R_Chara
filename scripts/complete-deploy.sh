#!/usr/bin/env bash
# Complete flow: build, deploy (push), get API URL, update frontend .env.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
FRONTEND_ENV="$ROOT/biochar-bloom-main/.env"

echo "==> 1. Building backend..."
npm run build

echo "==> 2. Deploying (commit + push)..."
git add -A
git diff --staged --quiet && echo "    (no changes to commit)" || git commit -m "Deploy to Railway"
BRANCH=$(git branch --show-current)
git push origin "$BRANCH"
echo "    Pushed $BRANCH. Railway will auto-deploy."

echo "==> 3. Waiting for Railway to pick up deploy (15s)..."
sleep 15

echo "==> 4. Getting API URL and updating frontend .env..."
API_URL=""
if command -v railway >/dev/null 2>&1; then
  if railway whoami >/dev/null 2>&1; then
    DOMAIN=$(railway domain 2>/dev/null | tr -d '\n\r ' || true)
    [ -z "$DOMAIN" ] && DOMAIN=$(cd backend && railway domain 2>/dev/null | tr -d '\n\r ') || true
    if [ -n "$DOMAIN" ]; then
      [[ "$DOMAIN" != https://* ]] && API_URL="https://$DOMAIN" || API_URL="$DOMAIN"
    fi
  fi
fi

if [ -n "$API_URL" ]; then
  if [ -f "$FRONTEND_ENV" ]; then
    if grep -q "^VITE_API_URL=" "$FRONTEND_ENV" 2>/dev/null; then
      grep -v "^VITE_API_URL=" "$FRONTEND_ENV" > "$FRONTEND_ENV.tmp"
      echo "VITE_API_URL=$API_URL" >> "$FRONTEND_ENV.tmp"
      mv "$FRONTEND_ENV.tmp" "$FRONTEND_ENV"
    else
      echo "VITE_API_URL=$API_URL" >> "$FRONTEND_ENV"
    fi
  else
    echo "VITE_API_URL=$API_URL" > "$FRONTEND_ENV"
  fi
  echo "    Updated biochar-bloom-main/.env with VITE_API_URL=$API_URL"
else
  echo "    Could not get URL from Railway CLI. Do this manually:"
  echo "    1. Railway dashboard → S-R_Chara → Settings → Networking → Generate Domain"
  echo "    2. In biochar-bloom-main/.env add: VITE_API_URL=https://YOUR-URL.up.railway.app"
fi

echo ""
echo "==> Done. Next: run the frontend and test login:"
echo "    cd biochar-bloom-main && npm run dev"
echo "    Then open the app, Sign up, and Log in."
