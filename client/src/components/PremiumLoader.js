import React from 'react';
import './PremiumLoader.css';

const PremiumLoader = ({ message }) => {
  return (
    <div className="premium-loader-container">
      <div className="premium-visual-loader">
        <div className="orbit-spinner">
          <div className="orbit"></div>
          <div className="orbit"></div>
          <div className="orbit"></div>
          <div className="center-dot"></div>
        </div>
      </div>
      {message && <p className="premium-loader-text">{message}</p>}
    </div>
  );
};

export default PremiumLoader;
