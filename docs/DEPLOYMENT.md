# 🚀 Deployment Guide - STOCHOPT

## Overview

This guide covers deploying STOCHOPT to production using free-tier services.

**Recommended Stack:**
- **Frontend:** Vercel (free tier)
- **Backend:** Render (free tier)
- **Code:** GitHub

---

## 📦 Pre-Deployment Checklist

### 1. Test Locally

```bash
# Backend
cd backend
source venv/bin/activate
pytest tests/ -v
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run build
npm run preview
```

### 2. Update Environment Variables

**Backend (.env):**
```env
API_HOST=0.0.0.0
API_PORT=8000
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-backend.onrender.com
```

### 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/stochopt.git
git push -u origin main
```

---

## 🔧 Option 1: Vercel + Render (Recommended)

### Deploy Backend to Render

1. **Sign up at render.com**

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select repository: `stochopt`

3. **Configure Service**
   ```
   Name: stochopt-backend
   Region: Choose closest to users
   Branch: main
   Root Directory: backend
   Runtime: Python 3.11
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

4. **Add Environment Variables**
   ```
   ALLOWED_ORIGINS=https://your-frontend.vercel.app
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Copy service URL: `https://stochopt-backend-xxx.onrender.com`

### Deploy Frontend to Vercel

1. **Sign up at vercel.com**

2. **Import Project**
   - Click "Add New" → "Project"
   - Import from GitHub
   - Select `stochopt` repository

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variable**
   ```
   VITE_API_URL=https://stochopt-backend-xxx.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build (1-2 minutes)
   - Your site is live! 🎉

---

## 🔧 Option 2: Railway (All-in-One)

Railway can host both frontend and backend in one place.

### 1. Install Railway CLI

```bash
npm i -g @railway/cli
railway login
```

### 2. Deploy Backend

```bash
cd backend
railway init
railway up
```

Set environment variables in Railway dashboard:
```
ALLOWED_ORIGINS=*
```

### 3. Deploy Frontend

```bash
cd frontend
railway init
railway up
```

Set environment variables:
```
VITE_API_URL=https://your-backend.railway.app
```

---

## 🔧 Option 3: GitHub Pages + Render

### Deploy Backend to Render
(Same as Option 1)

### Deploy Frontend to GitHub Pages

1. **Install gh-pages**
```bash
cd frontend
npm install --save-dev gh-pages
```

2. **Update package.json**
```json
{
  "homepage": "https://yourusername.github.io/stochopt",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. **Deploy**
```bash
npm run deploy
```

---

## 🔄 Continuous Deployment

### Vercel

Vercel auto-deploys on every push to `main`:
1. Push to GitHub
2. Vercel builds automatically
3. New version live in 1-2 minutes

### Render

Render auto-deploys on every push to `main`:
1. Push to GitHub
2. Render rebuilds backend
3. New version live in 2-3 minutes

---

## 🧪 Testing Production

### Test Backend

```bash
curl https://your-backend.onrender.com/health
curl https://your-backend.onrender.com/api/agriculture/health
```

### Test Frontend

1. Visit: `https://your-frontend.vercel.app`
2. Navigate to Agriculture module
3. Fill in data
4. Run optimization
5. Verify results display correctly

---

## 📊 Monitoring

### Render Dashboard
- View logs: `Logs` tab
- Check metrics: `Metrics` tab
- Monitor uptime: `Events` tab

### Vercel Dashboard
- View deployments: `Deployments` tab
- Check analytics: `Analytics` tab
- Monitor performance: `Speed Insights`

---

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Optimization fails
```bash
# Check logs
railway logs --tail

# Test locally
cd backend
pytest tests/ -v
```

**Problem:** CORS errors
- Update `ALLOWED_ORIGINS` environment variable
- Include frontend URL with `https://`

### Frontend Issues

**Problem:** API calls fail
- Check `VITE_API_URL` environment variable
- Verify backend is running
- Check CORS configuration

**Problem:** Build fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

---

## 🔐 Security Checklist

- [ ] Environment variables set correctly
- [ ] No sensitive data in git
- [ ] CORS configured properly (specific origins, not `*`)
- [ ] API rate limiting enabled (future)
- [ ] HTTPS enforced

---

## 💰 Cost Estimates (Free Tier Limits)

### Vercel (Free)
- ✅ Unlimited websites
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN

### Render (Free)
- ✅ 512 MB RAM
- ✅ Shared CPU
- ⚠️ Spins down after 15 min inactivity (cold start: ~30s)
- ✅ 750 hours/month

**Tip:** Render free tier sleeps after inactivity. For instant response, upgrade to paid ($7/month).

---

## 🎯 Production Best Practices

1. **Use Environment Variables**
   - Never hardcode URLs or secrets
   - Use `.env.example` as template

2. **Monitor Performance**
   - Set up error tracking (Sentry)
   - Monitor API response times

3. **Optimize Build**
   - Enable compression
   - Minimize bundle size
   - Use lazy loading

4. **Backup Strategy**
   - Keep git history clean
   - Tag releases
   - Document changes

---

## 📈 Scaling (When You Outgrow Free Tier)

### Backend Scaling
- Upgrade Render: $7/month → Always-on, 512MB RAM
- Or switch to: AWS Lambda, Google Cloud Run, Digital Ocean

### Frontend Scaling
- Vercel Pro: $20/month → More bandwidth, analytics
- Or use: Netlify, Cloudflare Pages

### Database (Future)
- If you add database: Render PostgreSQL ($7/month)
- Or: Supabase, PlanetScale, Neon

---

## ✅ Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS working correctly
- [ ] API calls successful
- [ ] Optimization runs successfully
- [ ] Results display correctly
- [ ] Export functionality works
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)

---

**🎉 Congratulations! Your STOCHOPT app is now live!**

Share your deployment: `https://your-app.vercel.app`
