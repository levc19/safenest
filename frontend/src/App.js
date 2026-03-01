import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { getDomainById } from './config/domains';
import DomainSelector from './components/DomainSelector';
import SignalSimulator from './components/SignalSimulator';
import ResultsCard from './components/ResultsCard';
import AlertHistory from './components/AlertHistory';
import PrivacyBanner from './components/PrivacyBanner';
import HeatMap from './components/HeatMap';

const API_BASE_URL = 'http://localhost:5001';

function App() {
  // Domain state
  const [selectedDomain, setSelectedDomain] = useState('child_safety');
  const currentDomain = getDomainById(selectedDomain);

  // Signal state (initialized based on domain)
  const [signals, setSignals] = useState({});

  // Results and UI state
  const [latestResult, setLatestResult] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPrivacy, setShowPrivacy] = useState(true);

  // Initialize signals when domain changes
  useEffect(() => {
    const initialSignals = {};
    currentDomain.signals.forEach((signal) => {
      initialSignals[signal.key] = false;
    });
    setSignals(initialSignals);
    setLatestResult(null); // Clear previous results when domain changes
  }, [selectedDomain, currentDomain]);

  // Fetch alerts on component mount and periodically
  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSignalChange = (signalName) => {
    setSignals((prev) => ({
      ...prev,
      [signalName]: !prev[signalName],
    }));
  };

  const analyzeRisk = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze-risk`, {
        signals,
        domain: selectedDomain,
        context: {},
      });
      setLatestResult(response.data);
      // Refresh alerts after analysis
      fetchAlerts();
    } catch (err) {
      setError(
        err.response?.data?.error || `Error: ${err.message}. Is backend running on port 5000?`
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alerts`);
      setAlerts(response.data.alerts || []);
    } catch (err) {
      // Silently fail on fetch errors (backend might not be ready)
      console.error('Failed to fetch alerts:', err.message);
    }
  };

  const randomizeSignals = () => {
    const randomized = {};
    currentDomain.signals.forEach((signal) => {
      randomized[signal.key] = Math.random() > 0.5;
    });
    setSignals(randomized);
  };

  const clearAlerts = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/alerts`);
      setAlerts([]);
    } catch (err) {
      console.error('Failed to clear alerts:', err.message);
      // Still clear locally even if API fails
      setAlerts([]);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>🏠 SafeNest</h1>
          <p className="tagline">Privacy-Preserving Community Safety Risk Intelligence</p>
        </div>
      </header>

      {/* Privacy Banner */}
      {showPrivacy && (
        <PrivacyBanner onClose={() => setShowPrivacy(false)} />
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {error && (
            <div className="error-message">
              <strong>⚠️ Error:</strong> {error}
            </div>
          )}

          {/* Domain Selector */}
          <DomainSelector
            selectedDomain={selectedDomain}
            onDomainChange={setSelectedDomain}
            currentDomainInfo={currentDomain}
          />

          <div className="dashboard-grid">
            {/* Left Column: Signal Simulator + Results */}
            <div className="left-column">
              <SignalSimulator
                domain={currentDomain}
                signals={signals}
                onSignalChange={handleSignalChange}
                onAnalyze={analyzeRisk}
                onRandomize={randomizeSignals}
                loading={loading}
              />

              {latestResult && (
                <ResultsCard result={latestResult} domain={currentDomain} />
              )}
            </div>

            {/* Right Column: Alert History */}
            <div className="right-column">
              <AlertHistory alerts={alerts} domain={currentDomain} onClearAlerts={clearAlerts} />
            </div>
          </div>

          {/* Heat Map - Geographic Risk Distribution */}
          <HeatMap alerts={alerts} />
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>SafeNest v2.0 | Privacy-First Community Safety Dashboard | Multi-Domain Support</p>
      </footer>
    </div>
  );
}

export default App;
