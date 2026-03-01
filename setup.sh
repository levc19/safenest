#!/bin/bash
# Quick start script for SafeNest

echo "🏠 SafeNest - Privacy-Preserving Child Safety Dashboard"
echo "=========================================================="
echo ""
echo "This script will help you start both the backend and frontend servers."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.7+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo "✅ Node.js found: $(node --version)"
echo ""

# Navigate to backend directory
echo "📦 Setting up backend..."
cd "$(dirname "$0")/backend"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "  Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "  Installing Python dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

echo "✅ Backend ready!"
echo ""

# Navigate to frontend directory
echo "📦 Setting up frontend..."
cd "../frontend"

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "  Installing Node.js dependencies (this may take a moment)..."
    npm install > /dev/null 2>&1
fi

echo "✅ Frontend ready!"
echo ""

echo "=========================================================="
echo "🚀 To start the servers:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd safenest/backend"
echo "  source venv/bin/activate"
echo "  python app.py"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd safenest/frontend"
echo "  npm start"
echo ""
echo "Then open http://localhost:3000 in your browser!"
echo "=========================================================="
