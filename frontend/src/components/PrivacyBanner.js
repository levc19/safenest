import React, { useState } from 'react';

/**
 * PrivacyBanner Component
 * 
 * Displays a prominent privacy and anonymity explanation banner.
 * Emphasizes anonymity-by-design and data retention practices.
 */
function PrivacyBanner({ onClose }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="privacy-banner">
      <div className="privacy-banner-content">
        <h3>🔒 Privacy & Anonymity First</h3>
        <p>
          SafeNest is designed with privacy-by-design. No personal data is ever stored.
          {!isExpanded && (
            <>
              {' '}
              <button
                onClick={() => setIsExpanded(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                  fontWeight: '600',
                }}
              >
                Learn more →
              </button>
            </>
          )}
        </p>

        {isExpanded && (
          <div className="privacy-details">
            <strong>🛡️ Privacy Guarantees:</strong>
            <ul>
              <li><strong>No Facial Recognition:</strong> SafeNest does not use facial recognition technology.</li>
              <li><strong>No Identity Tracking:</strong> We never store names, faces, IDs, or identifiable information.</li>
              <li><strong>Anonymized Signals Only:</strong> Only anonymized safety signals and risk scores are processed.</li>
              <li><strong>Automatic Purging:</strong> All alerts are automatically deleted after 15 minutes.</li>
              <li><strong>Simulation-Only:</strong> This is a prototype simulation—no real CCTV or audio processing is performed.</li>
            </ul>

            <strong>📊 What Gets Stored (Temporarily):</strong>
            <ul>
              <li>Safety signal metadata (boolean values)</li>
              <li>Computed risk scores and danger classifications</li>
              <li>Timestamps for analysis</li>
              <li>Escalation probabilities</li>
            </ul>

            <strong>🗑️ Data Retention:</strong>
            <ul>
              <li>All alerts are purged after <strong>15 minutes</strong> automatically.</li>
              <li>No long-term storage or archiving.</li>
              <li>No integration with external databases.</li>
            </ul>

            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>
              SafeNest prioritizes child safety <em>and</em> privacy—a critical combination for vulnerable populations.
            </p>
          </div>
        )}
      </div>

      <button
        className="privacy-banner-close"
        onClick={onClose}
        title="Close"
      >
        ✕
      </button>
    </div>
  );
}

export default PrivacyBanner;
