"""
SafeNest Backend - Flask API

Privacy-Preserving Child Safety Risk Intelligence System

This backend provides REST API endpoints for:
  - Risk analysis (POST /analyze-risk)
  - Alert history retrieval (GET /alerts)
  
All data is anonymized and alerts are auto-purged after 15 minutes
to ensure privacy-by-design.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta, timezone
from utils.risk_scorer import analyze_risk

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes (frontend communication)

# In-memory alert storage
alerts = []

# Configuration
ALERT_RETENTION_MINUTES = 15


def purge_old_alerts():
    """Remove alerts older than ALERT_RETENTION_MINUTES."""
    global alerts
    cutoff_time = datetime.utcnow().replace(tzinfo=timezone.utc) - timedelta(minutes=ALERT_RETENTION_MINUTES)
    # Parse ISO timestamp and filter
    alerts = [
        alert
        for alert in alerts
        if datetime.fromisoformat(alert["timestamp"].replace("Z", "+00:00")) > cutoff_time
    ]


@app.route("/analyze-risk", methods=["POST"])
def analyze_risk_endpoint():
    """
    POST /analyze-risk
    
    Analyze safety signals and compute risk score for specified domain.
    
    Request JSON:
    {
        "signals": { ...booleans... },
        "domain": "child_safety" (optional, defaults to child_safety),
        "context": {} (optional)
    }
    
    Response JSON includes domain field in addition to other fields.
    """
    try:
        data = request.get_json()
        
        if not data or "signals" not in data:
            return jsonify({"error": "Missing 'signals' in request"}), 400
        
        signals = data.get("signals", {})
        domain = data.get("domain", "child_safety")  # Default to child_safety
        context = data.get("context", {})
        
        # Analyze risk with domain-specific configuration
        result = analyze_risk(signals, domain=domain, context=context)
        
        # Add alert ID, domain, and store in memory
        alert_id = len(alerts) + 1
        result["alert_id"] = alert_id
        result["domain"] = domain
        alerts.append(result)
        
        # Purge old alerts before returning
        purge_old_alerts()
        
        return jsonify(result), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/alerts", methods=["GET"])
def get_alerts():
    """
    GET /alerts
    
    Retrieve recent alerts (most recent first).
    Automatically purges alerts older than ALERT_RETENTION_MINUTES.
    
    Response JSON:
    {
        "alerts": [
            {
                "alert_id": int,
                "risk_score": float,
                "danger_rank": str,
                "danger_tier": str,
                "triggered_signals": [str],
                "escalation_probability": float,
                "timestamp": str,
                "confidence": float
            },
            ...
        ],
        "count": int,
        "retention_minutes": int
    }
    """
    try:
        # Purge old alerts first
        purge_old_alerts()
        
        # Sort by timestamp descending (most recent first)
        sorted_alerts = sorted(
            alerts,
            key=lambda x: x["timestamp"],
            reverse=True
        )
        
        return jsonify({
            "alerts": sorted_alerts,
            "count": len(sorted_alerts),
            "retention_minutes": ALERT_RETENTION_MINUTES,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/alerts", methods=["DELETE"])
def delete_alerts():
    """
    DELETE /alerts
    
    Clear all alerts from the alert history.
    
    Response JSON:
    {
        "status": "cleared",
        "alerts_cleared": int
    }
    """
    global alerts
    try:
        count = len(alerts)
        alerts = []
        
        return jsonify({
            "status": "cleared",
            "alerts_cleared": count,
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Simple health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "SafeNest Backend",
        "alerts_in_memory": len(alerts)
    }), 200


@app.route("/", methods=["GET"])
def root():
    """Root endpoint with API documentation."""
    return jsonify({
        "service": "SafeNest - Privacy-Preserving Child Safety Risk Intelligence",
        "version": "1.0.0",
        "endpoints": {
            "POST /analyze-risk": "Analyze safety signals and compute Child Risk Index",
            "GET /alerts": "Retrieve recent alerts (with auto-purge)",
            "GET /health": "Health check",
            "GET /": "This message"
        },
        "retention_minutes": ALERT_RETENTION_MINUTES,
        "note": "All data is anonymized. Alerts auto-purge after 15 minutes.",
    }), 200


if __name__ == "__main__":
    # Run Flask development server
    print("🚀 SafeNest Backend starting on http://localhost:5001")
    print(f"⏱️  Alert retention: {ALERT_RETENTION_MINUTES} minutes")
    print("✅ CORS enabled for frontend on http://localhost:3000")
    app.run(debug=True, host="0.0.0.0", port=5001)
