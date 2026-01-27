# Gatefall Server Starter
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " GATEFALL - Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Wechsel ins Projektverzeichnis
Set-Location "c:\xampp\htdocs\Gatefall"

Write-Host "Starte Node.js Backend auf Port 3001..." -ForegroundColor Green
Write-Host "Zugriff: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "Drücke STRG+C zum Beenden" -ForegroundColor Red
Write-Host ""

# Server starten
node server/index.js
