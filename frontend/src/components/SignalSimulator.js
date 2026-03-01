import React from 'react';

/**
 * SignalSimulator Component
 * 
 * Displays toggle switches for safety signals (domain-specific)
 * and buttons to analyze risk and randomize.
 */
function SignalSimulator({ domain, signals, onSignalChange, onAnalyze, onRandomize, loading }) {
  return (
    <div className="card signal-simulator">
      <h2>🔍 Signal Simulator</h2>
      <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
        Toggle safety signals below, then click "Analyze Risk" to compute the risk index.
      </p>

      <div className="signals-grid">
        {domain.signals.map((signal) => (
          <div key={signal.key} className="signal-toggle">
            <input
              type="checkbox"
              id={signal.key}
              checked={signals[signal.key] || false}
              onChange={() => onSignalChange(signal.key)}
            />
            <label htmlFor={signal.key}>{signal.label}</label>
          </div>
        ))}
      </div>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={onAnalyze}
          disabled={loading}
        >
          {loading ? '⏳ Analyzing...' : '🚀 Analyze Risk'}
        </button>
        <button
          className="btn btn-secondary"
          onClick={onRandomize}
          disabled={loading}
        >
          🎲 Demo Mode
        </button>
      </div>
    </div>
  );
}

export default SignalSimulator;
