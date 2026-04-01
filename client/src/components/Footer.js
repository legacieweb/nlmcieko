import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Footer.css';

function Footer() {
  const { user } = useAuth();
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-text">nlm cieko</span>
              <span className="logo-dot">.</span>
            </Link>
            <p>Discovering your eternal purpose through the unchanging Word of God. Join us on a journey beyond this life.</p>
            <div className="social-links">
              <a href="#!">FB</a>
              <a href="#!">IG</a>
              <a href="#!">YT</a>
              <a href="#!">TW</a>
            </div>
          </div>

          <div className="footer-links">
            <h3>Explore</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/portfolio">Portfolio</Link></li>
              <li><Link to="/music">Music</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h3>References</h3>
            <ul>
              <li><a href="https://bjnewlife.org" target="_blank" rel="noopener noreferrer">bjnewlife.org</a></li>
              <li><a href="https://nlmission.com" target="_blank" rel="noopener noreferrer">nlmission.com</a></li>
              <li><a href="https://nlmbookcafe.com" target="_blank" rel="noopener noreferrer">nlmbookcafe.com</a></li>
            </ul>
          </div>

          <div className="footer-links">
            <h3>Resources</h3>
            <ul>
              <li><Link to="/order">Free Books</Link></li>
              <li><Link to="/contact">Support</Link></li>
              <li><Link to="/login">My Account</Link></li>
              {user?.isAdmin && <li><Link to="/admin">Admin</Link></li>}
              {user?.isServant && <li><Link to="/servant">Ministry Space</Link></li>}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} nlm cieko. All rights reserved. Preaching Jesus as God.</p>
          <div className="footer-legal">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
