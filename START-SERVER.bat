@echo off
echo ====================================
echo GATEFALL BACKEND SERVER
echo ====================================
echo.
cd /d "C:\xampp\htdocs\Gatefall"
echo Backend-Server startet auf Port 3001...
echo Zugriff ueber: http://localhost:3001
echo.
node server/index.js
echo.
echo Server stopped. Press any key to close...
pause >nul
