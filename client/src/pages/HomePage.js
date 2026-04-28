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
        <title>Nlm Cieko | Discover Your Eternal Purpose - Home</title>
        <meta name="description" content="Discover your eternal purpose through the Word of God at Nlm Cieko. Explore our music collection, free books, and spiritual resources for your journey." />
        <meta property="og:title" content="Nlm Cieko - Discover Your Eternal Purpose" />
        <meta property="og:description" content="Join us at Nlm Cieko to explore the Word of God and discover your spiritual path through music and resources." />
      </Helmet>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="gradient-sphere"></div>
        <div className="container">
          <div className="hero-grid">
            <div className="hero-content">
              <h1 className="hero-title">
                Spiritual <span className="highlight">Melodies</span>
              </h1>
              <p className="hero-subtitle">
                Experience the power of grace through our curated collection of gospel harmonies. 
                Let the music guide your heart towards eternal peace.
              </p>
              <div className="hero-actions">
                <a href="/#/music" className="btn btn-primary btn-glow">
                  Explore Music Library <i className="fas fa-play ml-2"></i>
                </a>
                <a href="/#/about" className="btn btn-outline">Our Mission</a>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="music-stack-premium">
                <div className="stack-item item-1">
                  <i className="fas fa-music"></i>
                </div>
                <div className="stack-item item-2">
                  <i className="fas fa-headphones"></i>
                </div>
                <div className="stack-item item-3">
                  <i className="fas fa-volume-up"></i>
                </div>
                <div className="floating-notes">
                  <i className="fas fa-note-sticky note-1"></i>
                  <i className="fas fa-music note-2"></i>
                  <i className="fas fa-microphone note-3"></i>
                </div>
              </div>
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

      {/* Book Resources Section */}
      <section id="resources" className="resources-section">
        <div className="container">
          <div className="section-header center">
            <h2 className="section-title">Free <span className="highlight">Spiritual Resources</span></h2>
            <p className="section-subtitle">Deepen your understanding with our featured literature.</p>
          </div>
          
          <div className="resource-featured-card glass-card">
            <div className="resource-visual">
              <div className="book-3d-premium">
                <img src="https://bjnewlife.org/upload/book/HAVEYOUTRULYBEENBORNAGAINOFWATERANDTHESPIRIT2024L.jpg?ver=1709079147" alt="Featured Book" />
                <div className="book-shadow"></div>
              </div>
            </div>
            <div className="resource-details">
              <span className="badge-premium">Recommended Reading</span>
              <h3>{book?.title || "HAVE YOU TRULY BEEN BORN AGAIN OF WATER AND THE SPIRIT"}</h3>
              <p>
                {book?.description || "Explore the true meaning of being born again of water and the Spirit according to the Bible. This book provides clear guidance on the path to salvation."}
              </p>
              <div className="resource-meta-minimal">
                <span><i className="fas fa-file-pdf"></i> PDF Format</span>
                <span><i className="fas fa-book-open"></i> 120+ Pages</span>
              </div>
              <div className="resource-cta">
                <a href="/#/order" className="btn btn-primary">
                  <i className="fas fa-truck"></i> Request Physical Copy
                </a>
                <a href="/assets/English01%5B2025%5D%20(1).pdf" download className="btn btn-outline">
                  <i className="fas fa-download"></i> Download Free PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Music Promo Section */}
      <section id="music-promo" className="music-promo-section-v2">
        <div className="promo-bg-elements">
          <div className="glow-circle primary"></div>
          <div className="glow-circle secondary"></div>
        </div>
        
        <div className="container">
          <div className="promo-layout-v2">
            <div className="promo-content-v2">
              <div className="promo-header-v2">
                <span className="premium-tag">Sonic Ministry</span>
                <h2 className="promo-title-v2">Spiritual <span className="highlight">Melodies</span></h2>
                <p className="promo-subtitle-v2">Uplifting your soul through the power of gospel harmonies.</p>
              </div>
              
              <div className="promo-features-v2">
                <div className="promo-feature">
                  <div className="feature-icon"><i className="fas fa-dove"></i></div>
                  <div className="feature-text">
                    <h4>Peaceful Worship</h4>
                    <p>Serene melodies to calm your spirit.</p>
                  </div>
                </div>
                <div className="promo-feature">
                  <div className="feature-icon"><i className="fas fa-fire"></i></div>
                  <div className="feature-text">
                    <h4>High Energy</h4>
                    <p>Contemporary beats for a joyful noise.</p>
                  </div>
                </div>
              </div>

              <div className="genre-cloud">
                <span className="genre-tag">Gospel</span>
                <span className="genre-tag">Worship</span>
                <span className="genre-tag">Trap / HipHop</span>
                <span className="genre-tag">Reggae</span>
                <span className="genre-tag">R&B</span>
              </div>

              <div className="promo-actions-v2">
                <a href="/#/music" className="btn btn-primary btn-glow-premium">
                  Explore Music Library <i className="fas fa-play"></i>
                </a>
              </div>
            </div>

            <div className="promo-visual-v2">
              <div className="visual-container-premium">
                <div className="floating-device">
                  <div className="device-screen">
                    <div className="screen-header">
                      <div className="dots"><span></span><span></span><span></span></div>
                    </div>
                    <div className="now-playing-mock">
                      <div className="album-art-mock">
                        <i className="fas fa-music"></i>
                        <div className="wave-bars">
                          <span></span><span></span><span></span><span></span>
                        </div>
                      </div>
                      <div className="song-info-mock">
                        <div className="mock-line-lg"></div>
                        <div className="mock-line-sm"></div>
                      </div>
                      <div className="controls-mock">
                        <i className="fas fa-step-backward"></i>
                        <i className="fas fa-play-circle"></i>
                        <i className="fas fa-step-forward"></i>
                      </div>
                    </div>
                  </div>
                  <div className="device-shadow"></div>
                </div>
                <div className="decorative-elements">
                  <div className="blob-element"></div>
                  <i className="fas fa-star spark-1"></i>
                  <i className="fas fa-star spark-2"></i>
                  <i className="fas fa-circle spark-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
