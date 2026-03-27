import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import './AuthPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);

      setMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/order');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-full">
      <Helmet>
        <title>Login | NLM Cieko</title>
        <meta name="description" content="Login to your NLM Cieko account to order free Christian books and access exclusive content." />
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
            <h1>Welcome Back</h1>
            <p>Continue your spiritual journey with us. Access free Christian books, music, and join our growing community of believers.</p>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="feature-icon">
                <i className="fas fa-book-open"></i>
              </div>
              <div className="feature-text">
                <h3>Free Books</h3>
                <p>Order Christian literature at no cost</p>
              </div>
            </div>
            <div className="auth-feature">
              <div className="feature-icon">
                <i className="fas fa-music"></i>
              </div>
              <div className="feature-text">
                <h3>Worship Music</h3>
                <p>Stream uplifting gospel music</p>
              </div>
            </div>
            <div className="auth-feature">
              <div className="feature-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="feature-text">
                <h3>Community</h3>
                <p>Connect with fellow believers</p>
              </div>
            </div>
          </div>

          <div className="auth-branding-footer">
            <p>"For where two or three gather in my name, there am I with them."</p>
            <span>— Matthew 18:20</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-modern">
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

            <button type="submit" className="btn-modern" disabled={loading}>
              {loading ? (
                <div className="btn-loading">
                  <div className="spinner-modern"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            <button className="social-btn google">
              <i className="fab fa-google"></i>
            </button>
            <button className="social-btn facebook">
              <i className="fab fa-facebook-f"></i>
            </button>
            <button className="social-btn apple">
              <i className="fab fa-apple"></i>
            </button>
          </div>

          <div className="auth-form-footer">
            <p>Don't have an account? <Link to="/signup">Create Account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
