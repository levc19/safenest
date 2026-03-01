import React, { useMemo } from 'react';
import { Bubble } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

// Simulated geographic grid (5x5 zones)
const ZONES = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: (i % 5) * 100 + 50,
  y: Math.floor(i / 5) * 100 + 50,
  name: `Zone ${String.fromCharCode(65 + Math.floor(i / 5))}-${(i % 5) + 1}`,
}));

// Deterministic zone assignment based on alert fingerprint
const getZoneForAlert = (alert) => {
  // Use timestamp + risk_score as a stable fingerprint
  const timestamp = new Date(alert.timestamp || Date.now()).getTime();
  const riskScore = Math.round((alert.risk_score || 0) * 10);
  
  // Simple deterministic linear congruential generator
  let seed = timestamp + riskScore;
  const hash = Math.abs((seed * 9301 + 49297) % 233280);
  
  // Always assigns same alert to same zone (stable across re-renders)
  const zoneIndex = hash % ZONES.length;
  return ZONES[zoneIndex];
};

// Get color based on danger tier
const getDangerColorFromRank = (rank) => {
  const colors = {
    'Green': '#10b981',
    'Yellow': '#f59e0b',
    'Orange': '#ef6b3f',
    'Red': '#dc2626',
  };
  return colors[rank] || '#9ca3af';
};


export default function HeatMap({ alerts }) {
  const chartData = useMemo(() => {
    if (!alerts || alerts.length === 0) {
      return {
        datasets: [
          {
            label: 'No Risk Data',
            data: [],
            backgroundColor: '#d1d5db',
          },
        ],
      };
    }

    // Group alerts by zone and aggregate risk data
    const zoneData = {};

    alerts.forEach((alert) => {
      const zone = getZoneForAlert(alert);
      const zoneId = zone.id;

      if (!zoneData[zoneId]) {
        zoneData[zoneId] = {
          zone,
          alerts: [],
          totalRisk: 0,
          avgRisk: 0,
          maxRisk: 0,
          dangerRanks: {},
        };
      }

      zoneData[zoneId].alerts.push(alert);
      zoneData[zoneId].totalRisk += alert.risk_score || 0;
      zoneData[zoneId].maxRisk = Math.max(zoneData[zoneId].maxRisk, alert.risk_score || 0);

      // Track danger ranks
      const rank = alert.danger_rank || 'Green';
      zoneData[zoneId].dangerRanks[rank] = (zoneData[zoneId].dangerRanks[rank] || 0) + 1;
    });

    // Calculate average risk and determine dominant danger rank per zone
    Object.values(zoneData).forEach((z) => {
      z.avgRisk = z.totalRisk / z.alerts.length;
      // Find most common danger rank
      z.dominantRank = Object.entries(z.dangerRanks).sort((a, b) => b[1] - a[1])[0][0];
    });

    // Create dataset entries, one per danger tier for legend
    const dangerTiers = ['Red', 'Orange', 'Yellow', 'Green'];
    const datasets = dangerTiers.map((rank) => {
      const zonesForTier = Object.values(zoneData).filter(
        (z) => z.dominantRank === rank
      );

      return {
        label: `${rank} Zone (${zonesForTier.length} zones)`,
        data: zonesForTier.map((z) => ({
          x: z.zone.x,
          y: z.zone.y,
          r: Math.max(8, Math.min(25, z.alerts.length * 3)),
          zone: z.zone.name,
          alertCount: z.alerts.length,
          avgRisk: Math.round(z.avgRisk),
          maxRisk: z.maxRisk,
        })),
        backgroundColor: getDangerColorFromRank(rank),
        borderColor: getDangerColorFromRank(rank),
        borderWidth: 2,
        opacity: 0.7,
      };
    });

    return {
      datasets: datasets.filter((ds) => ds.data.length > 0),
    };
  }, [alerts]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12, weight: 'bold' },
          padding: 15,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          title: () => '',
          label: (context) => {
            const data = context.raw;
            return [
              `${data.zone}`,
              `Alerts: ${data.alertCount}`,
              `Avg Risk: ${data.avgRisk}`,
              `Max Risk: ${data.maxRisk}`,
            ];
          },
          afterLabel: () => '',
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Location (E-W)',
          font: { weight: 'bold' },
        },
        min: 0,
        max: 500,
        ticks: { display: false },
        grid: { drawBorder: false, color: 'rgba(200, 200, 200, 0.1)' },
      },
      y: {
        title: {
          display: true,
          text: 'Location (N-S)',
          font: { weight: 'bold' },
        },
        min: 0,
        max: 500,
        ticks: { display: false },
        grid: { drawBorder: false, color: 'rgba(200, 200, 200, 0.1)' },
      },
    },
  };

  return (
    <div className="heat-map-card">
      <div className="card-header">
        <h3>📍 Risk Heat Map - Situational Awareness</h3>
        <p className="subtitle">
          Geographic clustering of risk alerts • Bubble size = alert concentration • Color = danger tier
        </p>
      </div>
      <div className="heat-map-container">
        {alerts && alerts.length > 0 ? (
          <>
            <Bubble data={chartData} options={options} />
            <div className="heat-map-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#dc2626' }}></span>
                <span>Critical Risk - Immediate Response</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#ef6b3f' }}></span>
                <span>High Risk - Urgent Monitoring</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                <span>Watch - Active Monitoring</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
                <span>Safe - Normal Operations</span>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>No alerts yet. Triggers an alert to see risk clustering.</p>
          </div>
        )}
      </div>
    </div>
  );
}
