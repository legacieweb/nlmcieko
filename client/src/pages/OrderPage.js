import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Helmet } from 'react-helmet-async';
import './OrderPage.css';

function OrderPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [counties, setCounties] = useState([]);
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
      fullName: user.fullName || '',
      phone: user.phone || '',
      county: user.county || '',
      town: user.town || '',
    }));

    fetchCounties();
  }, [navigate]);

  const fetchCounties = async () => {
    try {
      const response = await api.get('/orders/counties');
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
      await api.post('/orders', formData);
      setOrderSuccess(true);
      setTimeout(() => {
        navigate('/order-history');
      }, 4000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error placing order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="premium-order-page">
      <Helmet>
        <title>Request Free Book | NLM Cieko</title>
        <meta name="description" content="Order your free physical copy of our featured Christian literature. Delivered straight to your doorstep in Kenya." />
      </Helmet>

      <div className="order-bg-visuals">
        <div className="glow-sphere primary"></div>
        <div className="glow-sphere secondary"></div>
      </div>

      <div className="container">
        <div className="order-layout-premium">
          {/* Header Section */}
          <div className="order-intro-premium">
            <span className="premium-tag">Gift of Grace</span>
            <h1>Divine <span className="highlight">Literature</span></h1>
            <p>Request your free physical copy of the Word of God book. No hidden costs, no payment required—simply the truth delivered to you.</p>
          </div>

          <div className="order-grid-premium">
            {/* Form Side */}
            <div className="order-form-container-premium">
              {orderSuccess ? (
                <div className="order-success-premium">
                  <div className="success-lottie">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h2>Order Confirmed</h2>
                  <p>Your request has been received. A confirmation email has been sent to <strong>{user.email}</strong>.</p>
                  <div className="order-summary-mini">
                    <div className="summary-row">
                      <span>Recipient:</span>
                      <span>{formData.fullName}</span>
                    </div>
                    <div className="summary-row">
                      <span>Location:</span>
                      <span>{formData.town}, {formData.county}</span>
                    </div>
                  </div>
                  <p className="redirect-hint">Redirecting to your order history...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="glass-form-premium">
                  <div className="form-section-premium">
                    <h3 className="section-title-premium"><i className="fas fa-user"></i> Personal Details</h3>
                    <div className="form-row-premium">
                      <div className="form-group-premium">
                        <label>Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Your legal name"
                          required
                        />
                      </div>
                      <div className="form-group-premium">
                        <label>Phone Number *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="07XX XXX XXX"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section-premium">
                    <h3 className="section-title-premium"><i className="fas fa-map-marker-alt"></i> Shipping Address</h3>
                    <div className="form-row-premium">
                      <div className="form-group-premium">
                        <label>County *</label>
                        <select
                          name="county"
                          value={formData.county}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select County</option>
                          {counties.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group-premium">
                        <label>Town/City *</label>
                        <input
                          type="text"
                          name="town"
                          value={formData.town}
                          onChange={handleChange}
                          placeholder="e.g. Nairobi CBD"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group-premium">
                      <label>Specific Address/Street *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Building, House No, or Landmarks"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-section-premium">
                    <h3 className="section-title-premium"><i className="fas fa-book"></i> Order Options</h3>
                    <div className="form-group-premium">
                      <label>Quantity (Max 50) *</label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        min="1"
                        max="50"
                        required
                      />
                    </div>
                    <div className="form-group-premium">
                      <label>Special Notes (Optional)</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Any specific delivery instructions?"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>

                  {error && <div className="premium-alert error">{error}</div>}

                  <button type="submit" className="btn btn-primary btn-premium-submit" disabled={loading}>
                    {loading ? (
                      <span className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Processing...</span>
                    ) : (
                      <>Place Free Order <i className="fas fa-arrow-right"></i></>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Sidebar Side */}
            <div className="order-info-sidebar-premium">
              <div className="book-card-premium glass-card">
                <div className="book-visual-premium">
                  <div className="book-3d-minimal">
                    <img src="https://bjnewlife.org/upload/book/HAVEYOUTRULYBEENBORNAGAINOFWATERANDTHESPIRIT2024L.jpg?ver=1709079147" alt="Book Cover" />
                  </div>
                  <div className="free-badge-premium">FREE</div>
                </div>
                <div className="book-specs-premium">
                  <h4>The Truth That Sets Free</h4>
                  <ul className="specs-list">
                    <li><i className="fas fa-check"></i> Complete Gospel of Water & Spirit</li>
                    <li><i className="fas fa-check"></i> High Quality Print</li>
                    <li><i className="fas fa-check"></i> Free Door-to-Door Delivery</li>
                  </ul>
                </div>
              </div>

              <div className="order-summary-card glass-card">
                <h3>Order Summary</h3>
                <div className="summary-content">
                  <div className="summary-item-premium">
                    <span>Subtotal</span>
                    <span className="value-free">KSH 0.00</span>
                  </div>
                  <div className="summary-item-premium">
                    <span>Shipping Fee</span>
                    <span className="value-free">KSH 0.00</span>
                  </div>
                  <div className="summary-divider-premium"></div>
                  <div className="summary-total-premium">
                    <span>Total Cost</span>
                    <span className="total-free">FREE</span>
                  </div>
                </div>
                <div className="trust-badges-premium">
                  <div className="badge-item">
                    <i className="fas fa-shield-halved"></i>
                    <span>Secure</span>
                  </div>
                  <div className="badge-item">
                    <i className="fas fa-truck-fast"></i>
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderPage;
