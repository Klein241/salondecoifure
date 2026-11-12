@echo off
title THE GREATSOFT - Clôneur de Marketplace 1-Clic
color 0A

echo ==============================================================================
echo    THE GREATSOFT - CLÔNEUR 1-CLIC DE MARKETPLACES CLOUDFLARE
echo ==============================================================================
echo.
echo   Ce script permet de clôner la Marketplace KTFA FLEX pour un nouveau client :
echo   - 1. Création automatique de sa propre base de données D1 dédiée
echo   - 2. Injection du catalogue, du panier et du système de paiement par tranche
echo   - 3. Déploiement instantané d'une instance 100%% autonome sur Cloudflare
echo.
echo ==============================================================================
echo.

cd /d "%~dp0"

node scripts\cloner-marketplace.cjs

echo.
echo ==============================================================================
echo Appuyez sur une touche pour fermer cette fenetre...
echo ==============================================================================
pause > nul
