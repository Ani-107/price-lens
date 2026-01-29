@echo off
REM PriceLens AI Setup Script for Windows
REM This script helps set up the development environment

echo 🚀 PriceLens AI Setup
echo ====================
echo.

REM Check Python version
echo 📋 Checking Python version...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.10+
    exit /b 1
)
python --version
echo ✅ Python found
echo.

REM Check Node.js version
echo 📋 Checking Node.js version...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+
    exit /b 1
)
node --version
echo ✅ Node.js found
echo.

REM Create virtual environment
echo 📦 Creating Python virtual environment...
if not exist "venv" (
    python -m venv venv
    echo ✅ Virtual environment created
) else (
    echo ✅ Virtual environment already exists
)
echo.

REM Activate virtual environment and install dependencies
echo 📦 Installing Python dependencies...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
echo ✅ Python dependencies installed
echo.

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
if not exist "node_modules" (
    call npm install
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies already installed
)
cd ..
echo.

REM Check for .env file
echo 📋 Checking environment configuration...
if not exist ".env" (
    echo ⚠️  .env file not found
    echo    Creating .env from env.example...
    copy env.example .env >nul
    echo    ⚠️  Please edit .env and add your OPENAI_API_KEY
) else (
    echo ✅ .env file exists
)

REM Check for frontend .env.local
if not exist "frontend\.env.local" (
    echo ⚠️  frontend\.env.local not found
    if exist "frontend\env.local.example" (
        echo    Creating from env.local.example...
        copy frontend\env.local.example frontend\.env.local >nul
    )
) else (
    echo ✅ frontend\.env.local exists
)
echo.

echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo    1. Edit .env and add your OPENAI_API_KEY
echo    2. Start the backend: python api.py
echo    3. Start the frontend: cd frontend ^&^& npm run dev
echo.
echo 🌐 The app will be available at:
echo    Frontend: http://localhost:3000
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.

pause

