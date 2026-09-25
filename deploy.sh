#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🚀 Starting Zyvo CRM Deployment on VPS"
echo "=========================================="

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo "📥 1. Pulling latest git changes..."
if [ -d ".git" ]; then
  git pull origin main || git pull origin master
fi

echo "📦 2. Deploying Backend..."
cd "$APP_DIR/backend"
npm ci
npx prisma generate
npx prisma db push --accept-data-loss || npx prisma migrate deploy
npm run build

echo "🎨 3. Deploying Frontend..."
cd "$APP_DIR/frontend"
npm ci
npm run build

echo "⚡ 4. Reloading PM2 processes..."
cd "$APP_DIR"
if command -v pm2 &> /dev/null; then
  pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
  pm2 save
else
  echo "⚠️ PM2 not found globally. Installing PM2..."
  sudo npm install -g pm2
  pm2 start ecosystem.config.js --env production
  pm2 save
fi

echo "=========================================="
echo "✅ Zyvo CRM VPS Deployment Complete!"
echo "   - Backend API: http://127.0.0.1:4000/api/v1"
echo "   - Frontend App: http://127.0.0.1:3000"
echo "=========================================="
