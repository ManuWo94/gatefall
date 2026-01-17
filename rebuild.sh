#!/bin/bash
rm -rf dist
npx tsc
echo "Build complete. Checking files:"
ls -lh dist/combat/engine.js
wc -l dist/combat/engine.js src/combat/engine.ts
