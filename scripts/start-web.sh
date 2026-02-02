#!/usr/bin/env bash
# One command: ensure .env.local exists, get Railway API URL automatically, update it, start the web app.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
FRONTEND="$ROOT/biochar-bloom-main"
ENV_FILE="$FRONTEND/.env.local"

# Ensure .env.local exists (copy from .env.example if missing)
if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$FRONTEND/.env.example" ]; then
    cp "$FRONTEND/.env.example" "$ENV_FILE"
    echo "==> Created biochar-bloom-main/.env.local from .env.example"
  else
    touch "$ENV_FILE"
  fi
fi

# Automatically get Railway API URL: 1) Railway CLI, 2) .railway-api-url file
API_URL=""
if command -v railway >/dev/null 2>&1 && railway whoami >/dev/null 2>&1; then
  DOMAIN=$(railway domain 2>/dev/null | tr -d '\n\r ' || true)
  [ -z "$DOMAIN" ] && DOMAIN=$(cd backend && railway domain 2>/dev/null | tr -d '\n\r ') || true
  if [ -n "$DOMAIN" ]; then
    [[ "$DOMAIN" != https://* ]] && API_URL="https://$DOMAIN" || API_URL="$DOMAIN"
  fi
fi
if [ -z "$API_URL" ] && [ -f "$ROOT/.railway-api-url" ]; then
  API_URL=$(head -1 "$ROOT/.railway-api-url" | tr -d '\n\r ')
  [[ "$API_URL" != https://* ]] && API_URL="https://$API_URL"
fi
if [ -z "$API_URL" ] && [ -f "$FRONTEND/.railway-api-url" ]; then
  API_URL=$(head -1 "$FRONTEND/.railway-api-url" | tr -d '\n\r ')
  [[ "$API_URL" != https://* ]] && API_URL="https://$API_URL"
fi
if [ -n "$API_URL" ]; then
  if grep -q "^VITE_API_URL=" "$ENV_FILE" 2>/dev/null; then
    grep -v "^VITE_API_URL=" "$ENV_FILE" > "$ENV_FILE.tmp"
    echo "VITE_API_URL=$API_URL" >> "$ENV_FILE.tmp"
    mv "$ENV_FILE.tmp" "$ENV_FILE"
  else
    echo "VITE_API_URL=$API_URL" >> "$ENV_FILE"
  fi
  echo "==> VITE_API_URL set automatically: $API_URL"
else
  if grep -qE "VITE_API_URL=.*(YOUR-RAILWAY-URL|your-railway-url|your-api)" "$ENV_FILE" 2>/dev/null; then
    echo "==> Tip: Create .railway-api-url in repo root with one line: your backend URL (e.g. https://xxx.up.railway.app)"
    echo "     Or run 'railway login' and 'railway link', then run this again."
  fi
fi

cd "$FRONTEND"
echo "==> Starting web app (open http://localhost:8080)..."
npm run dev
