@echo off
title Neon Vanguard: Sector Zero - Lancement
cls
echo ================================================
echo   NEON VANGUARD: SECTOR ZERO
echo ================================================
echo.
echo Demarrage du jeu...
echo.

REM Tuer les anciens processus vite s'ils existent
taskkill /F /IM node.exe /FI "WINDOWTITLE eq npm*" 2>nul

REM Démarrer le serveur Vite
echo [1/2] Lancement du serveur...
start /B npm run dev > nul 2>&1

REM Attendre que le serveur soit prêt (15 secondes max)
echo [2/2] Attente du serveur...
timeout /t 5 /nobreak > nul

REM Ouvrir le navigateur
echo.
echo Ouverture du jeu dans votre navigateur...
start http://localhost:5173

echo.
echo ================================================
echo   JEU LANCE!
echo ================================================
echo.
echo Le jeu s'ouvre dans votre navigateur.
echo.
echo IMPORTANT: NE FERMEZ PAS CETTE FENETRE
echo           tant que vous jouez!
echo.
echo Pour quitter: Fermez simplement cette fenetre.
echo ================================================
echo.

REM Garder la fenêtre ouverte
pause
