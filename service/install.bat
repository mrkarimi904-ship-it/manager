@echo off

NET SESSION >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Requesting administrative privileges...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~dpnx0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

SET SERVICE_NAME=LPR_MANAGER
SET APP_PATH=%~dp0..\dist\main.js
SET NODE_PATH=node

nssm install %SERVICE_NAME% %NODE_PATH% %APP_PATH%
nssm set %SERVICE_NAME% Description "LPR MANAGER Service"
nssm set %SERVICE_NAME% AppDirectory %~dp0..
nssm start %SERVICE_NAME%
