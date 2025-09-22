# CPMI Frontend

A beautiful, responsive frontend for the Crypto Prediction Market Index (CPMI) built with Next.js, React, and Recharts.

## Features

- 📊 **Real-time CPMI Index** - Live updates every 30 seconds
- 📈 **Historical Charts** - Interactive line charts showing trends
- 🥧 **Category Distribution** - Pie charts showing market breakdown
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Glassmorphism design with gradient backgrounds
- ⚡ **Fast Loading** - Optimized for performance

## Quick Deploy to Vercel

1. **Fork this repository**
2. **Go to [Vercel](https://vercel.com)**
3. **Click "New Project"**
4. **Import your forked repository**
5. **Add Environment Variable:**
   - Name: `CPMI_API_URL`
   - Value: `http://YOUR_VM_IP:3000` (replace with your actual VM IP)
6. **Click "Deploy"**

## Local Development

```bash
# Install dependencies
npm install

# Set environment variable
export CPMI_API_URL=http://YOUR_VM_IP:3000

# Run development server
npm run dev
```

## Environment Variables

- `CPMI_API_URL` - URL of your CPMI backend API (required)

## API Endpoints Used

- `GET /api/cpmi/current` - Current CPMI index and categories
- `GET /api/cpmi/history` - Historical data and statistics

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **Lucide React** - Icons

## Customization

The frontend is fully customizable:

- **Colors**: Edit `tailwind.config.js` for theme colors
- **Charts**: Modify chart components in `pages/index.tsx`
- **Layout**: Update the component structure as needed
- **Styling**: Customize `styles/globals.css`

## Deployment

### Vercel (Recommended)
- One-click deploy from GitHub
- Automatic HTTPS
- Global CDN
- Environment variables support

### Other Platforms
- **Netlify**: Similar to Vercel
- **Railway**: Full-stack deployment
- **DigitalOcean App Platform**: Simple deployment

## Support

Make sure your CPMI backend is running on your VM before deploying the frontend!
