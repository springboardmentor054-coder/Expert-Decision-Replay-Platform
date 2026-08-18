@echo off
REM Quick setup script for Expert Decision Replay Platform (Windows)

echo.
echo ========================================
echo Expert Decision Replay Platform - Setup
echo ========================================
echo.

REM Check if running from correct directory
if not exist "docker-compose.yml" (
    echo Error: docker-compose.yml not found
    echo Please run from project root
    exit /b 1
)

echo [1/3] Creating environment file...
if not exist ".env" (
    copy .env.example .env
    echo Created .env file - please update with your configuration
) else (
    echo .env already exists
)
echo.

echo [2/3] Building Docker images...
docker-compose build
echo.

echo [3/3] Starting services...
docker-compose up -d
echo.

timeout /t 5 /nobreak

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Access Points:
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/api/docs
echo   Database:  localhost:5432
echo.
echo View logs:         docker-compose logs -f
echo Stop services:     docker-compose down
echo Run tests:         docker-compose run --rm backend pytest tests/
echo.
echo Documentation:
echo   TESTING.md
echo   BUG_FIXES.md
echo   DOCKER_DEPLOYMENT.md
echo   IMPLEMENTATION_SUMMARY.md
echo.
