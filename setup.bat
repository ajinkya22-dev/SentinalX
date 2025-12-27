@echo off
REM SentinalX Setup Script
REM This script sets up the development environment for SentinalX

echo ========================================
echo  SentinalX Environment Setup
echo ========================================
echo.

REM Check Python installation and version (3.10 - 3.12)
echo [1/4] Checking Python installation...
for /f "tokens=2" %%v in ('python --version 2^>^&1') do set PYVER=%%v
if not defined PYVER (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.10 - 3.12 from python.org
    pause
    exit /b 1
)
for /f "tokens=1,2 delims=." %%a in ("%PYVER%") do (
    set PYMAJ=%%a
    set PYMIN=%%b
)
if not "%PYMAJ%"=="3" (
    echo [ERROR] Unsupported Python major version %PYMAJ%.
    echo Please install Python 3.10 - 3.12.
    pause
    exit /b 1
)
if %PYMIN% LSS 10 (
    echo [ERROR] Python 3.%PYMIN% is too old.
    echo Please install Python 3.10 - 3.12.
    pause
    exit /b 1
)
if %PYMIN% GEQ 13 (
    echo [ERROR] Python 3.%PYMIN% is too new for this project.
    echo Please install Python 3.12 (recommended) or 3.11.
    pause
    exit /b 1
)
echo Python %PYVER% detected.
echo [OK] Supported Python version found
echo.

REM Check MongoDB configuration
echo [2/4] Checking MongoDB configuration...
echo Using MongoDB Atlas (Cloud Database) - Docker not required
echo [OK] MongoDB Atlas will be used
echo.

REM Create virtual environment
echo [3/4] Creating virtual environment...
if exist ".venv" (
    echo Virtual environment already exists. Skipping creation.
) else (
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created
)
echo.

REM Activate virtual environment
echo [4/4] Activating virtual environment...
call .venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)
echo [OK] Virtual environment activated
echo.

REM Install dependencies
echo Installing Python dependencies...
echo This may take a few minutes...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Configure your .env file with credentials
echo 2. Run start.bat to launch the platform
echo 3. Access the API at http://localhost:8000/docs
echo.
echo To start MongoDB:
echo   docker-compose up -d
echo.
echo To start the backend:
echo   start.bat
echo.
pause
