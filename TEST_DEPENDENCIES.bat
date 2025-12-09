@echo off
title Test Dependencies - Neon Vanguard
cls
echo ================================================
echo   TEST DES DEPENDANCES WINDOWS
echo ================================================
echo.

REM Test 1: Verifier les DLLs Visual C++
echo [Test 1] Verification Visual C++ Redistributable...
reg query "HKLM\SOFTWARE\Microsoft\VisualStudio\14.0\VC\Runtimes\x64" >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ Visual C++ 2015-2022 Redistributable INSTALLE
) else (
    echo   ✗ Visual C++ 2015-2022 Redistributable MANQUANT
    echo.
    echo   PROBLEME IDENTIFIE!
    echo   L'exe Electron ne peut pas demarrer sans cette dependance.
    echo.
    echo   SOLUTION:
    echo   Telechargez et installez Visual C++ Redistributable:
    echo   https://aka.ms/vs/17/release/vc_redist.x64.exe
    echo.
    goto :end
)

echo.
echo [Test 2] Test de lancement Electron...
cd release\win-unpacked

REM Lancer l'exe en arriere-plan
start "" "Neon Vanguard Sector Zero.exe"

REM Attendre 3 secondes
timeout /t 3 /nobreak > nul

REM Verifier si le processus tourne
tasklist | findstr /I "Neon" > nul
if %errorlevel% equ 0 (
    echo   ✓ Processus Electron demarre!
    echo.
    echo   L'application devrait etre visible.
    echo   Si vous ne voyez pas de fenetre, verifiez les logs.
) else (
    echo   ✗ Processus Electron ne demarre pas
    echo.
    echo   Cela confirme un probleme de dependances.
    echo   Installez Visual C++ Redistributable.
)

echo.
echo [Test 3] Verification des logs...
if exist "%APPDATA%\neon-vanguard-sector-zero\electron.log" (
    echo   ✓ Fichier log existe
    echo.
    echo   Contenu du log:
    echo   ----------------------------------------
    type "%APPDATA%\neon-vanguard-sector-zero\electron.log"
    echo   ----------------------------------------
) else (
    echo   ✗ Pas de fichier log
    echo   Cela confirme qu'Electron ne demarre meme pas.
)

:end
echo.
echo ================================================
echo   FIN DU DIAGNOSTIC
echo ================================================
echo.
pause
