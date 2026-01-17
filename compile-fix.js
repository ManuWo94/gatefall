// Quick fix: manually trigger compilation
const { execSync } = require('child_process');
const fs = require('fs');

console.log('Cleaning dist...');
execSync('rm -rf dist', { cwd: '/workspaces/gatefall' });

console.log('Compiling TypeScript...');
execSync('npx tsc', { cwd: '/workspaces/gatefall', stdio: 'inherit' });

console.log('Checking output...');
const engineSrc = fs.statSync('/workspaces/gatefall/src/combat/engine.ts');
const engineDist = fs.statSync('/workspaces/gatefall/dist/combat/engine.js');

console.log(`Source: ${engineSrc.size} bytes`);
console.log(`Compiled: ${engineDist.size} bytes`);

const srcLines = fs.readFileSync('/workspaces/gatefall/src/combat/engine.ts', 'utf8').split('\n').length;
const distLines = fs.readFileSync('/workspaces/gatefall/dist/combat/engine.js', 'utf8').split('\n').length;

console.log(`Source lines: ${srcLines}`);
console.log(`Compiled lines: ${distLines}`);

if (distLines < 300) {
    console.error('ERROR: Compiled file is too small!');
    process.exit(1);
}

console.log('Build OK!');
