#!/usr/bin/env bash
# One command: get API URL (if Railway CLI linked), update .env, start the web app.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
FRONTEND="$ROOT/biochar-bloom-main"
ENV_FILE="$FRONTEND/.env.local"
[ -f "$ENV_FILE" ] || ENV_FILE="$FRONTEND/.env"

# Try to get Railway API URL and write .env.local (or .env)
API_URL=""
if command -v railway >/dev/null 2>&1 && railway whoami >/dev/null 2>&1; then
  DOMAIN=$(railway domain 2>/dev/null | tr -d '\n\r ' || true)
  [ -z "$DOMAIN" ] && DOMAIN=$(cd backend && railway domain 2>/dev/null | tr -d '\n\r ') || true
  if [ -n "$DOMAIN" ]; then
    [[ "$DOMAIN" != https://* ]] && API_URL="https://$DOMAIN" || API_URL="$DOMAIN"
  fi
fi
if [ -n "$API_URL" ]; then
  if [ -f "$ENV_FILE" ]; then
    grep -v "^VITE_API_URL=" "$ENV_FILE" > "$ENV_FILE.tmp" 2>/dev/null || true
    echo "VITE_API_URL=$API_URL" >> "$ENV_FILE.tmp"
    mv "$ENV_FILE.tmp" "$ENV_FILE"
  else
    echo "VITE_API_URL=$API_URL" > "$ENV_FILE"
  fi
  echo "==> Set VITE_API_URL in biochar-bloom-main/.env.local"
fi

cd "$FRONTEND"
echo "==> Starting web app (open http://localhost:8080 in your browser)..."
npm run dev
