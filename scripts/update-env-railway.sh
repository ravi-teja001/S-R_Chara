#!/usr/bin/env bash
# Get Railway API URL and write it to biochar-bloom-main/.env.local
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
ENV_FILE="$ROOT/biochar-bloom-main/.env.local"

API_URL=""
if command -v railway >/dev/null 2>&1 && railway whoami >/dev/null 2>&1; then
  DOMAIN=$(railway domain 2>/dev/null | tr -d '\n\r ' || true)
  [ -z "$DOMAIN" ] && DOMAIN=$(cd backend && railway domain 2>/dev/null | tr -d '\n\r ') || true
  if [ -n "$DOMAIN" ]; then
    [[ "$DOMAIN" != https://* ]] && API_URL="https://$DOMAIN" || API_URL="$DOMAIN"
  fi
fi

if [ -z "$API_URL" ]; then
  echo "Could not get Railway URL. Run: railway login && railway link (from project root or backend), then Generate Domain in Railway dashboard."
  exit 1
fi

# Update or add VITE_API_URL in .env.local
if [ -f "$ENV_FILE" ]; then
  if grep -q "^VITE_API_URL=" "$ENV_FILE" 2>/dev/null; then
    grep -v "^VITE_API_URL=" "$ENV_FILE" > "$ENV_FILE.tmp"
    echo "VITE_API_URL=$API_URL" >> "$ENV_FILE.tmp"
    mv "$ENV_FILE.tmp" "$ENV_FILE"
  else
    echo "VITE_API_URL=$API_URL" >> "$ENV_FILE"
  fi
else
  echo "VITE_API_URL=$API_URL" > "$ENV_FILE"
fi

echo "Updated biochar-bloom-main/.env.local with VITE_API_URL=$API_URL"
echo "Restart the dev server (npm run dev) if it is already running."
