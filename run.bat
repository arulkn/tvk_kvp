@echo off
title TVK Panchayat Portal - Dev Server
echo ===================================================
echo TVK Panchayat Portal - Development Server
echo Local Workspace: %~dp0
echo URL: http://localhost:3000
echo ===================================================
echo.
cd /d "%~dp0"
npm run dev
pause
