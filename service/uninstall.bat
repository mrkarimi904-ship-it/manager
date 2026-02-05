@echo off

NET SESSION >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Requesting administrative privileges...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~dpnx0' -Verb RunAs"
    exit /b
)

cd /d "%~dp0"

SET SERVICE_NAME=LPR_MANAGER

nssm stop %SERVICE_NAME%
nssm remove %SERVICE_NAME% confirm
