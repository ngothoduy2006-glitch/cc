@echo off
title Khoi dong Student Q&A Forum
echo ===================================================
echo   KHOI DONG HE THONG DIEN DAN HOI DAP SINH VIEN
echo ===================================================
echo.
echo [1/2] Dang khoi dong Backend Server tren port 4002...
start "Backend Server (Port 4002)" cmd /k "npm run dev"

echo.
echo [2/2] Dang khoi dong Frontend Server tren port 8000...
start "Frontend Server (Port 8000)" cmd /k "cd frontend && set NODE_OPTIONS=--openssl-legacy-provider && npm start"

echo.
echo ===================================================
echo Da kich hoat lenh khoi dong!
echo - Backend: http://localhost:4002
echo - Frontend: http://localhost:8000
echo ===================================================
pause
