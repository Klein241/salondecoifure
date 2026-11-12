@echo off
title LOCATION EXPRESS GABON - Deploiement & Synchronisation D1
color 0B

echo ==============================================================================
echo    LOCATION EXPRESS GABON - SYNCHRONISATION D1 ET DEPLOIEMENT CLOUDFLARE
echo ==============================================================================
echo.
echo Ce script va :
echo  1. Injecter les donnees initiales (Voitures, Meubles, Multi-Photos) dans D1
echo  2. Compiler le front-end React avec le design Neumorphisme / Clairmorphisme
echo  3. Deployer en direct sur Cloudflare Workers (slugs: location-express et l)
echo.
echo ==============================================================================
echo.

cd /d "%~dp0"

echo [1/3] Injection du catalogue Location Express dans la base D1...
call npx wrangler d1 execute digitalmarkpro-db --file=./d1/seed-location-express.sql --remote
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Verifiez votre connexion ou vos identifiants Cloudflare.
) else (
    echo [OK] Base D1 synchronisee avec succes !
)
echo.

echo [2/3] Compilation du code (Build Vite)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Echec de la compilation Vite.
    pause
    exit /b %ERRORLEVEL%
)
echo.

echo [3/3] Deploiement sur Cloudflare Edge...
call npx wrangler deploy
if %ERRORLEVEL% NEQ 0 (
    echo [ATTENTION] Verifiez la connexion Cloudflare.
) else (
    echo [OK] Deploiement Cloudflare termine avec succes !
)

echo.
echo ==============================================================================
echo    SITE CLIENT LOCATION EXPRESS GABON EN LIGNE !
echo ==============================================================================
echo.
echo Lien Public 1 (Propre) : https://digital-mark-pro.mynexus.workers.dev/?t=location-express
echo Lien Public 2 (Court)  : https://digital-mark-pro.mynexus.workers.dev/?t=l
echo Administration         : https://digital-mark-pro.mynexus.workers.dev/login/admin?t=location-express
echo Code PIN Admin         : Client2026
echo Domaine prevu          : locationexpressgabon.com
echo.
pause
