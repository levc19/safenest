# SafeNest 🏠

**Privacy-Preserving Child Safety Risk Intelligence Web Dashboard**

A hackathon prototype demonstrating how to build child safety monitoring systems with anonymity and privacy at the core.

---

## 🎯 Overview

SafeNest simulates a child safety monitoring platform that computes a **Child Risk Index (CRI)** score (0–100) from multiple anonymized safety signals, classifies risks into danger tiers (Green/Yellow/Orange/Red), and maintains strict privacy-by-design principles.

**Key Features:**
- ✅ Signal-based risk scoring engine (backend)
- ✅ Real-time risk analysis API (Flask)
- ✅ Interactive dashboard (React)
- ✅ Alert history with automatic 15-minute data purge
- ✅ Privacy-first architecture (no personal data storage)
- ✅ Clean, presentation-ready UI

---

## 📁 Project Structure

```
safenest/
├── backend/
│   ├── app.py                 # Flask main app
│   ├── requirements.txt        # Python dependencies
│   └── utils/
│       ├── __init__.py
│       └── risk_scorer.py      # Risk scoring engine
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js             # Main React component
│       ├── App.css            # Styling
│       ├── index.js
│       ├── index.css
│       └── components/
│           ├── SignalSimulator.js      # Signal toggle switches
│           ├── ResultsCard.js          # Risk results display
│           ├── AlertHistory.js         # Alert history table
│           └── PrivacyBanner.js        # Privacy explanation
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14+) and **npm** for frontend
- **Python** (v3.7+) for backend
- Two terminal windows

---

### Backend Setup

1. **Open a terminal and navigate to the backend:**
   ```bash
   cd safenest/backend
   ```

2. **Create a virtual environment (optional but recommended):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On macOS/Linux
   # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask server:**
   ```bash
   python app.py
   ```

   **Expected output:**
   ```
   🚀 SafeNest Backend starting on http://localhost:5000
   ⏱️  Alert retention: 15 minutes
   ✅ CORS enabled for frontend on http://localhost:3000
   ```

   The backend is now running on **http://localhost:5000**

---

### Frontend Setup

1. **Open a new terminal and navigate to the frontend:**
   ```bash
   cd safenest/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

   Your browser should automatically open **http://localhost:3000**

---

## 💡 How It Works

### 1. Signal Simulator

The dashboard displays 6 safety signals as toggle switches:

- **Distress Scream Detected** - Audio signal indicating child distress
- **Rapid Motion Detected** - Sudden movement (possible struggle)
- **Child Stopped Moving** - Absence of motion (potential harm)
- **Adult Loitering Detected** - Suspicious adult proximity
- **Multiple Reports** - Multiple sources reporting same incident
- **After School Hours** - Risk signal based on time of day

Toggle any combination and click **"🚀 Analyze Risk"** to compute the CRI.

### 2. Child Risk Index (CRI) Scoring

The risk score calculation follows this algorithm:

#### Step 1: Signal Weights
Each triggered signal contributes points:

| Signal | Weight | Rationale |
|--------|--------|-----------|
| Distress Scream | +45 | Strongest direct indication of distress |
| Rapid Motion | +35 | Suggests struggle or panic |
| Adult Loitering | +30 | Suspicious proximity |
| Child Stopped Moving | +25 | Potential harm or capture |
| Multiple Reports | +20 | Corroborating evidence |
| After School Hours | +10 | Higher risk time window |

#### Step 2: Confidence Factor
Multiply the weighted sum by a confidence factor based on signal count:

- **1 signal** → 0.6 (low confidence)
- **2 signals** → 0.75 (moderate confidence)
- **3+ signals** → 0.9 (high confidence)

**Formula:**
```
risk_score = min(100, weighted_sum × confidence_factor)
```

**Example:**
- Signals triggered: `distress_scream_detected=True`, `rapid_motion_detected=True`
- Weighted sum: 45 + 35 = 80 points
- Confidence: 0.75 (2 signals triggered)
- Risk score: 80 × 0.75 = **60.0**

#### Step 3: Danger Classification

| Score Range | Color  | Tier | Action |
|-------------|--------|------|--------|
| 0–25 | 🟢 Green | Safe | No action needed |
| 26–50 | 🟡 Yellow | Watch | Monitor situation |
| 51–75 | 🟠 Orange | High Risk | Immediate intervention needed |
| 76–100 | 🔴 Red | Critical | Emergency response |

### 3. Escalation Probability

A separate "escalation probability" indicates likelihood of situation worsening:

- **Base:** 20%
- **Add:** +25% if distress scream, +20% if rapid motion, +15% if adult loitering, +10% if multiple reports, +10% if after school hours
- **Cap:** 100%

This helps prioritize cases for human review.

---

## 🔒 Privacy & Anonymity by Design

SafeNest emphasizes **privacy-first architecture**:

### What is NOT Stored
- ❌ Names, faces, or identifiable information
- ❌ Video/audio feeds
- ❌ Location data
- ❌ Device IDs or personal metadata
- ❌ Facial recognition results

### What IS Stored (Temporarily)
- ✅ Boolean signal states (anonymous)
- ✅ Computed risk scores
- ✅ Risk classifications (danger tier)
- ✅ Timestamps
- ✅ Escalation probabilities

### Data Retention
- **Automatic Purge:** All alerts deleted after 15 minutes
- **No Archival:** No long-term storage or databases
- **Simulation Only:** No real CCTV, microphones, or biometric processing

This is a **simulation prototype**—in production, additional safeguards (encryption, audit logging, consent systems) would be required.

---

## 📡 API Endpoints

### `POST /analyze-risk`

Analyze safety signals and compute risk score.

**Request:**
```json
{
  "signals": {
    "distress_scream_detected": true,
    "rapid_motion_detected": true,
    "child_stopped_moving": false,
    "adult_loitering_detected": true,
    "multiple_reports": false,
    "after_school_hours": true
  },
  "context": {}
}
```

**Response:**
```json
{
  "risk_score": 75.5,
  "danger_rank": "Orange",
  "danger_tier": "High Risk",
  "triggered_signals": [
    "distress_scream_detected",
    "rapid_motion_detected",
    "adult_loitering_detected",
    "after_school_hours"
  ],
  "escalation_probability": 90,
  "confidence": 0.9,
  "timestamp": "2026-03-01T14:32:15.123456Z",
  "alert_id": 1
}
```

### `GET /alerts`

Retrieve recent alerts (auto-purged after 15 minutes).

**Response:**
```json
{
  "alerts": [
    {
      "alert_id": 3,
      "risk_score": 75.5,
      "danger_rank": "Orange",
      "danger_tier": "High Risk",
      "triggered_signals": ["distress_scream_detected", "rapid_motion_detected"],
      "escalation_probability": 90,
      "confidence": 0.9,
      "timestamp": "2026-03-01T14:32:15.123456Z"
    },
    ...
  ],
  "count": 5,
  "retention_minutes": 15,
  "timestamp": "2026-03-01T14:35:00.000000Z"
}
```

### `GET /health`

Health check endpoint.

---

## 🎮 Demo Mode

Click the **"🎲 Demo Mode"** button to randomize all signals at once. Perfect for judges to quickly see different risk scenarios!

---

## 📊 Risk Scoring Examples

### Example 1: All Clear
```
Signals: All OFF
Risk Score: 0
Danger Rank: Green (Safe)
Escalation: 20%
```

### Example 2: Mild Concern
```
Signals: after_school_hours=ON
Risk Score: 10 × 0.6 = 6
Danger Rank: Green (Safe)
Escalation: 30%
```

### Example 3: High Alert
```
Signals: 
  - distress_scream_detected=ON (+45)
  - rapid_motion_detected=ON (+35)
  - adult_loitering_detected=ON (+30)
  - multiple_reports=ON (+20)

Weighted Sum: 45+35+30+20 = 130
Confidence: 0.9 (4 signals)
Risk Score: 130 × 0.9 = 117 → Clamped to 100
Danger Rank: Red (Critical)
Escalation: 20+25+20+15+10 = 90%
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Axios, CSS Grid
- **Backend:** Flask, Python 3.7+
- **Storage:** In-memory array (alerts list)
- **Communication:** REST API with CORS

### Dependencies

**Backend (`requirements.txt`):**
- Flask 2.3.2
- flask-cors 4.0.0
- Werkzeug 2.3.6

**Frontend (`package.json`):**
- react 18.2.0
- react-dom 18.2.0
- axios 1.4.0
- react-scripts 5.0.1

---

## 🧪 Testing the System

### Manual Test Scenario

1. **Dashboard loads:** Both frontend and backend running
2. **All signals OFF:** Click "Analyze Risk" → Risk score ≈ 0, Green tier
3. **Toggle some signals:** Click "Analyze Risk" → Check risk score changes match weighted sum
4. **Demo Mode:** Click "🎲 Demo Mode" → Random signals → Instant analysis
5. **Alert History:** Verify alerts appear in the table, showing most recent first
6. **Privacy Banner:** Read Privacy & Anonymity explainer
7. **15-min retention:** Reload page → Old alerts should disappear (demo: instant with mock timestamps)

### Backend Testing (Python)

```bash
cd safenest/backend
python -c "from utils.risk_scorer import analyze_risk; result = analyze_risk({'distress_scream_detected': True, 'rapid_motion_detected': True, 'child_stopped_moving': False, 'adult_loitering_detected': True, 'multiple_reports': False, 'after_school_hours': True}); print(result)"
```

---

## 📝 Notes for Judges

- **Privacy-First:** This prototype emphasizes anonymity at every layer. No biometric data, faces, or IDs.
- **Explainability:** Risk scoring uses transparent, rule-based logic—not ML black boxes.
- **Responsible Design:** Demonstrates how to build safety tools responsibly, especially for vulnerable populations (children).
- **Extensibility:** The risk scoring engine can be enhanced with additional signals, weights, or smarter confidence factors.
- **Simulation Only:** This is a proof-of-concept. Real deployments would require legal review, consent frameworks, and audit logging.

---

## 🚀 Future Enhancements

- Add Chart.js for risk trend visualization over time
- Implement user authentication and role-based access
- Add configurable signal weights (admin panel)
- Integrate with real safety data APIs
- Add incident lifecycle management (open, in-progress, resolved)
- Deploy to cloud (AWS, Google Cloud, Azure)
- Add comprehensive audit logging
- Multi-language support

---

## 📄 License

This is a hackathon prototype. Use freely for educational and demonstration purposes.

---

## ❓ FAQ

**Q: Is this actually monitoring children?**  
A: No. This is a simulation prototype. No real audio, video, or biometric data is processed.

**Q: How is data deleted after 15 minutes?**  
A: Every `/alerts` request filters out alerts older than 15 minutes. No background jobs needed.

**Q: Can I customize signal weights?**  
A: Yes! Edit the `SIGNAL_WEIGHTS` dict in `backend/utils/risk_scorer.py`.

**Q: How do I deploy this to production?**  
A: Don't, without significant security/legal review. This is a prototype for educational purposes.

---

## 📞 Support

Questions? Check the code comments or review the risk scoring logic in `backend/utils/risk_scorer.py`.

---

**Built with ❤️ for child safety and privacy.**
