#!/usr/bin/env bash
set -e

echo "=========================================="
echo "⚙️ Initializing Fresh VPS for Zyvo CRM"
echo "=========================================="

# 1. Update OS packages
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget gnupg2 ca-certificates lsb-release ufw nginx certbot python3-certbot-nginx

# 2. Install Node.js 20 LTS (NodeSource)
if ! command -v node &> /dev/null; then
  echo "📥 Installing Node.js 20 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi

# 3. Install PM2 globally
sudo npm install -g pm2

# 4. Install & configure PostgreSQL
if ! command -v psql &> /dev/null; then
  echo "🐘 Installing PostgreSQL..."
  sudo apt install -y postgresql postgresql-contrib
  sudo systemctl start postgresql
  sudo systemctl enable postgresql

  echo "🔑 Setting up PostgreSQL user and database (crm)..."
  sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD '123456';" || true
  sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '123456';" || true
  sudo -u postgres psql -c "CREATE DATABASE crm OWNER postgres;" || true
fi

# 5. Configure Firewall (UFW)
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "=========================================="
echo "✅ VPS Server Setup Complete!"
echo "   Node: $(node -v), NPM: $(npm -v)"
echo "   PostgreSQL running on port 5432"
echo "   Nginx & UFW configured"
echo "=========================================="
