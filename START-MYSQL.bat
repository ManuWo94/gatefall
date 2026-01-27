@echo off
echo Starte MySQL ueber XAMPP...
cd /d "c:\xampp"
mysql_start.bat
timeout /t 5
echo.
echo MySQL sollte jetzt laufen.
pause
