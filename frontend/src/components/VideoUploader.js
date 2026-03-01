import React, { useState, useRef } from 'react';

export default function VideoUploader({ onAnalyze, isAnalyzing }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.includes('video')) {
        alert('Please select a valid video file');
        return;
      }

      setVideoFile(file);
      
      // Create preview URL
      const preview = URL.createObjectURL(file);
      setVideoPreview(preview);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.includes('video')) {
      setVideoFile(file);
      const preview = URL.createObjectURL(file);
      setVideoPreview(preview);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAnalyze = () => {
    if (!videoFile) {
      alert('Please select a video file first');
      return;
    }
    onAnalyze(videoFile);
  };

  const handleClear = () => {
    setVideoFile(null);
    setVideoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card video-uploader">
      <h2>🎬 Video Analysis</h2>
      <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '1rem' }}>
        Upload CCTV footage to automatically detect safety domain and triggered signals
      </p>

      <div className="upload-section">
        {/* Video Drop Zone */}
        <div
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          {videoPreview ? (
            <div className="video-preview-box">
              <video 
                src={videoPreview} 
                controls 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '200px',
                  borderRadius: '6px'
                }} 
              />
              <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>
                {videoFile.name}
              </p>
            </div>
          ) : (
            <div className="drop-icon">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📹</div>
              <p style={{ margin: '0.5rem 0', fontWeight: '600' }}>Drop video here or click to browse</p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#9ca3af' }}>
                Supported: MP4, MOV, AVI (Max 500MB)
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* Action Buttons */}
        <div className="button-group" style={{ marginTop: '1rem' }}>
          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !videoFile}
            style={{ flex: 1 }}
          >
            {isAnalyzing ? '⏳ Analyzing...' : '▶ Analyze Video'}
          </button>
          {videoFile && (
            <button
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={isAnalyzing}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Info Box */}
        <div className="video-info-box">
          <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', color: '#6b7280' }}>
            ℹ️ Analysis extracts up to 20 frames for comprehensive signal detection
          </p>
          <p style={{ margin: '0.5rem 0', fontSize: '0.8rem', color: '#6b7280' }}>
            🔒 Video is deleted immediately after analysis • No data stored
          </p>
        </div>
      </div>
    </div>
  );
}
