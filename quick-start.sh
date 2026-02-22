#!/bin/bash

echo "🚀 Nurse Guru - Quick Start Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -d "nurse-guru-fullstack" ]; then
    echo "❌ Error: Run this script from the workspace root"
    echo "   Expected to find 'nurse-guru-fullstack' directory"
    exit 1
fi

cd nurse-guru-fullstack

echo ""
echo "📦 Checking installations..."

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
if [ ! -f "data/dev.db" ]; then
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
echo "Terminal 1 - Backend:"
echo "  cd nurse-guru-fullstack/server && npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd nurse-guru-fullstack/client && npm run dev"
echo ""
echo "Frontend URL: http://localhost:5173"
echo "Backend URL: http://localhost:3001"
echo ""
echo "Demo login: sarah.rn@example.com / password123"
echo ""
