import React from 'react';
import { Link } from 'react-router-dom';
import './NotFoundPage.css';

function NotFoundPage() {
  return (
    <div className="not-found-page">
      {/* Animated Background */}
      <div className="not-found-bg">
        <div className="not-found-gradient"></div>
        <div className="gradient-sphere"></div>
        <div className="gradient-sphere secondary"></div>
      </div>
      
      {/* Main Content */}
      <div className="not-found-content">
        {/* 404 Icon */}
        <div className="not-found-icon-container">
          <div className="not-found-icon">
            <i className="fas fa-map-signs"></i>
          </div>
        </div>
        
        {/* Title */}
        <h1 className="not-found-title">404</h1>
        
        {/* Subtitle */}
        <div className="not-found-subtitle">
          <i className="fas fa-compass"></i>
          <span>PAGE NOT FOUND</span>
        </div>
        
        {/* Message */}
        <p className="not-found-message">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        
        {/* Suggestions */}
        <div className="not-found-suggestions">
          <div className="suggestion-item">
            <div className="suggestion-icon-wrapper">
              <i className="fas fa-home"></i>
            </div>
            <div className="suggestion-content">
              <span className="suggestion-label">Go Home</span>
              <span className="suggestion-value">Return to homepage</span>
            </div>
          </div>
          <div className="suggestion-item">
            <div className="suggestion-icon-wrapper">
              <i className="fas fa-music"></i>
            </div>
            <div className="suggestion-content">
              <span className="suggestion-label">Browse Music</span>
              <span className="suggestion-value">Explore our collection</span>
            </div>
          </div>
          <div className="suggestion-item">
            <div className="suggestion-icon-wrapper">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="suggestion-content">
              <span className="suggestion-label">Contact Us</span>
              <span className="suggestion-value">Get in touch</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="not-found-actions">
          <Link to="/" className="not-found-btn not-found-btn-primary">
            <i className="fas fa-home"></i>
            <span>Back to Home</span>
          </Link>
          <Link to="/music" className="not-found-btn not-found-btn-secondary">
            <i className="fas fa-music"></i>
            <span>Explore Music</span>
          </Link>
        </div>
        
        {/* Footer */}
        <div className="not-found-footer">
          <p>Need help? Contact our support team.</p>
          <div className="not-found-brand">
            <div className="brand-icon">
              <i className="fas fa-book-bible"></i>
            </div>
            <div className="brand-content">
              <span className="brand-title">NLM Cieko</span>
              <span className="brand-subtitle">Word of God</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
