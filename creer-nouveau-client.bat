@echo off
title THE GREATSOFT - Usine de Clônage Industriel & Déploiement Client
color 0B

echo ==============================================================================
echo    THE GREATSOFT - USINE DE DÉPLOIEMENT & CLÔNAGE INDUSTRIEL
echo ==============================================================================
echo.
echo   Cet outil intègre désormais le Niveau Ingénierie Avancé :
echo   - 1. Mode Flash Edge Multi-Tenant (Zéro-Build, Zéro-Deploy en 0.2s)
echo   - 2. Mode Dédié Isolé (Worker + Base D1 Indépendante)
echo   - 3. Auto-Ingestion Headless (Scraping automatique de catalogues web)
echo   - 4. Gestion de Licence SaaS & Kill-Switch administratif
echo   - 5. Pack de Bienvenue WhatsApp pour livraison client immédiate
echo.
echo ==============================================================================
echo.

cd /d "%~dp0"

node scripts\deploy-client.cjs

echo.
echo ==============================================================================
echo Appuyez sur une touche pour fermer cette fenêtre...
echo ==============================================================================
pause > nul