#!/bin/bash

# CPMI Real API Deployment Script for Vercel
echo "🚀 Deploying CPMI Real API to Vercel..."

# Check if we're in the right directory
if [ ! -f "api-vercel/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing API dependencies..."
cd api-vercel
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🌐 To deploy to Vercel:"
    echo "1. Run: npx vercel --prod"
    echo "2. Or use Vercel CLI: vercel --prod"
    echo ""
    echo "📊 Your real CPMI API will be available at:"
    echo "   - Health: https://your-project.vercel.app/health"
    echo "   - Current: https://your-project.vercel.app/api/cpmi/current"
    echo "   - History: https://your-project.vercel.app/api/cpmi/history"
    echo ""
    echo "⚙️  After deployment, update your frontend environment variable:"
    echo "   NEXT_PUBLIC_CPMI_API_URL=https://your-project.vercel.app"
else
    echo "❌ Failed to install dependencies!"
    exit 1
fi
