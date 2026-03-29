import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';

function HomePage() {
  const { user } = useAuth();
  const [beliefPercentage, setBeliefPercentage] = useState(50);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [book, setBook] = useState(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  const fetchBook = useCallback(async () => {
    try {
      const response = await api.get('/book');
      setBook(response.data);
    } catch (error) {
      console.error('Error fetching book:', error);
    }
  }, []);

  useEffect(() => {
    fetchBook();
    
    // Check if user has already answered the question
    const hasAnsweredBefore = localStorage.getItem('hasAnsweredBeliefQuestion');
    if (hasAnsweredBefore) {
      setHasAnswered(true);
      // We could also fetch their previous percentage if we wanted
    }
  }, [fetchBook]);

  const saveData = async (isClosing = false) => {
    if (hasSaved) {
      setHasAnswered(true);
      return;
    }
    
    try {
      await api.post('/belief', { 
        percentage: beliefPercentage, 
        email: user?.email || email || 'anonymous' 
      });
      setHasSaved(true);
      // Save to localStorage so state is remembered
      localStorage.setItem('hasAnsweredBeliefQuestion', 'true');
      setHasAnswered(true);
    } catch (error) {
      console.error('Error saving belief:', error);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    if (!email && !user) {
      setMessage('Please enter your email or login');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      await api.post('/book/download', { email: user?.email || email });
      setMessage('Your free book has been sent to your email!');
      setMessageType('success');
      setEmail('');
    } catch (error) {
      setMessage('Error sending book. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homepage">
      <Helmet>
        <title>Grace Church | Discover Your Eternal Purpose - Home</title>
        <meta name="description" content="Discover your eternal purpose through the Word of God at Grace Church. Explore our music collection, free books, and spiritual resources for your journey." />
        <meta property="og:title" content="Grace Church - Discover Your Eternal Purpose" />
        <meta property="og:description" content="Join us at Grace Church to explore the Word of God and discover your spiritual path through music and resources." />
      </Helmet>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="gradient-sphere"></div>
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <h1 className="hero-title">
                Discover Your <span className="highlight">Eternal Purpose</span>
              </h1>
              <p className="hero-subtitle">
                Life is a journey, but do you know where it leads? 
                Prepare your soul for the afterlife through the unchanging Word of God.
              </p>
              <div className="hero-actions">
                <a href="/order" className="btn btn-primary">Order Book</a>
                <a href="/assets/English01%5B2025%5D%20(1).pdf" download className="btn btn-outline">Download PDF</a>
              </div>
            </div>
            
            <div className="hero-book">
              {book && (
                <div className="book-card-mini">
                  <div className="book-visual-mini">
                    <img src="https://bjnewlife.org/upload/book/HAVEYOUTRULYBEENBORNAGAINOFWATERANDTHESPIRIT2024L.jpg?ver=1709079147" alt="HAVE YOU TRULY BEEN BORN AGAIN OF WATER AND THE SPIRIT" />
                  </div>
                  <div className="book-details-mini">
                    <span className="book-badge">Free Resource</span>
                    <h3>{book.title || "HAVE YOU TRULY BEEN BORN AGAIN OF WATER AND THE SPIRIT"}</h3>
                    <p>{book.description?.substring(0, 100) || "Have you truly been born again of water and the Spirit? Explore the true meaning of being born again according to the Bible."}...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Belief Reflection Section (Replaces the Popup) */}
      <section id="belief-reflection" className="belief-section">
        <div className="container">
          {!hasAnswered ? (
            <div className="belief-card">
              <div className="belief-header">
                <span className="section-tag">Reflection</span>
                <h2>The Ultimate Question</h2>
                <p>What percentage do you believe in the Bible as the Word of God?</p>
              </div>
              
              <div className="belief-content">
                <div className="slider-box">
                  <div className="slider-labels">
                    <span>0%</span>
                    <span className="current-val">{beliefPercentage}%</span>
                    <span>100%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={beliefPercentage} 
                    onChange={(e) => setBeliefPercentage(parseInt(e.target.value))}
                    className="modern-slider"
                  />
                </div>

                <div className="belief-form-row">
                  <div className="input-with-icon">
                    <i className="fas fa-envelope"></i>
                    <input 
                      type="email" 
                      placeholder="Email (Optional for guidance)" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => saveData(false)} 
                    className="btn btn-primary"
                  >
                    Submit Reflection
                  </button>
                </div>
                <p className="helper-text">Your honesty helps us provide the right spiritual guidance.</p>
              </div>
            </div>
          ) : (
            <div className={`assurance-display ${beliefPercentage === 100 ? 'celebration-mode' : 'guidance-mode'}`}>
              <div className="assurance-icon">
                {beliefPercentage === 100 ? <i className="fas fa-crown"></i> : <i className="fas fa-compass"></i>}
              </div>
              <div className="assurance-text">
                {beliefPercentage === 100 ? (
                  <>
                    <h2>Glory to God!</h2>
                    <p>
                      Your journey will be sweet and nice since you believe 100%! 
                      Walking with the Word is the most beautiful path one can take.
                    </p>
                  </>
                ) : (
                  <>
                    <h2>A Path of Discovery Awaits</h2>
                    <p>
                      You believe {beliefPercentage}%. <strong>We will guide you to find the remaining {100 - beliefPercentage}%</strong>. 
                      There is hope until the last minute, and we are here to walk with you through the Word.
                    </p>
                  </>
                )}
                <button onClick={() => setHasAnswered(false)} className="btn btn-link">Change Response</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Salvation Content Section */}
      <section id="salvation" className="salvation-section">
        <div className="container">
          <div className="section-grid">
            <div className="salvation-content">
              <h2>How to Attain Salvation</h2>
              <p>
                The correct way according to the Bible starts with self-knowledge through the Word. 
                "Let all men be false but God be true." When we see our sinfulness reflected in God's Word, 
                we realize our desperate need for a Savior.
              </p>
              <div className="salvation-points">
                <div className="point">
                  <h3>God is the Word</h3>
                  <p>"In the beginning was the Word, and the Word was with God, and the Word was God... The Word became flesh and made His dwelling among us."</p>
                </div>
                <div className="point">
                  <h3>Jesus is God</h3>
                  <p>Isaiah prophesied: He shall be called <strong>Emanuel</strong> (God with us), <strong>Everlasting Father</strong>, <strong>Prince of Peace</strong>, and <strong>Mighty God</strong>.</p>
                </div>
              </div>
            </div>
            <div className="salvation-image">
              <div className="quote-box">
                "For God so loved the world that He gave His only begotten Son..."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Books Section */}
      <section id="books" className="books-section">
        <div className="gradient-sphere secondary"></div>
        <div className="container">
          <div className="section-header center">
            <h2 className="section-title">
              Free <span className="highlight">Spiritual Resources</span>
            </h2>
            <p className="section-subtitle">Empowering your journey with the Word of God at no cost.</p>
          </div>

          <div className="resources-container">
            <div className="main-resource">
              <div className="resource-card primary-card">
                <div className="resource-visual">
                  <div className="book-3d-wrapper">
                    <img src="https://bjnewlife.org/upload/book/HAVEYOUTRULYBEENBORNAGAINOFWATERANDTHESPIRIT2024L.jpg?ver=1709079147" alt="HAVE YOU TRULY BEEN BORN AGAIN OF WATER AND THE SPIRIT" className="book-image" />
                    <div className="book-spine"></div>
                  </div>
                </div>
                <div className="resource-info">
                  <span className="resource-tag">Featured Book</span>
                  <h3>HAVE YOU TRULY BEEN BORN AGAIN OF WATER AND THE SPIRIT</h3>
                  <p>Explore the true meaning of being born again of water and the Spirit according to the Bible.</p>
                  <div className="resource-meta">
                    <span className="meta-item"><i className="fas fa-file-pdf"></i> PDF Format</span>
                    <span className="meta-item"><i className="fas fa-book-open"></i> 120+ Pages</span>
                  </div>
                  <div className="resource-actions">
                    <button onClick={handleDownload} className="btn btn-primary btn-glow" disabled={loading}>
                      {loading ? 'Sending PDF...' : 'Download Free PDF'}
                    </button>
                    <a href="/order" className="btn btn-outline">Request Physical Copy</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="other-resources">
              <div className="resource-card-sm coming-soon">
                <div className="card-sm-icon"><i className="fas fa-music"></i></div>
                <div className="card-sm-content">
                  <h4>Sermon Audios</h4>
                  <p>Inspiring messages to strengthen your faith.</p>
                  <span className="status-badge">Coming Soon</span>
                </div>
              </div>
              <div className="resource-card-sm coming-soon">
                <div className="card-sm-icon"><i className="fas fa-book-open"></i></div>
                <div className="card-sm-content">
                  <h4>Study Guides</h4>
                  <p>Deep dive into biblical truths and principles.</p>
                  <span className="status-badge">Coming Soon</span>
                </div>
              </div>
            </div>
          </div>
          {message && <div className={`status-message ${messageType}`}>{message}</div>}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
