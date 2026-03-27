import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrderPage.css';

function OrderPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [counties, setCounties] = useState([]);
  const BASE_URL = 'http://localhost:5000';
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    county: '',
    town: '',
    address: '',
    postalCode: '',
    quantity: 1,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    setUser(user);

    setFormData((prev) => ({
      ...prev,
      fullName: user.fullName,
      phone: user.phone,
      county: user.county,
      town: user.town,
    }));

    fetchCounties();
  }, [navigate]);

  const fetchCounties = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/orders/counties`);
      setCounties(response.data.counties);
    } catch (error) {
      console.error('Error fetching counties:', error);
    }
  };

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

    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.county ||
      !formData.town ||
      !formData.address ||
      !formData.quantity
    ) {
      setError('All required fields must be filled');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/orders`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrderSuccess(true);
      setMessage('Order placed successfully! Check your email for confirmation.');
      setTimeout(() => {
        navigate('/order-history');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="order-page">
      <div className="order-hero">
        <div className="order-hero-content">
          <h1>Get Your Free Christian Book</h1>
          <p>Complete your order and receive the Word of God delivered right to your doorstep in Kenya</p>
        </div>
      </div>

      <div className="container">
        <div className="order-container">
          <div className="order-main">
            <div className="order-card">
              {orderSuccess ? (
                <div className="success-message">
                  <div className="success-icon"><i className="fas fa-check-circle"></i></div>
                  <h2>Order Placed Successfully!</h2>
                  <p>Thank you for ordering the Word of God Christian Book.</p>
                  <p>A confirmation email has been sent to <strong>{user.email}</strong></p>
                  <p>We'll process your order and send you a tracking number soon.</p>
                  <div className="success-details">
                    <p><strong>Delivery Location:</strong> {formData.town}, {formData.county}</p>
                    <p><strong>Quantity:</strong> {formData.quantity} book(s)</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="order-header">
                    <h2>Order Your Free Book</h2>
                    <p>Fill in your details below. No payment required—completely free!</p>
                  </div>

                  <form onSubmit={handleSubmit} className="order-form">
                    <fieldset>
                      <legend>Personal Information</legend>
                      
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="fullName">Full Name *</label>
                          <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="phone">Phone Number *</label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            required
                          />
                        </div>
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend>Delivery Address (Kenya Only)</legend>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="county">County *</label>
                          <select
                            id="county"
                            name="county"
                            value={formData.county}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select your county</option>
                            {counties.map((county) => (
                              <option key={county} value={county}>
                                {county}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="town">Town/City *</label>
                          <input
                            type="text"
                            id="town"
                            name="town"
                            value={formData.town}
                            onChange={handleChange}
                            placeholder="Enter your town/city"
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="address">Street Address *</label>
                        <input
                          type="text"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Enter your street address"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="postalCode">Postal Code (Optional)</label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          placeholder="Enter postal code"
                        />
                      </div>
                    </fieldset>

                    <fieldset>
                      <legend>Order Details</legend>

                      <div className="form-group">
                        <label htmlFor="quantity">Number of Books *</label>
                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleChange}
                          min="1"
                          max="50"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="notes">Special Instructions (Optional)</label>
                        <textarea
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder="Any special delivery instructions?"
                          rows="3"
                        ></textarea>
                      </div>
                    </fieldset>

                    {error && <div className="alert alert-error">{error}</div>}
                    {message && <div className="alert alert-success">{message}</div>}

                    <button type="submit" className="btn btn-primary btn-submit" disabled={loading}>
                      {loading ? 'Processing Order...' : 'Place Order - FREE'}
                    </button>
                  </form>

                  <div className="order-info">
                    <h3>Why This Book is Free</h3>
                    <p>We believe the Word of God should be accessible to everyone. That's why we offer this comprehensive Christian book completely free—no hidden charges, no payment required.</p>
                    <h3>What to Expect</h3>
                    <ul>
                      <li><i className="fas fa-check"></i> Confirmation email sent immediately</li>
                      <li><i className="fas fa-check"></i> Processing within 2-3 business days</li>
                      <li><i className="fas fa-check"></i> Tracking information provided</li>
                      <li><i className="fas fa-check"></i> Delivery within Kenya</li>
                      <li><i className="fas fa-check"></i> Free shipping</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="order-sidebar">
            <div className="book-preview">
              <div className="book-cover-preview">
                <div className="book-cover-content">
                  <h3>Free Christian Book</h3>
                  <p>Sermons & Biblical Insights</p>
                  <div className="book-badge">FREE</div>
                </div>
              </div>
              <h4>What's Inside:</h4>
              <ul className="book-contents">
                <li>Who is Jesus Christ?</li>
                <li>Why Jesus Was Baptized</li>
                <li>Why Jesus Was Born</li>
                <li>The Truth That Sets You Free</li>
                <li>Deep Biblical Analysis</li>
                <li>Scripture References</li>
                <li>Spiritual Guidance</li>
              </ul>
            </div>

            <div className="order-summary">
              <h4>Order Summary</h4>
              <div className="summary-item">
                <span>Books:</span>
                <span className="summary-value">{formData.quantity}</span>
              </div>
              <div className="summary-item">
                <span>Price per Book:</span>
                <span className="summary-value">FREE</span>
              </div>
              <div className="summary-item">
                <span>Shipping:</span>
                <span className="summary-value">FREE</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-total">
                <span>Total:</span>
                <span className="summary-value">FREE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderPage;
