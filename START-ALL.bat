@echo off
cls
echo ========================================
echo   GATEFALL - Komplettstart
echo ========================================
echo.

REM Prüfe ob MySQL läuft
echo [1/3] Pruefe MySQL...
c:\xampp\mysql\bin\mysql.exe -u root -e "SELECT 1" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo     MySQL laeuft nicht! Starte MySQL...
    start /MIN c:\xampp\mysql_start.bat
    timeout /t 10 /nobreak >nul
    echo     MySQL sollte jetzt laufen
) else (
    echo     MySQL laeuft bereits
)

echo.
echo [2/3] Starte Apache (XAMPP)...
c:\xampp\apache_start.bat >nul 2>&1
timeout /t 2 /nobreak >nul
echo     Apache gestartet

echo.
echo [3/3] Starte Node.js Backend Server...
cd /d "%~dp0"
echo     Server startet auf Port 3001...
echo.
echo ========================================
echo   GATEFALL Backend laeuft!
echo ========================================
echo   Zugriff:
echo   - Spiel: http://localhost/index.html
echo   - Admin: http://localhost/admin.html
echo   - API:   http://localhost:3001
echo ========================================
echo.
echo Druecke STRG+C zum Beenden
echo.

node server/index.js
