@echo off
title ZukkoMarket - Mini Market & AI Maslahatchi
chcp 65001 > nul
echo ========================================================
echo   ZukkoMarket - Zamonaviy Mini Market ishga tushmoqda...
echo ========================================================
echo.
echo Brauzer avtomatik ochilmoqda: http://localhost:5173
start http://localhost:5173
echo.
echo Server ishga tushirilmoqda. Iltimos, bu oynani yopmang!
npm run dev
pause
