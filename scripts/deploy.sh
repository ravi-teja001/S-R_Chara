#!/usr/bin/env bash
# One command: build, commit, push. Railway auto-deploys when you push.
set -e
cd "$(dirname "$0")/.."
echo "==> Building backend..."
npm run build
echo "==> Staging and committing..."
git add -A
git diff --staged --quiet && echo "(no changes to commit)" || git commit -m "Deploy to Railway"
echo "==> Pushing to GitHub (Railway will auto-deploy)..."
BRANCH=$(git branch --show-current)
git push origin "$BRANCH"
echo "==> Done. Pushed $BRANCH. Check Railway dashboard for deployment status."
