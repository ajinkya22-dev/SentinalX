@echo off
REM SentinalX Quick Start (MongoDB Atlas)
REM Run this after completing MongoDB Atlas setup

echo ========================================
echo  SentinalX Quick Start
echo ========================================
echo.

REM Check if virtual environment exists
if not exist ".venv" (
    echo [ERROR] Virtual environment not found
    echo Please run setup.bat first
    pause
    exit /b 1
)

REM Activate virtual environment
echo [1/3] Activating virtual environment...
call .venv\Scripts\activate.bat
echo [OK] Virtual environment activated
echo.

REM Initialize MongoDB Atlas collections (first time only)
echo [2/3] Checking MongoDB Atlas setup...
echo.
echo If this is your FIRST TIME running SentinalX, type 'yes' to initialize database
echo If you've already initialized collections, type 'no' to skip
echo.
set /p INIT_DB="Initialize MongoDB Atlas collections? (yes/no): "

if /i "%INIT_DB%"=="yes" (
    echo.
    echo Initializing MongoDB Atlas...
    python setup_mongodb.py
    if errorlevel 1 (
        echo [ERROR] Failed to initialize MongoDB Atlas
        echo Please check your .env file configuration
        pause
        exit /b 1
    )
    echo [OK] MongoDB Atlas initialized
    echo.
)

REM Start backend server
echo [3/3] Starting SentinalX backend...
echo.
echo Backend will run on: http://localhost:8000
echo Health check: http://localhost:8000/health
echo.
echo Press Ctrl+C to stop the server
echo.
uvicorn backend.app:app --reload --port 8000

pause
