#!/bin/bash

# Script to start the EcoScan API server

# Directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Parent directory (project root)
PROJECT_ROOT="$(dirname "$DIR")"

# API directory
API_DIR="$PROJECT_ROOT/src/api"

# Check if Python environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Warning: No Python virtual environment detected."
    echo "It's recommended to activate a virtual environment before running this script."
    echo "Example: source venv/bin/activate"
    echo ""
fi

# Check for required files
if [ ! -f "$PROJECT_ROOT/.env" ]; then
    if [ -f "$PROJECT_ROOT/.env.example" ]; then
        echo "Warning: No .env file found. Creating one from .env.example."
        cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env"
        echo "Please edit $PROJECT_ROOT/.env to add your Gemini API key."
    else
        echo "Error: No .env file found and no .env.example to copy from."
        exit 1
    fi
fi

# Check if requirements are installed
if ! pip show fastapi &>/dev/null; then
    echo "Installing required Python packages..."
    pip install -r "$PROJECT_ROOT/requirements.txt"
fi

# Start the server
echo "Starting EcoScan API server..."
cd "$API_DIR" && python server.py
