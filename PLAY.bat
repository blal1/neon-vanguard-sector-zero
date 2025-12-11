@echo off
title Neon Vanguard: Sector Zero - Launch
cls
echo ================================================
echo   NEON VANGUARD: SECTOR ZERO
echo ================================================
echo.
echo Starting game...
echo.

REM Kill old vite processes if they exist
taskkill /F /IM node.exe /FI "WINDOWTITLE eq npm*" 2>nul

REM Start Vite server
echo [1/2] Starting server...
start /B npm run dev > nul 2>&1

REM Wait for server to be ready (15 seconds max)
echo [2/2] Waiting for server...
timeout /t 5 /nobreak > nul

REM Open browser
echo.
echo Opening game in your browser...
start http://localhost:5173

echo.
echo ================================================
echo   GAME LAUNCHED!
echo ================================================
echo.
echo The game is opening in your browser.
echo.
echo IMPORTANT: DO NOT CLOSE THIS WINDOW
echo           while you are playing!
echo.
echo To quit: Simply close this window.
echo ================================================
echo.

REM Keep window open
pause
