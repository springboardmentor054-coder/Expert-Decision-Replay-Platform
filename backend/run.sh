#!/bin/bash

# Backend startup script for Linux/Mac

echo ""
echo "========================================"
echo "Expert Decision Replay - Backend Startup"
echo "========================================"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ".env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "Created .env - using SQLite for local development"
    echo ""
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

echo "Python version:"
python3 --version
echo ""

echo "Checking dependencies..."
if ! python3 -c "import uvicorn" 2>/dev/null; then
    echo "Installing requirements..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "Failed to install requirements"
        exit 1
    fi
fi

echo ""
echo "========================================"
echo "Starting Backend Server"
echo "========================================"
echo ""
echo "Access the API at:"
echo "  http://127.0.0.1:8000"
echo ""
echo "API Documentation:"
echo "  http://127.0.0.1:8000/api/docs"
echo ""
echo "Press CTRL+C to stop the server"
echo ""

python3 -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
