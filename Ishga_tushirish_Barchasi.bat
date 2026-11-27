@echo off
title ZukkoMarket - To'liq Tizim (Web + Telegram Bot)
chcp 65001 > nul
echo ========================================================
echo   ZukkoMarket - To'liq Tizim Ishga Tushirilmoqda
echo   1. Mini Market Veb Ilovasi (http://localhost:5173)
echo   2. Telegram Bot Serveri (@yegfgfuef_bot)
echo ========================================================
echo.
echo Brauzer ochilmoqda...
start http://localhost:5173
echo.
echo Telegram Bot alohida oynada ishga tushirilmoqda...
start cmd /k "title Telegram Bot Server && chcp 65001 > nul && npm run bot"
echo.
echo Asosiy Web server ishga tushirilmoqda. Iltimos, bu oynani yopmang!
npm run dev
pause
