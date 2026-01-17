#!/bin/bash
# Debug-Script für Plesk-Server

echo "=== GateFall Server Debug ==="
echo ""

# 1. Git Status
echo "📋 Git Status:"
git log -1 --oneline
echo ""

# 2. Prüfe ob server/routes/auth.js Discord-Routes hat
echo "🔍 Discord Routes in auth.js:"
grep -n "discord" server/routes/auth.js | head -5
echo ""

# 3. Prüfe .env Datei
echo "🔐 Environment Variables:"
if [ -f .env ]; then
    echo "✓ .env exists"
    grep "DISCORD_CLIENT_ID" .env | cut -d= -f1
    grep "DISCORD_CLIENT_SECRET" .env | cut -d= -f1
else
    echo "✗ .env NOT FOUND!"
fi
echo ""

# 4. Prüfe ob Server läuft
echo "🖥️  Running Processes:"
ps aux | grep "node.*server" | grep -v grep
echo ""

# 5. Prüfe Server Log
echo "📜 Last 30 lines of server.log:"
if [ -f server.log ]; then
    tail -n 30 server.log
else
    echo "✗ server.log NOT FOUND!"
fi
echo ""

# 6. Prüfe Port
echo "🔌 Listening Ports:"
netstat -tlnp 2>/dev/null | grep node || ss -tlnp 2>/dev/null | grep node
echo ""

echo "=== Debug Complete ==="
