@echo off
cls

echo ==========================================
echo   After Effects MCP Server - Full Setup
echo ==========================================
echo.

:: Get script directory
cd /d "%~dp0"
set SCRIPT_DIR=%cd%

:: Check if node is installed
echo [CHECK] Checking Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo         Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo         Node.js %NODE_VERSION% found
echo.

:: Install dependencies
echo [INSTALL] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo         Dependencies installed
echo.

:: Build project
echo [BUILD] Building project...
call npm run build:win
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)
echo         Build complete
echo.

:: Install bridge
echo [BRIDGE] Installing After Effects bridge...
call npm run install-bridge
echo.

:: Show config
echo.
echo ==========================================
echo   MCP Configuration
echo ==========================================
echo.
echo Add this to your Claude/Cursor MCP config:
echo.
echo {
echo   "mcpServers": {
echo     "AfterEffectsMCP": {
echo       "command": "node",
echo       "args": ["%SCRIPT_DIR:\=\\%\\build\\index.js"]
echo     }
echo   }
echo }
echo.
echo ==========================================
echo.
echo [OK] Setup complete!
echo.
echo To start the server, run:
echo    start.bat
echo.
echo Or use:
echo    npm start
echo.
pause
