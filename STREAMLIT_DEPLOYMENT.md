# 🚀 CPMI Streamlit Deployment Guide

## 🎯 **Deployment Strategy:**
- **Frontend**: Streamlit Cloud (beautiful data dashboard)
- **Backend**: Your VM instance (real CPMI API)
- **Data**: Live Polymarket data (119.03 Bullish currently!)

## 📋 **Step-by-Step Deployment:**

### **Step 1: Setup API on VM**

#### **SSH into your VM:**
```bash
ssh your-username@your-vm-ip
```

#### **Upload your project:**
```bash
# Clone or upload your project to VM
git clone https://github.com/your-username/polymarket-crypto-aggregator.git
cd polymarket-crypto-aggregator
```

#### **Run the setup script:**
```bash
chmod +x setup_vm_api.sh
./setup_vm_api.sh
```

#### **Or manually:**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install dependencies
npm install

# Start API server
pm2 start src/api-server.js --name cpmi-api --env PORT=3001
pm2 save
pm2 startup

# Configure firewall
sudo ufw allow 3001/tcp
sudo ufw --force enable
```

### **Step 2: Deploy Streamlit App**

#### **Push to GitHub:**
```bash
git add .
git commit -m "Add Streamlit dashboard"
git push origin main
```

#### **Deploy to Streamlit Cloud:**
1. **Go to:** https://share.streamlit.io
2. **Click:** "New app"
3. **Repository:** `your-username/polymarket-crypto-aggregator`
4. **Branch:** `main`
5. **Main file path:** `streamlit_app.py`
6. **Click:** "Deploy!"

### **Step 3: Configure Streamlit App**

#### **In Streamlit Cloud settings:**
1. **Go to:** App settings → Secrets
2. **Add secret:**
```toml
[api]
base_url = "http://YOUR_VM_IP:3001"
```

#### **Or update the sidebar in the app:**
- Enter your VM IP address in the sidebar
- The app will connect to your API automatically

## 🎨 **What You'll Get:**

### **Beautiful Streamlit Dashboard:**
- ✅ **Real-time CPMI data** (currently 119.03 Bullish)
- ✅ **Interactive charts** with Plotly
- ✅ **Category breakdown** (Bitcoin, Ethereum, Altcoins)
- ✅ **Historical trends** and statistics
- ✅ **Auto-refresh** every 30 seconds
- ✅ **Responsive design** for mobile/desktop

### **Professional Features:**
- 📊 **Live metrics** with color-coded sentiment
- 📈 **Interactive charts** (zoom, hover, etc.)
- 🔄 **Auto-refresh** toggle
- 📱 **Mobile-friendly** design
- 🎨 **Beautiful UI** with custom CSS

## 🔧 **API Endpoints:**
Your VM API will serve:
- **Health:** `http://YOUR_VM_IP:3001/health`
- **Current CPMI:** `http://YOUR_VM_IP:3001/api/cpmi/current`
- **History:** `http://YOUR_VM_IP:3001/api/cpmi/history`

## 🚨 **Troubleshooting:**

### **API not accessible:**
```bash
# Check if API is running
pm2 status

# Check logs
pm2 logs cpmi-api

# Restart if needed
pm2 restart cpmi-api
```

### **Firewall issues:**
```bash
# Check firewall status
sudo ufw status

# Allow port 3001
sudo ufw allow 3001/tcp
```

### **Test API locally:**
```bash
curl http://YOUR_VM_IP:3001/health
curl http://YOUR_VM_IP:3001/api/cpmi/current
```

## 🎯 **Advantages of This Setup:**
- ✅ **Free hosting** (Streamlit Cloud)
- ✅ **Real-time data** from your VM
- ✅ **Professional dashboard** with Plotly
- ✅ **Easy updates** via GitHub
- ✅ **Scalable** and reliable
- ✅ **No authentication issues**

## 🚀 **Ready to Deploy?**
1. **Setup API on VM** (5 minutes)
2. **Push to GitHub** (1 minute)
3. **Deploy to Streamlit** (2 minutes)
4. **Enjoy your dashboard!** 🎉
