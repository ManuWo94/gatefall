#!/bin/bash
# Script to update test user on Plesk server

# Run this on Plesk server to sync the test account

echo "🔧 Updating test account on Plesk..."

# Navigate to app directory
cd /var/www/vhosts/keen-goldwasser.5-9-96-43.plesk.page/httpdocs/gatefall || exit 1

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create/Update test account
echo "👤 Creating test account..."
node create-test-user.js

# Restart Node.js app
echo "🔄 Restarting app..."
pm2 restart gatefall || node app.js &

echo "✅ Deployment complete!"
echo ""
echo "Test Account:"
echo "📧 E-Mail: test@dev.de"
echo "🔑 Passwort: 12345678"
echo "👤 Name: Manu"
