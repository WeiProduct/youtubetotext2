#!/bin/bash

echo "🚀 Starting YouTube to Text locally..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Kill any existing process on port 3000
echo "🔍 Checking for existing processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Set environment to development
export NODE_ENV=development
export NEXT_PUBLIC_DEBUG_MODE=true

echo ""
echo "🌟 Starting development server..."
echo "📌 Local URL: http://localhost:3000"
echo "📌 Debug panel will be enabled"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev