@echo off
cls

echo ==========================================
echo   After Effects MCP Server - Easy Starter
echo ==========================================
echo.

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo         Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Get script directory
cd /d "%~dp0"

:: Check if dependencies are installed
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    echo.
)

:: Check if build exists
if not exist "build\index.js" (
    echo [INFO] Building project...
    call npm run build:win
    echo.
)

echo [OK] Starting MCP Server...
echo.
echo Quick Guide:
echo   1. Open After Effects
echo   2. Go to Window ^> mcp-bridge-auto.jsx
echo   3. Enable 'Auto-run commands' checkbox
echo   4. Use Claude/Cursor to control After Effects!
echo.
echo Press Ctrl+C to stop the server
echo ==========================================
echo.

:: Start the server
node build\index.js

pause
