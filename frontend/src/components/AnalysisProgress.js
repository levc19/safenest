import React from 'react';

export default function AnalysisProgress({ progress, status, message }) {
  const steps = [
    { id: 1, label: 'Uploading', icon: '📤' },
    { id: 2, label: 'Extracting Frames', icon: '🎬' },
    { id: 3, label: 'Analyzing Motion', icon: '⚡' },
    { id: 4, label: 'Detecting Poses', icon: '🧍' },
    { id: 5, label: 'Classifying Domain', icon: '🎯' },
    { id: 6, label: 'Computing Risk', icon: '📊' },
  ];

  const currentStep = Math.min(Math.ceil(progress / (100 / steps.length)), steps.length);

  return (
    <div className="card analysis-progress">
      <h2>🔄 Processing Video</h2>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar-background">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="progress-text">{Math.round(progress)}% Complete</p>
      </div>

      {/* Status Message */}
      <div className="status-box">
        <p className="status-message">{message || 'Initializing video analysis...'}</p>
      </div>

      {/* Step Indicators */}
      <div className="steps-timeline">
        {steps.map((step, index) => (
          <div key={step.id} className="step-item">
            <div
              className={`step-indicator ${
                currentStep > step.id
                  ? 'completed'
                  : currentStep === step.id
                  ? 'active'
                  : 'pending'
              }`}
            >
              <span className="step-icon">{step.icon}</span>
            </div>
            <p className="step-label">{step.label}</p>
            {index < steps.length - 1 && <div className="step-connector" />}
          </div>
        ))}
      </div>

      {/* Processing Details */}
      <div className="processing-details">
        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
          🔒 Processing locally • 🗑️ Video will be deleted after analysis
        </p>
      </div>
    </div>
  );
}
