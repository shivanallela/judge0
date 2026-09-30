@echo off
echo =======================================================
echo Setting up Judge0 Local Prerequisites (Admin Required)
echo =======================================================
echo.

:: Check for administrative rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator permissions...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

cd /d "c:\Users\shiva\judge0"
echo Starting installation... > setup.log
echo Running: wsl.exe --install -d Ubuntu-22.04 >> setup.log
wsl.exe --install -d Ubuntu-22.04 >> setup.log 2>&1
echo Finished with exit code: %errorLevel% >> setup.log

echo.
echo =======================================================
echo Log written to c:\Users\shiva\judge0\setup.log
echo =======================================================
pause
