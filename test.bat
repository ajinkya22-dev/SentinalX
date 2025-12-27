@echo off
REM SentinelX Test Script
REM This script runs basic health checks on the platform

echo ========================================
echo  SentinelX Health Checks
echo ========================================
echo.

echo [1/4] Checking if backend is running...
curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Backend is not running or not accessible
    echo Please start the backend with start.bat
    echo.
    pause
    exit /b 1
) else (
    echo [OK] Backend is running
    curl -s http://localhost:8000/health
    echo.
)
echo.

echo [2/4] Testing Wazuh health endpoint...
curl -s http://localhost:8000/api/wazuh/health
echo.
echo.

echo [3/4] Testing MongoDB connection...
echo (Check backend logs for MongoDB connection status)
echo.

echo [4/4] Testing threat intelligence endpoint...
echo Testing IP lookup for 8.8.8.8...
curl -s http://localhost:8000/api/intel/ip/8.8.8.8
echo.
echo.

echo ========================================
echo  Health Check Complete
echo ========================================
echo.
echo API Documentation: http://localhost:8000/docs
echo.
pause
