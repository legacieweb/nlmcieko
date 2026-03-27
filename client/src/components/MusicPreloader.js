import React from 'react';
import './MusicPreloader.css';

const MusicPreloader = () => {
  return (
    <div className="music-preloader-container">
      <div className="music-loader">
        <div className="equalizer">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
        <div className="loader-content">
          <div className="pulse-circle">
            <i className="fas fa-music"></i>
          </div>
          <p className="loader-text">Preparing the Sound of Grace...</p>
        </div>
      </div>
    </div>
  );
};

export default MusicPreloader;
