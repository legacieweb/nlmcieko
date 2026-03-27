import React from 'react';
import { Link } from 'react-router-dom';
import './PortfolioPage.css';

function PortfolioPage() {
  const portfolios = [
    {
      id: 1,
      title: 'Music Experience',
      description: 'Explore our fabulous music collection with different genre themes.',
      link: '/music',
      icon: 'fas fa-music',
      bgImage: '/assets/images/WhatsApp%20Image%202026-03-27%20at%208.08.45%20PM.jpeg'
    },
    {
      id: 2,
      title: 'Image Gallery',
      description: 'A collection of visual arts and spiritual photography.',
      link: '/gallery/images',
      icon: 'fas fa-image',
      bgImage: '/assets/images/WhatsApp%20Image%202026-03-22%20at%2012.47.31%20PM.jpeg'
    },
    {
      id: 3,
      title: 'Video Gallery',
      description: 'Cinematic spiritual messages and music videos.',
      link: '/gallery/videos',
      icon: 'fas fa-video',
      bgImage: '/assets/images/WhatsApp%20Image%202026-03-22%20at%2012.47.30%20PM.jpeg'
    }
  ];

  return (
    <div className="portfolio-page">
      <header className="portfolio-header">
        <div className="container">
          <h1>Our Portfolio</h1>
          <p>A journey through music, vision, and light.</p>
        </div>
      </header>

      <section className="portfolio-grid-section">
        <div className="container">
          <div className="portfolio-grid">
            {portfolios.map(item => (
              <Link to={item.link} key={item.id} className="portfolio-card" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${item.bgImage})`}}>
                <div className="card-content">
                  <span className="card-icon"><i className={item.icon}></i></span>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <span className="explore-btn">Explore Now →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default PortfolioPage;
