#!/usr/bin/env node
// Simple deployment script for Plesk
// Run with: node deploy.js

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting deployment...\n');

async function deploy() {
  try {
    // 1. Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm install --production', { stdio: 'inherit' });
    console.log('✓ Dependencies installed\n');

    // 2. Build TypeScript
    console.log('🔨 Building TypeScript...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✓ Build complete\n');

    // 3. Create test user (wait for completion)
    console.log('👤 Setting up test account...');
    execSync('node create-test-user.js', { stdio: 'inherit' });
    console.log('✓ Test account ready\n');

    console.log('✅ Deployment complete!\n');
    console.log('Test Account:');
    console.log('📧 E-Mail: test@dev.de');
    console.log('🔑 Passwort: 12345678');
    console.log('👤 Name: Manu');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deploy();
