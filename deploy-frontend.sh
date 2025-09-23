#!/bin/bash

# CPMI Frontend Deployment Script
echo "🚀 Deploying CPMI Frontend..."

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Build the frontend
echo "🔨 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
    echo ""
    echo "🌐 To deploy:"
    echo "1. For Vercel: cd frontend && npx vercel --prod"
    echo "2. For other platforms: Use the .next folder"
    echo ""
    echo "⚙️  Don't forget to set NEXT_PUBLIC_CPMI_API_URL environment variable"
    echo "   to point to your API server URL"
else
    echo "❌ Frontend build failed!"
    exit 1
fi
