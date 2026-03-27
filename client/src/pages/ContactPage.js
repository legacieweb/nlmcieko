import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import './ContactPage.css';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitMessage('');
    setSubmitError('');

    try {
      await axios.post('/api/contact/submit', formData);
      setSubmitMessage('Thank you for your message! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setTimeout(() => setSubmitMessage(''), 5000);
    } catch (error) {
      setSubmitError('Error sending message. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page homepage">
      <Helmet>
        <title>Contact Us | Grace Church - NLM Cieko</title>
        <meta name="description" content="Get in touch with NLM Cieko and Grace Church. We're here to answer your questions about faith, Jesus Christ, and our spiritual resources." />
        <meta property="og:title" content="Contact Grace Church - NLM Cieko" />
        <meta property="og:description" content="Reach out to us for spiritual guidance or questions about our free gospel resources and books." />
      </Helmet>
      <section className="hero-section">
        <div className="gradient-sphere"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Contact <span className="highlight">NLM Cieko</span>
            </h1>
            <p className="hero-subtitle">
              Have questions about God, Jesus Christ, or our spiritual resources? We'd love to hear from you and walk with you.
            </p>
          </div>
        </div>
      </section>

      <section className="contact-content-section salvation-section">
        <div className="container">
          <div className="section-grid">
            <div className="salvation-content">
              <span className="section-tag">Get In Touch</span>
              <h2>We Are Here For You</h2>
              <p>
                Whether you have questions about our free Christian book, want to know more about Jesus Christ, or need spiritual guidance, our team at NLM Cieko is here to help.
              </p>
              
              <div className="contact-info-grid" style={{ display: 'grid', gap: '1.5rem', marginTop: '3rem' }}>
                <div className="resource-card-sm" style={{ padding: '2rem' }}>
                  <div className="card-sm-icon" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}><i className="fas fa-envelope"></i></div>
                  <div className="card-sm-content">
                    <h4>Email</h4>
                    <p>info@nlmcieko.org</p>
                  </div>
                </div>
                <div className="resource-card-sm" style={{ padding: '2rem' }}>
                  <div className="card-sm-icon" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}><i className="fas fa-location-dot"></i></div>
                  <div className="card-sm-content">
                    <h4>Location</h4>
                    <p>NLM Cieko Church Headquarters</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              <div className="belief-card" style={{ padding: '3.5rem' }}>
                <form onSubmit={handleSubmit} className="modern-form">
                  <h3 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'white' }}>Send Message</h3>
                  
                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your Name"
                      style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Your Email"
                      style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white' }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      placeholder="How can we help you?"
                      style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', resize: 'none' }}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>

                  {submitMessage && <p style={{ color: '#4ade80', marginTop: '1rem', textAlign: 'center' }}>{submitMessage}</p>}
                  {submitError && <p style={{ color: '#f87171', marginTop: '1rem', textAlign: 'center' }}>{submitError}</p>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section books-section">
        <div className="container">
          <div className="section-header center">
            <h2 className="section-title">Common <span className="highlight">Questions</span></h2>
            <p className="section-subtitle">Find quick answers to your inquiries about our mission and resources.</p>
          </div>

          <div className="salvation-points">
            <div className="point">
              <h3>Free Resources?</h3>
              <p>Yes! We believe spiritual knowledge should be accessible to everyone. Our materials are completely free of charge.</p>
            </div>
            <div className="point">
              <h3>The NLM Cieko Book?</h3>
              <p>Our book explores the path to life and salvation through the Word of God, pointing directly to biblical truths.</p>
            </div>
            <div className="point">
              <h3>Need Guidance?</h3>
              <p>Our team is available to help you navigate your spiritual journey and answer deeper questions about faith.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
