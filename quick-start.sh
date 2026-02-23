#!/bin/bash

echo "🚀 Nurse Guru - Quick Start Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the nurse-guru-fullstack directory"
    echo "   Make sure you're in the project root"
    exit 1
fi

echo ""
echo "📦 Checking installations..."

# Check root dependencies
if [ ! -d "node_modules" ]; then
    echo "⚠️  Installing root dependencies (concurrently)..."
    npm install --silent
fi

# Check server
if [ ! -d "server/node_modules" ]; then
    echo "⚠️  Installing server dependencies..."
    cd server && npm install --silent && cd ..
fi

# Check client
if [ ! -d "client/node_modules" ]; then
    echo "⚠️  Installing client dependencies..."
    cd client && npm install --silent && cd ..
fi

echo "✅ Dependencies ready"

# Check database
if [ ! -f "server/dev.db" ]; then
    echo ""
    echo "📊 Setting up database..."
    cd server && npm run db:migrate > /dev/null 2>&1 && npm run db:seed > /dev/null 2>&1 && cd ..
    echo "✅ Database ready"
else
    echo "✅ Database already exists"
fi

echo ""
echo "🎉 Setup Complete! Ready to run:"
echo ""
echo "Start both frontend and backend concurrently:"
echo "  npm run dev"
echo ""
echo "Or run them separately in different terminals:"
echo ""
echo "Terminal 1 - Backend:"
echo "  npm run dev:server"
echo ""
echo "Terminal 2 - Frontend:"
echo "  npm run dev:client"
echo ""

echo "Frontend URL: http://localhost:5173"
echo "Backend URL: http://localhost:3001"
echo ""
echo "Demo login: sarah.rn@example.com / password123"
echo ""
