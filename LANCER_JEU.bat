@echo off
cls
title Neon Vanguard: Sector Zero - Lancement Desktop
color 0A
echo.
echo ========================================================
echo     NEON VANGUARD: SECTOR ZERO - VERSION DESKTOP
echo ========================================================
echo.
echo Lancement de l'application...
echo.

cd release\win-unpacked

REM Lance l'exe
start "" "Neon Vanguard Sector Zero.exe"

timeout /t 2 /nobreak > nul

echo.
echo ✓ Application lancee!
echo.
echo Si une erreur apparait:
echo  → L'erreur sera AUTOMATIQUEMENT copiee dans le presse-papier
echo  → Vous pourrez la coller ici avec Ctrl+V
echo.
echo Fichier log disponible a:
echo %APPDATA%\neon-vanguard-sector-zero\electron.log
echo.
echo Appuyez sur une touche pour fermer cette fenetre...
pause > nul
