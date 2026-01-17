#!/bin/bash
# Einfacher Test um zu sehen ob der Server antwortet

echo "=== GateFall API Test ==="
echo ""

# Test 1: Ist der Node.js Server lokal erreichbar?
echo "1️⃣  Testing localhost:3000..."
curl -s http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"test":"test"}' | head -c 200
echo ""
echo ""

# Test 2: Läuft überhaupt ein Node.js Prozess?
echo "2️⃣  Node.js processes:"
ps aux | grep "node.*server" | grep -v grep
echo ""

# Test 3: Welcher Port hört?
echo "3️⃣  Listening ports:"
netstat -tlnp 2>/dev/null | grep 3000 || ss -tlnp 2>/dev/null | grep 3000
echo ""

# Test 4: Was antwortet die externe Domain?
echo "4️⃣  Testing external domain /api/auth/login..."
curl -s https://keen-goldwasser.5-9-96-43.plesk.page/api/auth/login -H "Content-Type: application/json" -d '{"test":"test"}' | head -c 200
echo ""
echo ""

echo "=== Analyse ==="
echo "Wenn Test 1 JSON zeigt, aber Test 4 HTML zeigt:"
echo "  → Node.js läuft, aber Plesk leitet nicht weiter"
echo "  → Lösung: Node.js App in Plesk aktivieren (siehe PLESK_SETUP.md)"
echo ""
echo "Wenn Test 1 auch HTML/nichts zeigt:"
echo "  → Node.js Server läuft nicht richtig"
echo "  → Lösung: ./deploy.sh oder npm run server"
