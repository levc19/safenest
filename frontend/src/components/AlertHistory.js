import React from 'react';

/**
 * AlertHistory Component
 * 
 * Displays a table of recent alerts with their scores, ranks, and safety domains.
 * Alerts persist until manually cleared.
 */
function AlertHistory({ alerts, domain, onClearAlerts }) {
  const getBadgeClass = (dangerRank) => {
    const rankMap = {
      Green: 'green',
      Yellow: 'yellow',
      Orange: 'orange',
      Red: 'red',
    };
    return rankMap[dangerRank] || 'green';
  };

  const getDomainLabel = (domainId) => {
    const labels = {
      // New domain IDs (from updated backend)
      child_safety: 'Child Safety',
      elder_safety: 'Elder Safety',
      environmental_hazard: 'Environmental Hazard',
      crime: 'Crime',
      // Legacy domain IDs (for backward compatibility)
      elder_care: 'Elder Safety',
      environmental: 'Environmental Hazard',
      crime_prevention: 'Crime',
    };
    return labels[domainId] || domainId;
  };

  const getDomainEmoji = (domainId) => {
    const emojis = {
      // New domain IDs
      child_safety: '👧',
      elder_safety: '👴',
      environmental_hazard: '🏠',
      crime: '🚔',
      // Legacy domain IDs
      elder_care: '👴',
      environmental: '🏠',
      crime_prevention: '🚔',
    };
    return emojis[domainId] || '🎯';
  };

  // Sort alerts by timestamp descending (most recent first)
  const sortedAlerts = [...alerts].sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="card alert-history">
      <div className="alert-history-header">
        <h2>Alert History</h2>
        {alerts.length > 0 && (
          <button 
            className="clear-btn" 
            onClick={onClearAlerts}
            title="Clear all alerts from history"
          >
            Clear
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <p>No alerts yet. Run signal analysis to generate alerts.</p>
        </div>
      ) : (
        <table className="alert-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>CRI Score</th>
              <th>Status</th>
              <th>Escalation</th>
              <th>Safety Domain</th>
            </tr>
          </thead>
          <tbody>
            {sortedAlerts.map((alert) => (
              <tr key={alert.alert_id}>
                <td style={{ fontSize: '0.85rem' }}>
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </td>
                <td style={{ fontWeight: '600' }}>
                  {Math.round(alert.risk_score)}
                </td>
                <td>
                  <span className={`badge-inline ${getBadgeClass(alert.danger_rank)}`}>
                    {alert.danger_rank}
                  </span>
                </td>
                <td>{parseFloat(alert.escalation_probability).toFixed(1)}%</td>
                <td>
                  {getDomainEmoji(alert.domain)} {getDomainLabel(alert.domain)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AlertHistory;
