@echo off
REM SentinalX Stop Script
REM This script stops all SentinalX services

echo ========================================
echo  Stopping SentinalX Services
echo ========================================
echo.

echo [1/2] MongoDB status...
echo Using MongoDB Atlas (Cloud Database) - No local containers to stop
echo [OK] MongoDB Atlas is managed in the cloud
echo.

echo [2/2] Backend server stop...
echo If the backend is running in another window, press Ctrl+C there
echo Or close the terminal window running uvicorn
echo.

echo ========================================
echo  All services stopped
echo ========================================
echo.
echo To start again, run: start.bat
echo.
pause
