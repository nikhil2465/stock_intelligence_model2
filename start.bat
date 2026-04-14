@echo off
cd /d %~dp0
echo ============================================================
echo   StockSense AI — React + FastAPI Startup
echo ============================================================
echo.

REM === Check for Python ===
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Install from https://python.org
    pause
    exit /b 1
)

REM === Check for Node ===
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

REM === Setup .env if missing ===
if not exist "backend\.env" (
    echo [INFO] Creating backend\.env from template...
    copy "backend\.env.example" "backend\.env"
    echo.
    echo [ACTION REQUIRED] Open backend\.env and add your OpenAI API key:
    echo   OPENAI_API_KEY=sk-...
    echo.
    notepad "backend\.env"
    pause
)

REM === Install backend dependencies ===
echo [1/4] Installing Python dependencies...
cd backend
python -m pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install Python deps. Check requirements.txt
    pause
    exit /b 1
)
cd ..

REM === Install frontend dependencies ===
echo [2/4] Installing Node dependencies...
cd frontend
if not exist "node_modules" (
    npm install --silent
    if errorlevel 1 (
        echo [ERROR] Failed to install Node deps.
        pause
        exit /b 1
    )
)
cd ..

echo.
echo [3/4] Starting FastAPI backend on http://localhost:8000 ...
start "StockSense Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo [4/4] Starting React frontend on http://localhost:3000 ...
start "StockSense Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ============================================================
echo   Both servers are starting in separate windows.
echo   Open http://localhost:3000 in your browser.
echo.
echo   Backend API docs: http://localhost:8000/docs
echo   Health check:     http://localhost:8000/health
echo ============================================================
echo.
pause
