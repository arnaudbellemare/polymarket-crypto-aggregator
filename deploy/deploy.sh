#!/bin/bash

# CPMI Deployment Script
echo "🚀 Deploying CPMI to production..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
mkdir -p data logs ssl

# Build and start services
echo "📦 Building and starting services..."
docker-compose -f deploy/docker-compose.yml up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f deploy/docker-compose.yml ps

# Test health endpoint
echo "🏥 Testing health endpoint..."
curl -f http://localhost/health || echo "⚠️ Health check failed"

echo "✅ Deployment complete!"
echo "📊 CPMI is now running at: http://your-domain.com"
echo "🔧 To view logs: docker-compose -f deploy/docker-compose.yml logs -f cpmi"
echo "🛑 To stop: docker-compose -f deploy/docker-compose.yml down"
