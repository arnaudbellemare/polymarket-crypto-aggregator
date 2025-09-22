# 🚀 CPMI Deployment Guide

## Quick Start Options

### Option 1: Docker Deployment (Recommended)
```bash
# Clone and deploy
git clone <your-repo>
cd polymarket-crypto-aggregator
./deploy/deploy.sh
```

### Option 2: Simple VPS Deployment
```bash
# On your VPS
git clone <your-repo>
cd polymarket-crypto-aggregator
npm install
npm install -g pm2
pm2 start src/api-server.js --name cpmi
pm2 save
pm2 startup
```

### Option 3: Vercel + Separate Server
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy API server to VPS
- **Database**: Use Supabase (hosted or self-hosted)

## 🐳 Docker Deployment (Full Stack)

### Prerequisites
- Docker & Docker Compose installed
- Domain name (optional, for SSL)

### Steps
1. **Clone repository**
   ```bash
   git clone <your-repo>
   cd polymarket-crypto-aggregator
   ```

2. **Configure SSL (optional)**
   ```bash
   # Place your SSL certificates in deploy/ssl/
   cp your-cert.pem deploy/ssl/cert.pem
   cp your-key.pem deploy/ssl/key.pem
   ```

3. **Deploy**
   ```bash
   ./deploy/deploy.sh
   ```

4. **Access your CPMI**
   - API: `http://your-domain.com/api/cpmi/current`
   - Health: `http://your-domain.com/health`

## 🖥️ VPS Deployment (Simple)

### Prerequisites
- Ubuntu/Debian VPS
- Node.js 18+
- PM2 installed

### Steps
1. **Setup server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Deploy application**
   ```bash
   # Clone repo
   git clone <your-repo>
   cd polymarket-crypto-aggregator
   
   # Install dependencies
   npm install
   
   # Start with PM2
   pm2 start src/api-server.js --name cpmi
   pm2 save
   pm2 startup
   ```

3. **Setup reverse proxy (optional)**
   ```bash
   # Install Nginx
   sudo apt install nginx
   
   # Configure Nginx
   sudo nano /etc/nginx/sites-available/cpmi
   ```

## 🌐 Vercel Deployment (Frontend Only)

### Prerequisites
- Vercel account
- Separate server for backend

### Steps
1. **Create Vercel project**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configure environment variables**
   ```bash
   # In Vercel dashboard
   CPMI_API_URL=https://your-server.com/api
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

## 📊 API Endpoints

Once deployed, your CPMI will be available at:

- **Health Check**: `GET /health`
- **Current Index**: `GET /api/cpmi/current`
- **History**: `GET /api/cpmi/history`
- **Full Export**: `GET /api/cpmi/export`
- **Configuration**: `GET /api/cpmi/config`

### Example Response
```json
{
  "success": true,
  "data": {
    "index": 102.70,
    "categories": {
      "bitcoin-markets": 53.2,
      "ethereum-ecosystem": 49.9,
      "major-altcoins": 61.0
    },
    "timestamp": "2025-01-22T18:48:45.000Z"
  }
}
```

## 🔧 Configuration

### Environment Variables
```bash
NODE_ENV=production
PORT=3000
CPMI_UPDATE_INTERVAL=300000  # 5 minutes
CPMI_SMOOTHING_PERIOD=3600000  # 1 hour
```

### PM2 Configuration
```bash
# View logs
pm2 logs cpmi

# Restart
pm2 restart cpmi

# Stop
pm2 stop cpmi

# Monitor
pm2 monit
```

## 🛡️ Security Considerations

1. **SSL/TLS**: Always use HTTPS in production
2. **Rate Limiting**: Implement rate limiting for API endpoints
3. **Authentication**: Add API keys if needed
4. **Firewall**: Configure firewall rules
5. **Monitoring**: Set up monitoring and alerts

## 📈 Monitoring

### Health Checks
```bash
# Check if CPMI is running
curl http://localhost:3000/health

# Check PM2 status
pm2 status

# View logs
pm2 logs cpmi --lines 100
```

### Logs
- **Application logs**: `./logs/`
- **PM2 logs**: `pm2 logs cpmi`
- **Docker logs**: `docker-compose logs cpmi`

## 🔄 Updates

### Docker
```bash
git pull
docker-compose -f deploy/docker-compose.yml up -d --build
```

### PM2
```bash
git pull
npm install
pm2 restart cpmi
```

## 🆘 Troubleshooting

### Common Issues
1. **Port conflicts**: Change PORT environment variable
2. **Memory issues**: Increase PM2 memory limit
3. **API rate limits**: Check Kraken API limits
4. **SSL issues**: Verify certificate paths

### Debug Mode
```bash
# Run in debug mode
NODE_ENV=development npm run cpmi
```

## 📞 Support

For issues or questions:
1. Check logs first
2. Verify API endpoints
3. Test with curl commands
4. Check PM2/Docker status
