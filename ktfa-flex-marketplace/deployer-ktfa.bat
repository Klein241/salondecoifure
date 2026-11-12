@echo off
title KTFA FLEX - Deploiement Instance Dediee Cloudflare
color 0B

echo ==============================================================================
echo    KTFA FLEX - DEPLOIEMENT DE L'INSTANCE DEDIEE SOUVERAINE
echo ==============================================================================
echo.
echo   Ce script automatise tout le deploiement en 1-clic :
echo   - 1. Creation automatique de sa propre base D1 (ktfa-flex-db)
echo   - 2. Injection du catalogue, des 12 articles et des parametres
echo   - 3. Compilation Vite propre
echo   - 4. Deploiement Cloudflare Worker sur https://ktfa-flex.mynexus.workers.dev
echo.
echo ==============================================================================
echo.

cd /d "%~dp0"

node scripts\deploy-ktfa.cjs

echo.
echo ==============================================================================
echo Appuyez sur une touche pour fermer cette fenetre...
echo ==============================================================================
pause > nul
