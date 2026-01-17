#!/usr/bin/env node
// Simple deployment script for Plesk
// Run with: node deploy.js

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting deployment...\n');

try {
  // 1. Pull latest code
  console.log('📥 Pulling latest code...');
  execSync('git pull origin main', { stdio: 'inherit' });
  console.log('✓ Code updated\n');

  // 2. Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install --production', { stdio: 'inherit' });
  console.log('✓ Dependencies installed\n');

  // 3. Build TypeScript
  console.log('🔨 Building TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✓ Build complete\n');

  // 4. Create test user
  console.log('👤 Setting up test account...');
  const createUser = require('./create-test-user.js');
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
