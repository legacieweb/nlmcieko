import React from 'react';
import './PrivacyPolicy.css';

function PrivacyPolicy() {
  return (
    <div className="privacy-page homepage">
      <section className="hero-section">
        <div className="gradient-sphere"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Privacy <span className="highlight">Policy</span>
            </h1>
            <p className="hero-subtitle">
              Your privacy is important to us. Learn how we handle your information at NLM Cieko.
            </p>
          </div>
        </div>
      </section>

      <section className="policy-content salvation-section">
        <div className="container">
          <div className="belief-card">
            <div className="policy-text" style={{ color: '#94a3b8', lineHeight: '1.8' }}>
              <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Introduction</h2>
              <p style={{ marginBottom: '2rem' }}>
                At NLM Cieko, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and protect your data when you interact with our website and resources.
              </p>

              <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Information We Collect</h2>
              <p style={{ marginBottom: '1rem' }}>
                We may collect the following types of information:
              </p>
              <ul style={{ marginBottom: '2rem', paddingLeft: '1.5rem' }}>
                <li>Personal identifiers (such as name and email address) when you download resources or contact us.</li>
                <li>Usage data (such as IP address and browser type) to improve our website experience.</li>
                <li>Spiritual reflection data (such as belief percentages) to provide tailored guidance.</li>
              </ul>

              <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>How We Use Your Information</h2>
              <p style={{ marginBottom: '2rem' }}>
                Your information is used solely for providing spiritual resources, responding to inquiries, and improving our services. We do not sell or share your personal data with third parties for marketing purposes.
              </p>

              <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Data Security</h2>
              <p style={{ marginBottom: '2rem' }}>
                We implement a variety of security measures to maintain the safety of your personal information. Your data is stored in secure environments accessible only by authorized personnel.
              </p>

              <h2 style={{ color: 'white', marginBottom: '1.5rem' }}>Contact Us</h2>
              <p>
                If you have any questions regarding this Privacy Policy, you may contact us at info@nlmcieko.org.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PrivacyPolicy;
