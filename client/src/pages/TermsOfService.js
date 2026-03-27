import React from 'react';
import './TermsOfService.css';

function TermsOfService() {
  return (
    <div className="terms-page homepage">
      <section className="hero-section">
        <div className="gradient-sphere"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Terms of <span className="highlight">Service</span>
            </h1>
            <p className="hero-subtitle">
              By using our resources and website, you agree to these terms at NLM Cieko.
            </p>
          </div>
        </div>
      </section>

      <section className="terms-content salvation-section">
        <div className="container">
          <div className="belief-card">
            <div className="terms-text" style={{ color: '#94a3b8', lineHeight: '1.8' }}>
              <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Use of Resources</h2>
              <p style={{ marginBottom: '2rem' }}>
                All free Christian books, sermon audios, and study guides provided by NLM Cieko are for personal spiritual growth and non-commercial educational purposes. You may not sell or redistribute these materials for profit.
              </p>

              <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Intellectual Property</h2>
              <p style={{ marginBottom: '2rem' }}>
                The content on this website, including text, graphics, logos, and digital downloads, is the property of NLM Cieko and protected by intellectual property laws. Reproduction without permission is prohibited.
              </p>

              <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>User Conduct</h2>
              <p style={{ marginBottom: '2rem' }}>
                Users are expected to interact with our community and resources respectfully. Any behavior deemed inappropriate or disruptive to our mission may result in restricted access to our services.
              </p>

              <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Disclaimer</h2>
              <p style={{ marginBottom: '2rem' }}>
                The spiritual guidance and resources provided are based on our biblical understanding. We do not guarantee specific outcomes and recommend that users personally study the Word of God alongside our materials.
              </p>

              <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Amendments</h2>
              <p>
                NLM Cieko reserves the right to update these Terms of Service at any time. Your continued use of the website constitutes acceptance of the new terms.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TermsOfService;
