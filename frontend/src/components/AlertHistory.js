import React from 'react';

/**
 * AlertHistory Component
 * 
 * Displays a table of recent alerts with their scores, ranks, and triggered signals.
 * Alerts are automatically purged server-side after 15 minutes.
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

  return (
    <div className="card alert-history">
      <div className="alert-history-header">
        <div>
          <h2 style={{ margin: 0 }}>📋 Alert History</h2>
          <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: 0, marginTop: '0.25rem' }}>
            Recent alerts (auto-refreshed). Alerts purge after 15 minutes for privacy.
          </p>
        </div>
        {alerts.length > 0 && (
          <button 
            className="clear-btn" 
            onClick={onClearAlerts}
            title="Clear all alerts from history"
          >
            🗑️ Clear
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <p>📭 No alerts yet</p>
          <p style={{ fontSize: '0.85rem' }}>
            Run signal analysis to generate alerts.
          </p>
        </div>
      ) : (
        <table className="alert-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>CRI Score</th>
              <th>Status</th>
              <th>Escalation</th>
              <th>Signals</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr key={alert.alert_id}>
                <td style={{ fontSize: '0.85rem' }}>
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </td>
                <td style={{ fontWeight: '600' }}>
                  {alert.risk_score}
                </td>
                <td>
                  <span className={`badge-inline ${getBadgeClass(alert.danger_rank)}`}>
                    {alert.danger_rank}
                  </span>
                </td>
                <td>{alert.escalation_probability}%</td>
                <td style={{ maxWidth: '150px' }}>
                  {alert.triggered_signals.length > 0 ? (
                    <span title={alert.triggered_signals.join(', ')}>
                      {alert.triggered_signals.length} signal{alert.triggered_signals.length !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>None</span>
                  )}
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
