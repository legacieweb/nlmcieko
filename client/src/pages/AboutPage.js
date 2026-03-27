import React from 'react';
import { Helmet } from 'react-helmet-async';
import './AboutPage.css';

function AboutPage() {
  return (
    <div className="about-page homepage">
      <Helmet>
        <title>About Us | Grace Church - NLM Cieko</title>
        <meta name="description" content="Learn about NLM Cieko and our mission at Grace Church to spread the Gospel of Jesus Christ and build faith through the unchanging Truth of the Word of God." />
        <meta property="og:title" content="About Grace Church - NLM Cieko" />
        <meta property="og:description" content="Discover our mission, beliefs, and values as we share the Gospel and provide spiritual resources for all seekers." />
      </Helmet>
      <section className="hero-section">
        <div className="gradient-sphere"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              About <span className="highlight">NLM Cieko</span>
            </h1>
            <p className="hero-subtitle">
              Dedicated to Spreading God's Word and Building Faith in Jesus Christ through the unchanging Truth.
            </p>
          </div>
        </div>
      </section>

      <section className="about-content-section salvation-section">
        <div className="container">
          <div className="section-grid">
            <div className="salvation-content">
              <span className="section-tag">Our Mission</span>
              <h2>Spreading the Gospel</h2>
              <p>
                NLM Cieko exists to proclaim the Gospel of Jesus Christ, helping people understand the Word of God through biblical teaching and genuine fellowship. We believe that everyone deserves access to spiritual truth that can transform their lives and lead them to eternal salvation.
              </p>
              <p>
                Our mission is to take seekers straight to the Word of God—the Bible—so they can discover the answers to their deepest spiritual questions and experience the life-changing power of faith in Jesus Christ.
              </p>
            </div>
            <div className="salvation-image">
              <div className="quote-box">
                "Go into all the world and preach the gospel to every creature."
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="beliefs-section books-section">
        <div className="gradient-sphere secondary"></div>
        <div className="container">
          <div className="section-header center">
            <h2 className="section-title">
              What We <span className="highlight">Believe</span>
            </h2>
            <p className="section-subtitle">Our core convictions grounded in the Holy Scriptures.</p>
          </div>

          <div className="salvation-points">
            <div className="point">
              <h3>The Savior</h3>
              <p>Jesus Christ is the Son of God and the Savior of humanity, who became flesh to save us from our sins.</p>
            </div>
            <div className="point">
              <h3>The Word</h3>
              <p>The Bible is God's inspired and infallible Word, the ultimate authority for faith and life.</p>
            </div>
            <div className="point">
              <h3>Salvation</h3>
              <p>Salvation comes through faith in Jesus Christ alone, a free gift of God's grace to all who believe.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="values-section belief-section">
        <div className="container">
          <div className="section-header center">
            <span className="section-tag">Our Values</span>
            <h2>Core Principles</h2>
          </div>
          
          <div className="other-resources" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="resource-card-sm">
              <div className="card-sm-icon"><i className="fas fa-book"></i></div>
              <div className="card-sm-content">
                <h4>Biblical Truth</h4>
                <p>Everything we teach is grounded in Scripture.</p>
              </div>
            </div>
            <div className="resource-card-sm">
              <div className="card-sm-icon"><i className="fas fa-unlock"></i></div>
              <div className="card-sm-content">
                <h4>Accessibility</h4>
                <p>Spiritual knowledge should be free and available to all.</p>
              </div>
            </div>
            <div className="resource-card-sm">
              <div className="card-sm-icon"><i className="fas fa-lightbulb"></i></div>
              <div className="card-sm-content">
                <h4>Clarity</h4>
                <p>We explain complex biblical concepts in understandable ways.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section salvation-section">
        <div className="container">
          <div className="belief-card" style={{ textAlign: 'center' }}>
            <h2>Start Your Journey Today</h2>
            <p style={{ marginBottom: '2rem', color: '#94a3b8' }}>
              If you're seeking answers about God, Jesus Christ, and eternal life, we invite you to explore the Word of God with us.
            </p>
            <a href="/" className="btn btn-primary">Explore Our Free Resources</a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
