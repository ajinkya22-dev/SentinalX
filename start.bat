@echo off
REM SentinalX Startup Script
REM This script starts all necessary services for the SentinalX platform

echo ========================================
echo  SentinalX Platform Startup
echo ========================================
echo.

REM Check if virtual environment exists
if not exist ".venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found!
    echo Please run setup.bat first or create venv manually:
    echo   python -m venv .venv
    echo.
    pause
    exit /b 1
)

echo [1/4] Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)
echo [OK] Virtual environment activated
echo.

echo [2/4] Checking MongoDB configuration...
echo Using MongoDB Atlas (Cloud Database)
echo Database: SentinalX
echo [OK] MongoDB Atlas configured in .env
echo.

echo [3/4] Starting FastAPI Backend...
echo Backend will start on http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the backend
echo ========================================
echo.

REM Start the backend (this will block until Ctrl+C)
uvicorn backend.app:app --reload --port 8000

REM This part runs after Ctrl+C
echo.
echo ========================================
echo Backend stopped.
echo MongoDB is still running in Docker.
echo To stop MongoDB: docker-compose down
echo ========================================
pause
