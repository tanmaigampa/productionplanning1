# 🚀 STOCHOPT - Getting Started in 5 Minutes

## What You Have

A complete **two-stage stochastic production planning system** with:
- ✅ Working backend (Python + FastAPI + PuLP optimizer)
- ✅ Working frontend (React + TypeScript + Tailwind)
- ✅ Agriculture module (fully functional)
- ✅ Ready for GitHub deployment

---

## Step 1: Install Dependencies (2 minutes)

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

---

## Step 2: Start the Application (30 seconds)

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

✅ Backend running at: http://localhost:8000
✅ API docs at: http://localhost:8000/docs

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

✅ Frontend running at: http://localhost:5173

---

## Step 3: Use the Application (2 minutes)

1. **Open browser:** http://localhost:5173

2. **Click "Get Started"**

3. **Select "Agriculture"** (only working module for now)

4. **Fill in the wizard:**
   - Step 1: Total land = 100 acres, Plants/acre = 1000
   - Step 2: Add crops (default values are fine)
   - Step 3: Channel capacities (default values are fine)
   - Step 4: Add weather scenarios (default is 3 scenarios)
   - Step 5: Click "Run Optimization"

5. **View Results:**
   - Optimal planting plan
   - Expected profit
   - Scenario-specific decisions
   - Charts and visualizations

---

## Test API Directly (Optional)

```bash
# Test with example data
curl -X POST http://localhost:8000/api/agriculture/optimize \
  -H "Content-Type: application/json" \
  -d @examples/agriculture_example.json
```

---

## Deploy to Production (10 minutes)

See `docs/DEPLOYMENT.md` for detailed instructions.

**Quick version:**

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-url>
git push -u origin main
```

2. **Deploy Backend to Render:**
   - Go to render.com
   - New Web Service → Connect GitHub
   - Build: `pip install -r backend/requirements.txt`
   - Start: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Deploy Frontend to Vercel:**
   - Go to vercel.com
   - New Project → Import from GitHub
   - Root directory: `frontend`
   - Build: `npm run build`
   - Environment: `VITE_API_URL=<your-render-url>`

---

## Project Structure

```
stochopt/
├── backend/           # Python FastAPI + PuLP optimizer
├── frontend/          # React + TypeScript UI
├── examples/          # Sample input data
├── docs/              # Documentation
├── README.md          # Full documentation
└── PROJECT_SUMMARY.md # This file
```

---

## Common Issues

### Backend won't start
```bash
# Check Python version
python3 --version  # Should be 3.11+

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Frontend won't start
```bash
# Clear cache
rm -rf node_modules
npm install
```

### CORS errors
Update `backend/.env`:
```
ALLOWED_ORIGINS=http://localhost:5173
```

### Optimization fails
Check that:
- Scenario probabilities sum to 1.0
- All numbers are positive
- Land capacity is sufficient

---

## Next Steps

1. ✅ **Run locally** - Done!
2. 📦 **Deploy to production** - See DEPLOYMENT.md
3. 🎨 **Customize UI** - Edit frontend/src files
4. ➕ **Add new sectors** - Follow agriculture pattern
5. 📊 **Add features** - PDF export, save/load, etc.

---

## File Locations

**Backend optimizer:** `backend/app/optimizers/agriculture/optimizer.py`
**Frontend wizard:** `frontend/src/modules/agriculture/AgricultureModule.tsx`
**API endpoint:** `backend/app/api/agriculture.py`
**Results dashboard:** `frontend/src/modules/agriculture/results/Dashboard.tsx`

---

## Support

- 📚 Full docs: `README.md`
- 🚀 Deployment: `docs/DEPLOYMENT.md`
- 🐛 Issues: Check backend logs + browser console
- 📖 API docs: http://localhost:8000/docs

---

**🎉 You're all set! Happy optimizing!**
