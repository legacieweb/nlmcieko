import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import './Navigation.css';

function Navigation({ onHamburgerClick, isServantPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { showToast } = useMusic();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const copyShareLink = () => {
    const identifier = user?.fullName || user?.full_name || user?.email;
    if (!identifier) return;
    const slug = identifier.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const link = `${window.location.origin}/#/servant-view/${slug}`;
    navigator.clipboard.writeText(link);
    showToast('Shareable link copied!');
    setIsOpen(false);
  };

  const handleHamburgerClick = () => {
    if (onHamburgerClick) {
      onHamburgerClick();
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-content">
          <Link to="/" className="logo" onClick={() => setIsOpen(false)}>
            <img src="https://i.imgur.com/veOEaC1.png" alt="NLM Cieko Logo" className="logo-img" />
            <span className="logo-text">nlm cieko</span>
            <span className="logo-dot">.</span>
          </Link>
          
          <button className="hamburger" onClick={handleHamburgerClick}>
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
            {isServantPage ? (
              <>
                <li className="mobile-only-header">Dashboard Menu</li>
                <li><Link to="/servant" onClick={() => setIsOpen(false)}>Overview</Link></li>
                <li><Link to="/servant/profile" onClick={() => setIsOpen(false)}>Appearance</Link></li>
                <li><Link to="/servant/content" onClick={() => setIsOpen(false)}>Content</Link></li>
                <li><Link to="/servant/visitors" onClick={() => setIsOpen(false)}>Visitors</Link></li>
                <li><Link to="/servant/contacts" onClick={() => setIsOpen(false)}>Inquiries</Link></li>
                <li><button className="nav-share-btn" onClick={copyShareLink}>Share Link</button></li>
                <li className="mobile-divider"></li>
                <li><Link to="/" onClick={() => setIsOpen(false)}>Main Site</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
                <li><Link to="/portfolio" onClick={() => setIsOpen(false)}>Portfolio</Link></li>
                <li><Link to="/about" onClick={() => setIsOpen(false)}>About</Link></li>
                <li><Link to="/contact" onClick={() => setIsOpen(false)}>Contact</Link></li>
                {user?.isServant && <li><button className="nav-share-btn" onClick={copyShareLink}>Share Link</button></li>}
              </>
            )}
            
            {user ? (
              <>
                {!isServantPage && (
                  <>
                    {user.isAdmin && <li><Link to="/admin" onClick={() => setIsOpen(false)}>Admin</Link></li>}
                    {user.isServant && <li><Link to="/servant" onClick={() => setIsOpen(false)}>Servant Dashboard</Link></li>}
                    <li><Link to="/order-history" onClick={() => setIsOpen(false)}>My Orders</Link></li>
                  </>
                )}
                <li className="user-profile">
                  <span className="user-name">{user.fullName || user.full_name}</span>
                  <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="btn-nav btn-nav-login" onClick={() => setIsOpen(false)}>Login</Link></li>
                <li><Link to="/signup" className="btn-nav btn-nav-signup" onClick={() => setIsOpen(false)}>Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
