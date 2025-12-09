@echo off
title Test Electron avec Logging
cls
echo ================================================
echo   TEST ELECTRON - VERSION DEBUG
echo ================================================
echo.
echo Lancement de l'exe avec logging...
echo.

cd release\win-unpacked
start "" "Neon Vanguard Sector Zero.exe"

timeout /t 3 /nobreak > nul

echo.
echo L'application a ete lancee!
echo.
echo Si rien ne s'affiche, le fichier de log est ici:
echo %APPDATA%\neon-vanguard-sector-zero\electron-debug.log
echo.
echo Appuyez sur une touche pour ouvrir le dossier des logs...
pause > nul

explorer %APPDATA%\neon-vanguard-sector-zero

echo.
echo Pour voir le log:
echo notepad %APPDATA%\neon-vanguard-sector-zero\electron-debug.log
echo.
pause
