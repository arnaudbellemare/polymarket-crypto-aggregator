#!/bin/bash

# CPMI API Setup Script for VM
echo "🚀 Setting up CPMI API on VM..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Navigate to project directory
cd /path/to/your/project  # Update this path

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Start API server with PM2
echo "🚀 Starting CPMI API server..."
pm2 start src/api-server.js --name cpmi-api --env PORT=3001

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 3001/tcp
sudo ufw --force enable

# Show status
echo "✅ Setup complete!"
echo "📊 API Status:"
pm2 status

echo ""
echo "🌐 Your API is now running at:"
echo "   http://YOUR_VM_IP:3001/health"
echo "   http://YOUR_VM_IP:3001/api/cpmi/current"
echo ""
echo "📝 Update your Streamlit app with your VM IP address!"
