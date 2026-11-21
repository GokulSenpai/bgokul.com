@echo off
setlocal EnableDelayedExpansion
REM ==========================================================================
REM  Server.bat - start / stop / restart the Astro dev server for bgokul.com
REM
REM  Usage:   Server.bat              (interactive menu)
REM           Server.bat start | stop | restart | status | open
REM ==========================================================================

REM ---------------------- SETTINGS (edit these) -----------------------------
REM  HOST: localhost = only this PC.  0.0.0.0 = also reachable from phone/LAN.
set "HOST=localhost"
REM  PORT: the port in the link, e.g. http://localhost:4321
set "PORT=4321"
REM  OPEN_BROWSER: 1 = open the site in your browser after starting, 0 = don't
set "OPEN_BROWSER=1"
REM --------------------------------------------------------------------------

cd /d "%~dp0"
set "TITLE=bgokul.com dev server"

if /i "%~1"=="start"   goto :start
if /i "%~1"=="stop"    goto :stop
if /i "%~1"=="restart" goto :restart
if /i "%~1"=="status"  goto :status
if /i "%~1"=="open"    goto :open
if not "%~1"=="" (
    echo Unknown command "%~1". Use: start ^| stop ^| restart ^| status ^| open
    exit /b 1
)

:menu
call :seturl
echo.
echo  ==========================================
echo    bgokul.com dev server
echo    Link: !URL!
call :findpid
if defined PID (echo    Status: RUNNING ^(PID !PID!^)) else (echo    Status: stopped)
echo  ==========================================
echo    1. Start
echo    2. Stop
echo    3. Restart
echo    4. Open in browser
echo    5. Change host/port ^(this session only^)
echo    6. Exit
echo.
set "CHOICE="
set /p "CHOICE=  Choose 1-6: "
if "!CHOICE!"=="1" call :start & goto :menu
if "!CHOICE!"=="2" call :stop & goto :menu
if "!CHOICE!"=="3" call :restart & goto :menu
if "!CHOICE!"=="4" call :open & goto :menu
if "!CHOICE!"=="5" call :configure & goto :menu
if "!CHOICE!"=="6" exit /b 0
goto :menu

REM ---------------------------------------------------------------- start --
:start
call :seturl
call :findpid
if defined PID (
    echo  Server already running on port %PORT% ^(PID !PID!^): !URL!
    exit /b 0
)
if not exist "node_modules" (
    echo  node_modules missing - running npm install first...
    call npm install || (echo  npm install failed. & exit /b 1)
)
echo  Starting server on !URL! ...
REM Runs in its own window so you can see logs. Closing that window stops it.
REM If the server crashes, the window stays open (pause) so you can read the error.
start "%TITLE%" cmd /c "npx astro dev --host %HOST% --port %PORT% || pause"
REM Wait up to 120s for the port to start listening
for /l %%i in (1,1,120) do (
    call :findpid
    if defined PID goto :started
    ping -n 2 127.0.0.1 >nul
)
echo  Server did not come up within 120s - check the "%TITLE%" window.
exit /b 1
:started
echo  Running ^(PID !PID!^): !URL!
if "%OPEN_BROWSER%"=="1" start "" "!URL!"
exit /b 0

REM ----------------------------------------------------------------- stop --
:stop
call :findpid
if defined PID (
    echo  Stopping server ^(PID !PID!^)...
    taskkill /PID !PID! /T /F >nul 2>&1
) else (
    echo  No server listening on port %PORT%.
)
REM Clean up the log window and any npx/astro processes left for this port
powershell -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object { ($_.Name -eq 'cmd.exe' -or $_.Name -eq 'node.exe') -and $_.CommandLine -like '*astro*dev*--port %PORT%*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"
ping -n 2 127.0.0.1 >nul
echo  Stopped.
exit /b 0

REM -------------------------------------------------------------- restart --
:restart
call :stop
call :start
exit /b 0

REM --------------------------------------------------------------- status --
:status
call :seturl
call :findpid
if defined PID (echo  RUNNING on !URL! ^(PID !PID!^)) else (echo  Stopped. ^(would run on !URL!^))
exit /b 0

REM ----------------------------------------------------------------- open --
:open
call :seturl
start "" "!URL!"
exit /b 0

REM ------------------------------------------------------------ configure --
:configure
set /p "HOST=  Host [%HOST%]: "
set /p "PORT=  Port [%PORT%]: "
echo  (To make this permanent, edit the SETTINGS section at the top of Server.bat)
exit /b 0

REM -------------------------------------------------------------- helpers --
:seturl
if /i "%HOST%"=="0.0.0.0" (set "URL=http://localhost:%PORT%/") else (set "URL=http://%HOST%:%PORT%/")
exit /b 0

:findpid
REM Finds the PID listening on %PORT% (empty if none)
set "PID="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:":%PORT% .*LISTENING"') do (
    if not defined PID set "PID=%%p"
)
exit /b 0
