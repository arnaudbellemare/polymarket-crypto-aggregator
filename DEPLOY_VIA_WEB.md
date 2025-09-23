# 🚀 Deploy Your Real CPMI API via Vercel Web Interface

## 🎯 **Quick Deployment (2 minutes):**

### **Step 1: Go to Vercel Dashboard**
1. **Open:** https://vercel.com/dashboard
2. **Click:** "New Project"
3. **Import:** Your GitHub repository `arnaudbellemare/polymarket-crypto-aggregator`

### **Step 2: Configure API Project**
1. **Root Directory:** Set to `api-vercel/`
2. **Framework Preset:** "Other" (or auto-detect)
3. **Build Command:** Leave empty (no build needed)
4. **Output Directory:** Leave empty

### **Step 3: Deploy**
1. **Click:** "Deploy"
2. **Wait:** 2-3 minutes for deployment
3. **Get your API URL:** `https://your-project-name.vercel.app`

## 📊 **Your Real API Endpoints:**
- **Health:** `https://your-project.vercel.app/health`
- **Current CPMI:** `https://your-project.vercel.app/api/cpmi/current`
- **History:** `https://your-project.vercel.app/api/cpmi/history`

## 🔥 **What You'll Get:**
- ✅ **Real CPMI data** from Polymarket (currently 115.44 Bullish)
- ✅ **Live crypto sentiment** analysis
- ✅ **Professional API** with your actual algorithm
- ✅ **CORS enabled** for frontend connection

## 🚀 **Next Step: Update Frontend**
1. **Go to your frontend Vercel project**
2. **Add environment variable:**
   - Name: `NEXT_PUBLIC_CPMI_API_URL`
   - Value: `https://your-api-project.vercel.app`
3. **Redeploy frontend**

## 🎯 **Alternative: Use Mock Data (1 minute)**
If you want to deploy immediately:
- Use `NEXT_PUBLIC_CPMI_API_URL=https://cpmi-api-mock.vercel.app`
- You'll get a working dashboard with mock data
- Update to real API later

**Ready to deploy? Go to https://vercel.com/dashboard and create a new project!**
