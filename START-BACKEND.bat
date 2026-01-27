@echo off
echo ========================================
echo  GATEFALL - Backend Server
echo ========================================
echo.
echo Starte Node.js Backend auf Port 3001...
echo Zugriff: http://localhost:3001
echo.
echo Druecke STRG+C zum Beenden
echo.
cd /d "%~dp0"
node server/index.js
