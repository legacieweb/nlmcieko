import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useMusic } from '../context/MusicContext';
import './ServantPage.css';

function ServantPublicView() {
  const { name } = useParams();
  const { playSong, playingSong, isPlaying, togglePlay } = useMusic();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadMsg, setDownloadMsg] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState('');

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const res = await api.get(`/admin/servant-view/${name}`);
        setData(res.data);
        
        // Record unique visit using local storage + servant ID
        const servantId = res.data?.servant?.id;
        if (servantId) {
          const visitedKey = `visited_servant_${servantId}`;
          if (!localStorage.getItem(visitedKey)) {
            await api.post('/admin/servant-view/visit', { servantId });
            localStorage.setItem(visitedKey, 'true');
          }
        }
      } catch (err) {
        setError('Page not found or unavailable');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, [name]);

  const handleDownload = () => {
    const pdfUrl = '/assets/English01%5B2025%5D%20(1).pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'water-and-spirit-gospel.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadMsg('Spiritual guide download started! God bless.');
    setTimeout(() => setDownloadMsg(''), 5000);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/admin/servant-view/contact', {
        servantId: data.servant.id,
        ...contactForm
      });
      setSentMsg('Your message has been received by the ministry. God bless!');
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setSentMsg(''), 5000);
    } catch (err) {
      setSentMsg('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) return (
    <div className="servant-loading-screen">
      <div className="spiritual-loader">
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-icon-wrapper">
          <i className="fas fa-dove"></i>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="servant-error-container">
      <div className="error-card">
        <i className="fas fa-search-minus error-icon"></i>
        <h2>Unavailable</h2>
        <p>{error}</p>
        <Link to="/" className="back-home-btn">Return Home</Link>
      </div>
    </div>
  );

  const { servant, page, customization, songs, book } = data;

  return (
    <div className="servant-premium-view classy-theme" style={{ '--servant-theme': customization?.themeColor || '#818cf8' }}>
      {/* Classy Hero Section */}
      <section className="classy-hero">
        <div className="hero-background">
          {customization?.bannerImage ? (
            <img src={customization.bannerImage} alt="" className="banner-img" />
          ) : (
            <div className="banner-placeholder"></div>
          )}
          <div className="hero-vignette"></div>
        </div>
        
        <div className="hero-core">
          <div className="avatar-frame">
             {customization?.profileImage ? (
               <img src={customization.profileImage} alt="Servant" className="avatar-img" />
             ) : (
               <div className="avatar-letter">{servant.fullName.charAt(0)}</div>
             )}
          </div>
          
          <div className="hero-text">
             <span className="servant-subtitle">SERVANT OF THE GOSPEL</span>
             <h1 className="servant-name">{customization?.displayName || servant.fullName}</h1>
             <p className="mission-statement">{customization?.vision || "Spreading the truth of the water and the Spirit."}</p>
          </div>

          <div className="hero-actions">
             <button onClick={() => scrollToSection('connect')} className="btn-classy">Message Ministry</button>
             <Link to="/order" className="btn-classy-outline">Request Free Books</Link>
          </div>
        </div>
      </section>

      <div className="classy-content-container" id="ministry">
        <div className="classy-grid">
           {/* Left Content */}
           <div className="main-col">
              {page && (
                <section className="classy-card ministry-text">
                   <h2 className="section-title">{page.title}</h2>
                   <div className="typography-body" dangerouslySetInnerHTML={{ __html: page.content }}></div>
                   <div className="servant-signature">
                      <p>With Grace,</p>
                      <h4>{customization?.displayName || servant.fullName}</h4>
                   </div>
                </section>
              )}

              {book && (
                <section className="classy-card book-highlight">
                   <div className="book-flex">
                      <div className="book-preview">
                         <img src={book.coverUrl} alt="Holy Book" className="classy-book-img" />
                      </div>
                      <div className="book-details">
                         <span className="label-top">ESSENTIAL TRUTH</span>
                         <h3>{book.title}</h3>
                         <p className="book-desc">{book.description}</p>
                         <div className="book-btns">
                            <button onClick={handleDownload} className="btn-action">
                               <i className="fas fa-file-pdf"></i> &nbsp; Download PDF
                            </button>
                            <Link to="/order" className="btn-action-alt">
                               <i className="fas fa-book-open"></i> &nbsp; Request Print
                            </Link>
                         </div>
                         {downloadMsg && <p className="success-toast">{downloadMsg}</p>}
                      </div>
                   </div>
                </section>
              )}
           </div>

           {/* Right Sidebar */}
           <aside className="side-col">
              <section id="wisdom" className="classy-card wisdom-sidebar">
                 <div className="card-accent"></div>
                 <h3 className="side-title">Daily Word</h3>
                 <p className="wisdom-quote">
                    {customization?.dailyWord || '"But seek first the kingdom of God and his righteousness, and all these things will be added to you." - Matthew 6:33'}
                 </p>
                 <div className="divider"></div>
                 <h3 className="side-title">The Testimony</h3>
                 <p className="bio-brief">{customization?.bio || "A life dedicated to the ministry of truth."}</p>
              </section>

           </aside>
        </div>

        {/* Full Width Worship Feed Section */}
        {songs && songs.length > 0 && (
          <section id="music" className="modern-worship-experience">
             <div className="worship-background-glow"></div>
             <div className="section-header-centered">
               <span className="label-top-glow">SPIRITUAL MELODIES</span>
               <h2 className="section-title-large">Immersive <span className="highlight">Worship</span></h2>
               <p className="section-subtitle">Experience the divine through these curated spiritual expressions.</p>
             </div>
             
             <div className="immersive-player-grid">
                {songs.map((song) => (
                  <div 
                    key={song.id} 
                    className={`immersive-song-card ${playingSong?.id === song.id ? 'active' : ''}`}
                    onClick={() => playingSong?.id === song.id ? togglePlay() : playSong(song)}
                  >
                    <div className="song-visual-container">
                       {song.thumbnail_url ? <img src={song.thumbnail_url} alt="" className="song-img" /> : <div className="song-placeholder"><i className="fas fa-music"></i></div>}
                       <div className="song-overlay-premium">
                          <div className="play-button-circle">
                             <i className={`fas ${playingSong?.id === song.id && isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                          </div>
                       </div>
                    </div>
                    <div className="song-metadata-premium">
                       <span className="song-genre-tag">{song.genre || 'Worship'}</span>
                       <h4>{song.title}</h4>
                       <p>{song.artist || (customization?.displayName || servant.fullName)}</p>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="worship-footer-action">
               <Link to="/music" className="btn-explore-library">
                 Explore Full Library
                 <i className="fas fa-chevron-right fa-spin-hover"></i>
               </Link>
             </div>
          </section>
        )}

        {/* Redesigned Modern Contact Section */}
        <section id="connect" className="modern-contact-grid">
           <div className="contact-info-card">
              <div className="card-accent-line"></div>
              <h2>Contact <br /><span className="highlight">Ministry</span></h2>
              <p>Your prayer requests and inquiries are welcome. We are here to support your spiritual journey.</p>
              
              <div className="contact-details-mini">
                 <div className="contact-item">
                    <i className="fas fa-envelope-open-text"></i>
                    <span>Direct Support</span>
                 </div>
                 <div className="contact-item">
                    <i className="fas fa-pray"></i>
                    <span>Prayer Requests</span>
                 </div>
                 <div className="contact-item">
                    <i className="fas fa-users"></i>
                    <span>Counseling</span>
                 </div>
              </div>
           </div>
           
           <div className="contact-form-card">
              <form onSubmit={handleContactSubmit} className="modern-form">
                 <div className="form-group-modern">
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required 
                    />
                 </div>
                 <div className="form-group-modern">
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required 
                    />
                 </div>
                 <div className="form-group-modern">
                    <textarea 
                      placeholder="Your Message or Prayer Request..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      required
                    ></textarea>
                 </div>
                 <button type="submit" className="btn-modern-submit" disabled={sending}>
                    {sending ? (
                      <>Sending...</>
                    ) : (
                      <>Send Message <i className="fas fa-paper-plane"></i></>
                    )}
                 </button>
                 {sentMsg && (
                    <div className="success-banner-modern">
                      <i className="fas fa-check-circle"></i> {sentMsg}
                    </div>
                 )}
              </form>
           </div>
        </section>
      </div>

      {/* Redesigned Modern Fellowship Banner */}
      <section className="modern-fellowship-banner">
         <div className="fellowship-content">
            <div className="fellowship-visual">
               <i className="fas fa-dove"></i>
            </div>
            <div className="fellowship-text">
               <h2>Join Our <span className="highlight">Fellowship</span></h2>
               <p>Connect with a global community of believers dedicated to the truth and spiritual growth.</p>
            </div>
            <div className="fellowship-actions">
               <Link to="/contact" className="btn-modern-primary">Contact Us</Link>
               <Link to="/signup" className="btn-modern-outline">Sign Up Now</Link>
            </div>
         </div>
      </section>

      {/* Simple Floating Button */}
      <button className="fab-classy" onClick={() => scrollToSection('connect')}>
         <i className="fas fa-envelope"></i>
      </button>
    </div>
  );
}

export default ServantPublicView;
