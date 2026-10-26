@echo off
title Life Cycle - Dev Servers (Backend 3000 + Frontend 5173)
cd /d "%~dp0"

echo ============================================================
echo        STARTING LIFE CYCLE DEV SERVERS (PORT 5173 / 3000)
echo ============================================================
echo.

echo Starting MySQL Database (Docker)...
cd /d "%~dp0lifeplan"
docker compose up -d
cd /d "%~dp0"

echo Starting Backend on port 3000...
start "Life Cycle Backend (3000)" cmd /k "cd /d "%~dp0lifeplan\backend" && npm run dev"

echo Starting Frontend on port 5173...
start "Life Cycle Frontend (5173)" cmd /k "cd /d "%~dp0lifeplan\frontend" && npm run dev"

echo.
echo Dev servers launched!
echo - Frontend: http://localhost:5173
echo - Backend:  http://localhost:3000
echo ============================================================
timeout /t 4
