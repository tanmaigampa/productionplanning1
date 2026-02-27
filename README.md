# 🚀 STOCHOPT - Multi-Sector Stochastic Production Planning System

A comprehensive web application for optimizing production planning under uncertainty using two-stage stochastic programming.

## 📋 Overview

STOCHOPT helps businesses make optimal production decisions when facing uncertainty in:
- **Agriculture** 🌾: Weather-driven crop planning
- **Manufacturing** 🏭: Demand-driven production (coming soon)
- **Pharma/Chemical** 🧪: Quality risk management (coming soon)
- **Food & Beverage** 🥫: Perishable production (coming soon)

### Key Features

✅ **Two-Stage Stochastic Optimization**
- Stage 1: Optimal upfront decisions (before uncertainty)
- Stage 2: Adaptive recourse actions (after scenarios unfold)

✅ **Multiple Scenario Analysis**
- Model uncertainty with weighted scenarios
- Understand best-case, worst-case, and expected outcomes

✅ **Profit Maximization**
- Maximize expected profit across all scenarios
- Detailed cost/revenue breakdowns

✅ **Interactive UI**
- Step-by-step wizard for data entry
- Real-time validation
- Beautiful visualizations

---

## 🏗️ Architecture

```
┌─────────────────────┐
│  React Frontend     │  (Port 5173)
│  - TypeScript       │
│  - Tailwind CSS     │
│  - Recharts         │
└──────────┬──────────┘
           │
           │ REST API
           │
┌──────────▼──────────┐
│  FastAPI Backend    │  (Port 8000)
│  - Python 3.11+     │
│  - PuLP Optimizer   │
│  - Pydantic         │
└─────────────────────┘
```

**Stack:**
- Frontend: React 18 + TypeScript + Vite + Tailwind
- Backend: FastAPI + PuLP (Linear Programming)
- Optimization: Two-stage stochastic programming
- Deployment: GitHub → Vercel (Frontend) + Render (Backend)

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **npm or yarn**

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd stochopt
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Run backend
uvicorn app.main:app --reload --port 8000
```

Backend will be available at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 📖 User Guide

### Agriculture Module - Quick Example

1. **Navigate to Module Selection**
   - Click "Get Started" → Select "Agriculture"

2. **Step 1: Farm Setup**
   - Enter total land: `100 acres`
   - Plants per acre: `1000`

3. **Step 2: Crop Data**
   - Configure crops (Strawberries, Blueberries, etc.)
   - Set costs and prices

4. **Step 3: Sales Channels**
   - Processing capacity: `150,000 lbs`
   - Retail capacity: `80,000 lbs`

5. **Step 4: Weather Scenarios**
   - Drought (30% probability, -30% yield)
   - Normal (50% probability, 0% yield change)
   - Wet (20% probability, +20% yield)

6. **Step 5: Review & Optimize**
   - Review all inputs
   - Click "Run Optimization"

7. **Results Dashboard**
   - View optimal planting plan
   - See expected profit and risk metrics
   - Analyze scenario-specific decisions
   - Export PDF/Excel report

---

## 🧮 Mathematical Model (Agriculture)

### Decision Variables

**Stage 1 (Here-and-Now):**
- `x[crop]` = Acres to plant

**Stage 2 (Wait-and-See, per scenario s):**
- `vendor_purchase[crop, s]` = Pounds to buy from vendor
- `contract_sales[crop, s]` = Pounds sold via contract
- `processing[crop, s]` = Pounds sent to processing
- `retail[crop, s]` = Pounds sold at retail
- `waste[crop, s]` = Pounds wasted
- `shortage[crop, s]` = Unmet demand

### Objective Function

```
Maximize Expected Profit = Σ(p_s × Profit_s)

where Profit_s = Revenue_s - Cost_s

Revenue_s = 
  + Contract_Price × Contract_Sales
  + Processing_Price × Processing × Pints_Per_Lb
  + Retail_Price × Retail_Sales

Cost_s = 
  + Planting_Cost × Acres                    (Stage 1)
  + Vendor_Cost × Vendor_Purchase           (Stage 2)
  + Waste_Cost × Waste
  + Shortage_Penalty × Shortage
```

### Constraints

1. **Land Limit:** `Σ(acres) ≤ Total_Land`
2. **Flow Balance:** `Yield + Vendor = Contract + Processing + Retail + Waste`
3. **Contract Minimum:** `Contract_Sales + Shortage ≥ Contract_Demand`
4. **Channel Capacity:** `Processing ≤ Processing_Capacity`, `Retail ≤ Retail_Capacity`
5. **Probabilities:** `Σ(p_s) = 1`
6. **Non-negativity:** All variables ≥ 0

---

## 📂 Project Structure

```
stochopt/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── agriculture.py          # API endpoints
│   │   ├── schemas/
│   │   │   ├── agriculture.py          # Pydantic models
│   │   │   └── common.py
│   │   ├── optimizers/
│   │   │   ├── base/
│   │   │   │   └── optimizer.py        # Abstract base class
│   │   │   └── agriculture/
│   │   │       └── optimizer.py        # Agriculture model
│   │   └── main.py                     # FastAPI app
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/                 # Reusable UI
│   │   ├── modules/
│   │   │   └── agriculture/
│   │   │       ├── AgricultureModule.tsx
│   │   │       └── results/
│   │   │           └── Dashboard.tsx
│   │   ├── pages/                      # Route pages
│   │   ├── services/                   # API calls
│   │   ├── types/                      # TypeScript types
│   │   └── App.tsx
│   ├── package.json
│   └── .env.example
│
├── examples/
│   └── agriculture_example.json        # Sample input
│
└── docs/
    └── README.md
```

---

## 🧪 Testing

### Test Backend Endpoint

```bash
# Using curl
curl -X POST http://localhost:8000/api/agriculture/optimize \
  -H "Content-Type: application/json" \
  -d @examples/agriculture_example.json

# Using Python
cd backend
python -c "
import json
import requests

with open('../examples/agriculture_example.json') as f:
    data = json.load(f)

response = requests.post('http://localhost:8000/api/agriculture/optimize', json=data)
print(json.dumps(response.json(), indent=2))
"
```

### Run Unit Tests

```bash
cd backend
pytest tests/ -v
```

---

## 🚀 Deployment

### Option 1: Vercel (Frontend) + Render (Backend)

#### Deploy Frontend to Vercel

```bash
cd frontend
npm run build

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set environment variable in Vercel:
- `VITE_API_URL` = `https://your-backend.onrender.com`

#### Deploy Backend to Render

1. Push code to GitHub
2. Create new Web Service on Render.com
3. Connect GitHub repository
4. Settings:
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3.11

### Option 2: Railway (All-in-One)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway up

# Deploy frontend
cd frontend
railway up
```

---

## 🎨 Customization

### Add New Sector

1. Create optimizer: `backend/app/optimizers/your_sector/optimizer.py`
2. Extend `BaseOptimizer` class
3. Implement abstract methods
4. Create Pydantic schemas
5. Add API endpoint
6. Create frontend module

### Modify Objective Function

Edit `define_objective()` in sector optimizer:

```python
def define_objective(self):
    # Your custom objective
    profit = lpSum([...])
    self.problem += profit
```

---

## 📊 API Documentation

Once backend is running, visit:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Example Endpoints

```
POST /api/agriculture/optimize
GET  /api/agriculture/health
GET  /health
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewSector`)
3. Commit changes (`git commit -m 'Add Manufacturing module'`)
4. Push to branch (`git push origin feature/NewSector`)
5. Open Pull Request

---

## 📝 License

MIT License - see LICENSE file

---

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Email: support@stochopt.com

---

## 🙏 Acknowledgments

- **PuLP** - Linear programming library
- **FastAPI** - Modern Python web framework
- **React** - UI library
- **Recharts** - Visualization library

---

**Built with ❤️ for better decision-making under uncertainty**
