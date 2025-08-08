@echo off
echo Starting Video Game Management System (VGMS)
echo =============================================

REM Start backend server
echo Starting Backend Server...
start "VGMS Backend" cmd /k "cd VGMS-backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend server
echo Starting Frontend Server...
start "VGMS Frontend" cmd /k "cd VGMS-frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173 (or next available port)
echo.
echo Press any key to exit this script (servers will continue running)
pause > nul