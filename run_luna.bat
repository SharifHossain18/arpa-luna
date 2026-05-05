@echo off
setlocal enabledelayedexpansion
set PORT=8080

:: Try to detect local IP
set IP=127.0.0.1
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4 Address"') do (
    set tempIP=%%a
    set tempIP=!tempIP: ^=!
    if "!tempIP:~0,7!"=="192.168" set IP=!tempIP!
    if "!tempIP:~0,3!"=="10." set IP=!tempIP!
    if "!tempIP:~0,4!"=="172." set IP=!tempIP!
)

set TARGET=http://127.0.0.1:%PORT%/index.html?fresh=%RANDOM%
set MOBILE_TARGET=http://%IP%:%PORT%

echo Starting Arpa's Luna...
echo.

:: Check if port is already in use
netstat -ano | findstr :%PORT% > nul
if %errorlevel% == 0 (
    echo Port %PORT% is already active.
    echo App is running. Opening browser...
) else (
    echo Starting local server on port %PORT%...
    start "Luna Server" /min cmd /c "npx -y http-server -p %PORT% -a 0.0.0.0"
    echo Waiting for server to initialize...
    timeout /t 3 /nobreak > nul
)

echo.
echo ========================================
echo  MOBILE ACCESS (Connect to same Wi-Fi):
echo  !MOBILE_TARGET!
echo ========================================
echo.

start "" "%TARGET%"
exit
