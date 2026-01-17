#!/bin/bash
# Quick check script for Plesk server

echo "🔍 Checking Gatefall installation..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in gatefall directory!"
    exit 1
fi

echo "✅ In gatefall directory"
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
else
    echo "❌ node_modules missing - run: npm install"
fi
echo ""

# Check if dist folder exists
if [ -d "dist" ]; then
    echo "✅ dist folder exists"
    echo "   Files in dist:"
    ls -la dist/*.js | head -5
else
    echo "❌ dist folder missing - run: npx tsc"
fi
echo ""

# Check database
if [ -f "server/gatefall.db" ]; then
    echo "✅ Database exists"
    node check-db-schema.js
else
    echo "❌ Database missing"
fi
echo ""

# Check if PM2 process is running
echo "🔍 PM2 Status:"
pm2 list | grep gatefall || echo "❌ gatefall process not found in PM2"
echo ""

# Check last PM2 logs
echo "📋 Last 10 log lines:"
pm2 logs gatefall --lines 10 --nostream 2>/dev/null || echo "No PM2 logs available"
