#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
# Gadget Salalah — Production Deploy Script
# Usage: bash /var/www/gadgetsalalah/deploy.sh
# ─────────────────────────────────────────────

REPO_DIR="/var/www/gadgetsalalah"
FRONTEND_DIST="$REPO_DIR/artifacts/shop/dist/public"
NGINX_ROOT="/var/www/html/gadgetsalalah"   # nginx static root — adjust if different
API_PM2_NAME="gadgetsalalah-api"

cd "$REPO_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Gadget Salalah Deploy Started"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Pull latest code
echo "→ [1/5] Pulling latest code from GitHub..."
git pull origin main

# 2. Install dependencies
echo "→ [2/5] Installing dependencies..."
pnpm install --frozen-lockfile

# 3. Build lib packages (DB types, Zod schemas, API client)
echo "→ [3/5] Building shared libraries..."
pnpm run typecheck:libs

# 4. Build API server
echo "→ [4/5] Building API server..."
pnpm --filter @workspace/api-server run build

# 5. Build frontend
echo "→ [5/5] Building frontend..."
BASE_PATH="/" NODE_ENV=production pnpm --filter @workspace/shop run build

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Build complete — Restarting services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Restart API server with PM2
if pm2 list | grep -q "$API_PM2_NAME"; then
  echo "→ Restarting PM2 process: $API_PM2_NAME"
  pm2 restart "$API_PM2_NAME"
else
  echo "→ Starting new PM2 process: $API_PM2_NAME"
  pm2 start "$REPO_DIR/artifacts/api-server/dist/index.mjs" \
    --name "$API_PM2_NAME" \
    --interpreter node \
    --env production
  pm2 save
fi

# Copy frontend build to nginx static root (if using nginx for static files)
if [ -d "$FRONTEND_DIST" ]; then
  echo "→ Copying frontend build to nginx root..."
  mkdir -p "$NGINX_ROOT"
  cp -r "$FRONTEND_DIST/." "$NGINX_ROOT/"
  echo "→ Frontend deployed to $NGINX_ROOT"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🎉 Deploy complete!"
echo "  API  → PM2 process: $API_PM2_NAME"
echo "  Web  → $NGINX_ROOT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
