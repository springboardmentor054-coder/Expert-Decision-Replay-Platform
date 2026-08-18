@echo off
REM Backend startup script for Windows

echo.
echo ========================================
echo Expert Decision Replay - Backend Startup
echo ========================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo.env file not found. Creating from .env.example...
    copy .env.example .env
    echo Created .env - using SQLite for local development
    echo.
)

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    exit /b 1
)

echo Checking dependencies...
pip show uvicorn >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing requirements...
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo Failed to install requirements
        exit /b 1
    )
)

echo.
echo ========================================
echo Starting Backend Server
echo ========================================
echo.
echo Access the API at:
echo   http://127.0.0.1:8000
echo.
echo API Documentation:
echo   http://127.0.0.1:8000/api/docs
echo.
echo Press CTRL+C to stop the server
echo.

python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

pause
