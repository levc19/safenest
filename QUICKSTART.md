# SafeNest - Quick Start Guide 🚀

## Start in Under 5 Minutes

### Step 1: Start the Backend (Terminal 1)
```bash
cd safenest/backend

# Activate virtual environment (one-time setup)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run the Flask server
python app.py
```

You should see:
```
🚀 SafeNest Backend starting on http://localhost:5000
⏱️  Alert retention: 15 minutes
✅ CORS enabled for frontend on http://localhost:3000
 * Running on http://0.0.0.0:5000
```

### Step 2: Start the Frontend (Terminal 2)
```bash
cd safenest/frontend

# Install dependencies (one-time setup)
npm install

# Start the React dev server
npm start
```

The browser should automatically open **http://localhost:3000**

---

## 🎮 Try It Out

1. **Toggle Signals:** Click checkboxes for safety signals
2. **Analyze Risk:** Click "🚀 Analyze Risk" to compute Child Risk Index
3. **View Results:** See risk score, danger tier, and triggered signals
4. **Demo Mode:** Click "🎲 Demo Mode" for random signals (great for judges!)
5. **Alert History:** Alerts appear in the right panel, auto-refresh every 3 seconds

---

## 📊 Understanding the Risk Score

The **Child Risk Index (CRI)** is calculated as:

```
risk_score = weighted_sum × confidence_factor (clamped to 0-100)
```

**Signal Weights:**
| Signal | Points |
|--------|--------|
| Distress Scream | +45 |
| Rapid Motion | +35 |
| Adult Loitering | +30 |
| Child Stopped Moving | +25 |
| Multiple Reports | +20 |
| After School Hours | +10 |

**Confidence (by # signals triggered):**
- 1 → 0.6
- 2 → 0.75
- 3+ → 0.9

**Danger Tiers:**
| Score | Color | Tier |
|-------|-------|------|
| 0-25 | 🟢 Green | Safe |
| 26-50 | 🟡 Yellow | Watch |
| 51-75 | 🟠 Orange | High Risk |
| 76-100 | 🔴 Red | Critical |

---

## 🔒 Privacy First

SafeNest is built with anonymity at its core:
- ✅ No names, faces, or IDs
- ✅ No video/audio storage
- ✅ Signals only (boolean values)
- ✅ Alerts auto-delete after 15 minutes
- ✅ This is a simulation prototype

See the Privacy & Anonymity banner in the dashboard for details.

---

## 🧪 Test Cases

**All Signals OFF:**
- Risk Score: 0
- Tier: 🟢 Green (Safe)

**4 Signals ON (scream + motion + loitering + reports):**
- Weighted Sum: 45 + 35 + 30 + 20 = 130
- Confidence: 0.9 (4 signals)
- Risk: 130 × 0.9 = 117 → clamped to 100
- Tier: 🔴 Red (Critical)

---

## 📡 API Endpoints

### POST /analyze-risk
Analyze signals and get risk score.
```bash
curl -X POST http://localhost:5000/analyze-risk \
  -H "Content-Type: application/json" \
  -d '{
    "signals": {
      "distress_scream_detected": true,
      "rapid_motion_detected": true,
      "child_stopped_moving": false,
      "adult_loitering_detected": true,
      "multiple_reports": false,
      "after_school_hours": true
    }
  }'
```

### GET /alerts
Get recent alerts (auto-purges after 15 min).
```bash
curl http://localhost:5000/alerts
```

---

## 🐛 Troubleshooting

**Backend won't start?**
- Check Python 3.7+ is installed: `python3 --version`
- Ensure port 5000 is free: `lsof -i :5000`
- Error: "ModuleNotFoundError"? Run `pip install -r requirements.txt` again

**Frontend won't start?**
- Check Node 14+ is installed: `node --version`
- Ensure port 3000 is free: `lsof -i :3000`
- Clear cache: `rm -rf node_modules && npm install`

**Can't connect frontend to backend?**
- Confirm backend is running on http://localhost:5000
- Check for CORS errors in browser console
- Restart both servers

**Alerts not appearing?**
- Make sure backend is running
- Frontend refreshes alerts every 3 seconds
- Alerts auto-purge after 15 minutes (by design!)

---

## 📁 Project Structure

```
safenest/
├── backend/
│   ├── app.py              # Flask API
│   ├── requirements.txt
│   └── utils/risk_scorer.py # Risk scoring engine
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── App.js          # Main component
│   │   ├── App.css
│   │   └── components/     # Signal/Results/History/Privacy
│   └── package.json
├── README.md               # Full documentation
├── QUICKSTART.md           # This file
└── setup.sh                # Helper script
```

---

## 🎯 For Judges

1. **Run setup.sh** to auto-install dependencies
2. **Start backend + frontend** (2 terminals)
3. **Click "🎲 Demo Mode"** to see different risk scenarios instantly
4. **Check the Privacy Banner** to see anonymity-by-design details
5. **Review the README** for full technical explanation

**Key Selling Points:**
- ✅ Real risk scoring algorithm (not ML black box)
- ✅ Privacy-first architecture (no personal data)
- ✅ Explainable & transparent
- ✅ Simulation-safe (no real monitoring)
- ✅ Clean, professional UI
- ✅ Production-ready code structure

---

Enjoy exploring SafeNest! 🏠
