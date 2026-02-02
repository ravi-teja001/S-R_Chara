#!/usr/bin/env bash
# Get Railway API URL and write it to biochar-bloom-main/.env.local (create from .env.example if missing)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
FRONTEND="$ROOT/biochar-bloom-main"
ENV_FILE="$FRONTEND/.env.local"

# Ensure .env.local exists
if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$FRONTEND/.env.example" ]; then
    cp "$FRONTEND/.env.example" "$ENV_FILE"
    echo "Created .env.local from .env.example"
  else
    touch "$ENV_FILE"
  fi
fi

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

if [ -z "$API_URL" ]; then
  echo "Could not get Railway URL. Either:"
  echo "  1) Create .railway-api-url in repo root with one line: your backend URL (e.g. https://xxx.up.railway.app)"
  echo "  2) Run: railway login && railway link (from project root or backend/), then Generate Domain in Railway dashboard."
  exit 1
fi

# Update or add VITE_API_URL in .env.local
if grep -q "^VITE_API_URL=" "$ENV_FILE" 2>/dev/null; then
  grep -v "^VITE_API_URL=" "$ENV_FILE" > "$ENV_FILE.tmp"
  echo "VITE_API_URL=$API_URL" >> "$ENV_FILE.tmp"
  mv "$ENV_FILE.tmp" "$ENV_FILE"
else
  echo "VITE_API_URL=$API_URL" >> "$ENV_FILE"
fi

echo "Updated biochar-bloom-main/.env.local with VITE_API_URL=$API_URL"
echo "Restart the dev server (npm run dev or npm run web) if it is already running."
