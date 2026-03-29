import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './OrderHistoryPage.css';

function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    setUser(user);
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      default:
        return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="order-history-page">
      <div className="order-history-hero">
        <div className="container">
          <h1>Your Orders</h1>
          <p>Track your free Christian book orders</p>
        </div>
      </div>

      <div className="container order-history-container">
        <div className="order-history-header">
          <h2>Order History</h2>
          <Link to="/order" className="btn btn-primary btn-small">
            + New Order
          </Link>
        </div>

        {loading ? (
          <div className="loading">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><i className="fas fa-box-open"></i></div>
            <h3>No Orders Yet</h3>
            <p>You haven't placed any orders yet. Start by ordering your free Christian book!</p>
            <Link to="/order" className="btn btn-primary">
              Place Your First Order
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-item">
                <div className="order-item-header">
                  <div className="order-info-group">
                    <h3>Order #{order._id.substring(0, 8).toUpperCase()}</h3>
                    <p className="order-date">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className={`order-status ${getStatusBadgeClass(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div className="order-details-grid">
                  <div className="detail-column">
                    <h4>Delivery Address</h4>
                    <p>{order.fullName}</p>
                    <p>{order.address}</p>
                    <p>{order.town}, {order.county}</p>
                    {order.postalCode && <p>{order.postalCode}</p>}
                    <p className="phone"><i className="fas fa-phone"></i> {order.phone}</p>
                  </div>

                  <div className="detail-column">
                    <h4>Order Details</h4>
                    <p><strong>Quantity:</strong> {order.quantity} book(s)</p>
                    <p><strong>Price:</strong> FREE</p>
                    <p><strong>Shipping:</strong> FREE</p>
                    <p className="total"><strong>Total:</strong> FREE</p>
                  </div>

                  <div className="detail-column">
                    <h4>Tracking</h4>
                    {order.trackingNumber ? (
                      <p className="tracking-number">
                        <strong>Tracking #:</strong><br />
                        <code>{order.trackingNumber}</code>
                      </p>
                    ) : (
                      <p className="no-tracking">Tracking number not yet assigned</p>
                    )}
                  </div>
                </div>

                {order.notes && (
                  <div className="order-notes">
                    <strong>Special Instructions:</strong>
                    <p>{order.notes}</p>
                  </div>
                )}

                <div className="order-timeline">
                  <div className={`timeline-item ${order.status === 'pending' ? 'active' : order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'completed' : ''}`}>
                    <div className="timeline-dot"></div>
                    <span>Order Placed</span>
                  </div>
                  <div className={`timeline-item ${order.status === 'processing' ? 'active' : order.status === 'shipped' || order.status === 'delivered' ? 'completed' : ''}`}>
                    <div className="timeline-dot"></div>
                    <span>Processing</span>
                  </div>
                  <div className={`timeline-item ${order.status === 'shipped' ? 'active' : order.status === 'delivered' ? 'completed' : ''}`}>
                    <div className="timeline-dot"></div>
                    <span>Shipped</span>
                  </div>
                  <div className={`timeline-item ${order.status === 'delivered' ? 'completed' : ''}`}>
                    <div className="timeline-dot"></div>
                    <span>Delivered</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="order-history-footer">
          <div className="footer-card">
            <h3>Need Help?</h3>
            <p>If you have any questions about your order or need assistance, please contact us through the Contact page.</p>
            <Link to="/contact" className="btn btn-secondary btn-small">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderHistoryPage;
