@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo    PRATYAKSH (SIH 26184) - NATIONAL COMMAND CENTER LAUNCHER
echo ======================================================================
echo.

:: Resolve workspace root
set "ROOT=%~dp0"

:: 1. Launch Blockchain Local EVM Node (Port 8545)
echo [1/5] Starting Hardhat EVM Node...
start "PRATYAKSH_HARDHAT_NODE" cmd /k "cd /d "%ROOT%blockchain" && npx hardhat node"
timeout /t 5 /nobreak >nul

:: 2. Deploy Smart Contract and Launch Web3 Bridge API (Port 8001)
echo [2/5] Deploying ATMConsortiumGate Contract and Starting Web3 Bridge...
start "PRATYAKSH_WEB3_BRIDGE" cmd /k "cd /d "%ROOT%blockchain" && npx hardhat run scripts/deploy.js --network localhost && cd bridge && uvicorn bridge_server:app --port 8001 --reload"
timeout /t 5 /nobreak >nul

:: 3. Launch AI / ML Backend Microservice (Port 8000)
echo [3/5] Starting Python FastAPI AI and Geo-Analytics Engine...
start "PRATYAKSH_AI_BACKEND" cmd /k "cd /d "%ROOT%backend" && uvicorn app:app --port 8000 --reload"
timeout /t 4 /nobreak >nul

:: 4. Launch Live Telegram Field Patrol Bot
echo [4/5] Starting Telegram Field Response Listener...
start "PRATYAKSH_TELEGRAM_BOT" cmd /k "cd /d "%ROOT%blockchain\telegram" && python field_patrol_bot.py"
timeout /t 3 /nobreak >nul

:: 5. Launch Next.js Cyber Command Center UI (Port 3000)
echo [5/5] Starting Frontend Cyber Command Center...
start "PRATYAKSH_FRONTEND_UI" cmd /k "cd /d "%ROOT%frontend" && npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo ======================================================================
echo   ALL 5 MICROSERVICES ACTIVE! OPENING DASHBOARD IN BROWSER...
echo ======================================================================
start http://localhost:3000
