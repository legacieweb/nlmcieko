import React from 'react';
import './MusicPreloader.css';

const MusicPreloader = () => {
  return (
    <div className="music-preloader-container">
      <div className="preloader-visual">
        <div className="loader-rings">
          <div className="ring"></div>
          <div className="ring"></div>
          <div className="ring"></div>
        </div>
        <div className="loader-center">
          <div className="pulse-icon">
            <i className="fas fa-music"></i>
          </div>
          <div className="glow-sphere"></div>
        </div>
      </div>
      <div className="loader-brand">
        <h2 className="brand-text">NLM CIEKO</h2>
        <div className="progress-track">
          <div className="progress-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default MusicPreloader;
