#!/bin/bash

# PriceLens AI Setup Script
# This script helps set up the development environment

set -e

echo "🚀 PriceLens AI Setup"
echo "===================="
echo ""

# Check Python version
echo "📋 Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "   Found Python $python_version"
if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 10) else 1)"; then
    echo "❌ Python 3.10+ is required. Please upgrade Python."
    exit 1
fi
echo "✅ Python version OK"
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi
node_version=$(node --version)
echo "   Found Node.js $node_version"
echo "✅ Node.js version OK"
echo ""

# Create virtual environment
echo "📦 Creating Python virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi
echo ""

# Activate virtual environment and install dependencies
echo "📦 Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Python dependencies installed"
echo ""

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi
cd ..
echo ""

# Check for .env file
echo "📋 Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found"
    echo "   Creating .env from env.example..."
    cp env.example .env
    echo "   ⚠️  Please edit .env and add your OPENAI_API_KEY"
else
    echo "✅ .env file exists"
fi

# Check for frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  frontend/.env.local not found"
    echo "   Creating from env.local.example..."
    cp frontend/env.local.example frontend/.env.local 2>/dev/null || echo "   (No example file found)"
else
    echo "✅ frontend/.env.local exists"
fi
echo ""

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env and add your OPENAI_API_KEY"
echo "   2. Start the backend: python api.py"
echo "   3. Start the frontend: cd frontend && npm run dev"
echo ""
echo "🌐 The app will be available at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""

