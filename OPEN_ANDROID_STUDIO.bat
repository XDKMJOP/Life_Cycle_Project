@echo off
title Open Life Cycle in Android Studio
echo ============================================================
echo           OPENING LIFE CYCLE IN ANDROID STUDIO              
echo ============================================================
echo.

:: 1. Check & Start Backend (Port 3000) so Android App can connect
netstat -ano | findstr :3000 | findstr LISTENING >nul
if %errorlevel% neq 0 (
    echo [1/4] Starting Backend server on port 3000...
    start "Life Cycle Backend (3000)" cmd /k "cd /d "%~dp0lifeplan\backend" && npm run dev"
    timeout /t 3 >nul
) else (
    echo [1/4] Backend server is already running on port 3000. [OK]
)

cd /d "%~dp0lifeplan\frontend"

echo.
echo [2/4] Building latest web assets...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Build failed. Please check frontend code.
    pause
    exit /b %errorlevel%
)

echo.
echo [3/4] Synchronizing assets with Android Studio project...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Error: Capacitor sync failed.
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Launching Android Studio...
if exist "C:\Program Files\Android\Android Studio\bin\studio64.exe" (
    start "" "C:\Program Files\Android\Android Studio\bin\studio64.exe" "%~dp0lifeplan\frontend\android"
) else (
    call npx cap open android
)

echo.
echo ============================================================
echo   Project opened successfully in Android Studio!
echo   - Backend API: http://10.0.2.2:3000 (Emulator) / http://192.168.1.198:3000 (Phone)
echo   - Just click the green 'Run' (play) button in Android Studio!
echo ============================================================
timeout /t 5
