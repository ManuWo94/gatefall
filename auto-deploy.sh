#!/bin/bash
# Auto-deploy script that runs after git pull
# Can be used as a git hook or manual deployment

echo "🚀 Starting auto-deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in gatefall directory"
    exit 1
fi

# Install dependencies if package.json changed
if git diff --name-only HEAD@{1} HEAD 2>/dev/null | grep -q "package.json"; then
    echo "📦 package.json changed, installing dependencies..."
    npm install
fi

# Run database migration
echo "🗄️ Running database migration..."
node migrate-db.js

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npx tsc

# Restart server if running under PM2
if pm2 list | grep -q "gatefall"; then
    echo "🔄 Restarting PM2 process..."
    pm2 restart gatefall
    pm2 save
else
    echo "⚠️ Not running under PM2, please start manually"
fi

echo "✅ Auto-deployment complete!"
