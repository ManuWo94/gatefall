#!/bin/bash
# Schnelles Update-Script für Plesk

echo "🔄 Updating GateFall..."

# Stop server
echo "⏹️  Stopping server..."
pkill -f "node.*server/index.js"
sleep 2

# Update code
echo "📥 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building..."
npm run build

# Start server in background
echo "▶️  Starting server..."
nohup npm run server > server.log 2>&1 &
sleep 3

echo ""
echo "✅ Update complete!"
echo "📋 Server output:"
tail -20 server.log
