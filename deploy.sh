#!/bin/bash
# GateFall Deployment Script für Plesk-Server

echo "🚀 Starting GateFall deployment..."

# 1. Neuesten Code pullen
echo "📥 Pulling latest code..."
git pull origin main

# 2. Dependencies installieren
echo "📦 Installing dependencies..."
npm install

# 3. TypeScript kompilieren
echo "🔨 Building TypeScript..."
npm run build

# 4. Alten Server stoppen
echo "⏹️  Stopping old server..."
pkill -f "node.*server/index.js" 2>/dev/null || true
sleep 2

# 5. Server im Hintergrund starten
echo "▶️  Starting server..."
nohup npm run server > server.log 2>&1 &

# Warte kurz
sleep 3

# 6. Prüfe ob Server läuft
if pgrep -f "node.*server/index.js" > /dev/null; then
    echo "✅ Deployment successful!"
    echo "📋 Server logs:"
    tail -n 20 server.log
else
    echo "❌ Server failed to start!"
    echo "📋 Error logs:"
    cat server.log
    exit 1
fi

echo ""
echo "🎮 GateFall is now running!"
echo "🌐 URL: https://keen-goldwasser.5-9-96-43.plesk.page"
