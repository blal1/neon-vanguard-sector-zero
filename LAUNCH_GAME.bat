@echo off
cls
title Neon Vanguard: Sector Zero - Desktop Launch
color 0A
echo.
echo ========================================================
echo     NEON VANGUARD: SECTOR ZERO - DESKTOP VERSION
echo ========================================================
echo.
echo Launching application...
echo.

cd release\win-unpacked

REM Launch the exe
start "" "Neon Vanguard Sector Zero.exe"

timeout /t 2 /nobreak > nul

echo.
echo ✓ Application launched!
echo.
echo If an error appears:
echo  → The error will be AUTOMATICALLY copied to clipboard
echo  → You can paste it here with Ctrl+V
echo.
echo Log file available at:
echo %APPDATA%\neon-vanguard-sector-zero\electron.log
echo.
echo Press any key to close this window...
pause > nul
