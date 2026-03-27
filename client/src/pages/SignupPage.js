import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import './AuthPage.css';

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    county: '',
    town: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);

  const KENYAN_COUNTIES = [
    'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta',
    'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Samburu',
    'Turkana', 'West Pokot', 'Baringo', 'Laikipia', 'Nakuru', 'Nairobi',
    'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma',
    'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii',
    'Nyamira', 'Narok', 'Kiambu', 'Muranga', 'Nyeri', 'Kirinyaga',
    'Embu', 'Meru', 'Tharaka-Nithi', 'Makueni', 'Machakos', 'Kitui'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.password || !formData.phone || !formData.county || !formData.town) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    try {
      await signup({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
        county: formData.county,
        town: formData.town,
      });

      setMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/order');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.phone) {
        setError('Please fill in all personal information fields');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  return (
    <div className="auth-page-full">
      <Helmet>
        <title>Sign Up | NLM Cieko</title>
        <meta name="description" content="Create your NLM Cieko account to order free Christian books and join our community." />
      </Helmet>

      {/* Animated Background */}
      <div className="auth-bg-animation">
        <div className="auth-bg-gradient"></div>
        <div className="auth-bg-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              '--delay': `${Math.random() * 5}s`,
              '--duration': `${15 + Math.random() * 10}s`,
              '--size': `${10 + Math.random() * 40}px`,
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
            }}></div>
          ))}
        </div>
      </div>

      {/* Left Side - Branding */}
      <div className="auth-branding">
        <div className="auth-branding-content">
          <Link to="/" className="auth-logo">
            <div className="logo-icon">
              <i className="fas fa-church"></i>
            </div>
            <span>NLM Cieko</span>
          </Link>
          
          <div className="auth-branding-text">
            <h1>Join Our Family</h1>
            <p>Start your journey with NLM Cieko. Get access to free Christian books, worship music, and become part of a loving community.</p>
          </div>

          <div className="auth-benefits">
            <div className="benefit-item">
              <div className="benefit-check">
                <i className="fas fa-check"></i>
              </div>
              <span>Free Christian books delivered to you</span>
            </div>
            <div className="benefit-item">
              <div className="benefit-check">
                <i className="fas fa-check"></i>
              </div>
              <span>Access to exclusive worship music</span>
            </div>
            <div className="benefit-item">
              <div className="benefit-check">
                <i className="fas fa-check"></i>
              </div>
              <span>Join a supportive community</span>
            </div>
            <div className="benefit-item">
              <div className="benefit-check">
                <i className="fas fa-check"></i>
              </div>
              <span>Regular spiritual content updates</span>
            </div>
          </div>

          <div className="auth-testimonial">
            <div className="testimonial-content">
              <i className="fas fa-quote-left"></i>
              <p>"Joining NLM Cieko has transformed my spiritual life. The resources and community support are incredible."</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="author-info">
                  <strong>Sarah M.</strong>
                  <span>Member since 2024</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-side">
        <div className="auth-form-container signup-container">
          <div className="auth-form-header">
            <h2>Create Account</h2>
            <p>Fill in your details to get started</p>
          </div>

          {/* Progress Steps */}
          <div className="progress-steps">
            <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Personal Info</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Location</span>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Security</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-modern">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="form-step">
                <div className="input-group-modern">
                  <div className="input-field-modern">
                    <i className="fas fa-user"></i>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder=" "
                      required
                    />
                    <label htmlFor="fullName">Full Name</label>
                    <div className="input-highlight"></div>
                  </div>
                </div>

                <div className="input-group-modern">
                  <div className="input-field-modern">
                    <i className="fas fa-envelope"></i>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder=" "
                      required
                    />
                    <label htmlFor="email">Email Address</label>
                    <div className="input-highlight"></div>
                  </div>
                </div>

                <div className="input-group-modern">
                  <div className="input-field-modern">
                    <i className="fas fa-phone"></i>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder=" "
                      required
                    />
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-highlight"></div>
                  </div>
                </div>

                <button type="button" className="btn-modern btn-next" onClick={nextStep}>
                  <span>Continue</span>
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="form-step">
                <div className="input-group-modern">
                  <div className="input-field-modern select-field">
                    <i className="fas fa-map-marker-alt"></i>
                    <select
                      id="county"
                      name="county"
                      value={formData.county}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select your county</option>
                      {KENYAN_COUNTIES.map((county) => (
                        <option key={county} value={county}>
                          {county}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="county" className="select-label">County</label>
                    <div className="input-highlight"></div>
                  </div>
                </div>

                <div className="input-group-modern">
                  <div className="input-field-modern">
                    <i className="fas fa-city"></i>
                    <input
                      type="text"
                      id="town"
                      name="town"
                      value={formData.town}
                      onChange={handleChange}
                      placeholder=" "
                      required
                    />
                    <label htmlFor="town">Town/City</label>
                    <div className="input-highlight"></div>
                  </div>
                </div>

                <div className="form-buttons">
                  <button type="button" className="btn-modern btn-back" onClick={prevStep}>
                    <i className="fas fa-arrow-left"></i>
                    <span>Back</span>
                  </button>
                  <button type="button" className="btn-modern btn-next" onClick={nextStep}>
                    <span>Continue</span>
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Security */}
            {step === 3 && (
              <div className="form-step">
                <div className="input-group-modern">
                  <div className="input-field-modern">
                    <i className="fas fa-lock"></i>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder=" "
                      required
                    />
                    <label htmlFor="password">Password</label>
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                    <div className="input-highlight"></div>
                  </div>
                </div>

                <div className="input-group-modern">
                  <div className="input-field-modern">
                    <i className="fas fa-shield-alt"></i>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder=" "
                      required
                    />
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <button 
                      type="button" 
                      className="password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                    <div className="input-highlight"></div>
                  </div>
                </div>

                {error && (
                  <div className="alert-modern alert-error-modern">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{error}</span>
                  </div>
                )}
                
                {message && (
                  <div className="alert-modern alert-success-modern">
                    <i className="fas fa-check-circle"></i>
                    <span>{message}</span>
                  </div>
                )}

                <div className="form-buttons">
                  <button type="button" className="btn-modern btn-back" onClick={prevStep}>
                    <i className="fas fa-arrow-left"></i>
                    <span>Back</span>
                  </button>
                  <button type="submit" className="btn-modern btn-submit-modern" disabled={loading}>
                    {loading ? (
                      <div className="btn-loading">
                        <div className="spinner-modern"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <i className="fas fa-check"></i>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="auth-form-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
