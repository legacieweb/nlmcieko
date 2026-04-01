import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ServantPage.css';

function ServantPage() {
  const { user: authUser, checkStatus, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloginRequired, setReloginRequired] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [subscription, setSubscription] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [customization, setCustomization] = useState({
    themeColor: '#818cf8',
    displayName: '',
    bio: '',
    vision: '',
    dailyWord: '',
    profileImage: '',
    bannerImage: '',
    musicGenrePreference: '',
    customWidgets: []
  });
  const [servantContacts, setServantContacts] = useState([]);
  const [servantVisits, setServantVisits] = useState([]);
  const [analytics, setAnalytics] = useState({ visits: 0 });

  const fetchData = useCallback(async () => {
    try {
      const user = authUser || JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error("No user found");

      // We use try-catch inside to prevent one failure from blocking everything
      const results = await Promise.allSettled([
        api.get('/admin/servant/page'),
        api.get('/admin/servant/notifications'),
        api.get('/admin/servant/customization'),
        api.get('/admin/servant/contacts'),
        api.get('/admin/servant/visits'),
        api.get(`/admin/servant-view/${user.email}`)
      ]);

      if (results[0].status === 'fulfilled') setPage(results[0].value.data);
      if (results[1].status === 'fulfilled') setNotifications(results[1].value.data.count);
      
      if (results[2].status === 'fulfilled' && results[2].value.data && Object.keys(results[2].value.data).length > 0) {
        setCustomization(prev => ({ ...prev, ...results[2].value.data }));
      }
      
      if (results[3].status === 'fulfilled') setServantContacts(results[3].value.data);
      if (results[4].status === 'fulfilled') setServantVisits(results[4].value.data);
      
      if (results[5].status === 'fulfilled') {
        setAnalytics({ visits: results[5].value.data.servant?.visits || 0 });
      } else {
        setAnalytics({ visits: 0 });
      }
      
      setSubscription(user?.music_genre_subscription || '');

    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        const freshUser = await checkStatus();
        if (freshUser?.isServant || freshUser?.isAdmin) {
           setReloginRequired(true);
        } else {
           setError("You don't have servant access. Please contact admin.");
        }
      } else {
        setError(err.response?.data?.message || 'Error loading dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, [checkStatus, authUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    logout();
    window.location.href = '/#/login';
  };

  const handleSaveCustomization = async () => {
    setSaving(true);
    try {
      await api.post('/admin/servant/customization', customization);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSubscribe = async (genre) => {
    try {
      await api.post('/admin/servant/subscribe', { genre });
      setSubscription(genre);
      const user = JSON.parse(localStorage.getItem('user'));
      user.music_genre_subscription = genre;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err) {
      alert('Subscription failed');
    }
  };

  const clearNotifs = async () => {
    try {
      await api.post('/admin/servant/clear-notifications');
      setNotifications(0);
    } catch (err) {
      console.error(err);
    }
  };

  const addWidget = () => {
    const title = prompt("Widget Title:");
    const content = prompt("Widget Content:");
    if (title && content) {
      setCustomization(prev => ({
        ...prev,
        customWidgets: [...prev.customWidgets, { title, content, id: Date.now() }]
      }));
    }
  };

  const removeWidget = (id) => {
    setCustomization(prev => ({
      ...prev,
      customWidgets: prev.customWidgets.filter(w => w.id !== id)
    }));
  };

  const copyShareLink = () => {
    const user = authUser || JSON.parse(localStorage.getItem('user'));
    const identifier = page?.title || customization.displayName || user?.email;
    const slug = identifier.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const link = `${window.location.origin}/#/servant-view/${slug}`;
    navigator.clipboard.writeText(link);
    alert('Shareable link copied to clipboard!');
  };

  if (loading) return (
    <div className="servant-loading-screen">
      <div className="spiritual-loader">
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-icon-wrapper">
          <i className="fas fa-dove"></i>
        </div>
      </div>
      <p>Preparing your ministry workspace...</p>
    </div>
  );
  
  if (reloginRequired) return (
    <div className="servant-error">
      <i className="fas fa-sync-alt" style={{ color: 'var(--servant-primary)' }}></i>
      <h2>Workspace Ready!</h2>
      <p>Your ministry permissions have been updated. Please log in again to activate your workspace.</p>
      <button onClick={handleLogout} className="back-login-btn" style={{ border: 'none', cursor: 'pointer' }}>Refresh & Log In</button>
    </div>
  );
  
  if (error) return (
    <div className="servant-error">
      <i className="fas fa-exclamation-triangle"></i>
      <h2>Access Restricted</h2>
      <p>{error}</p>
      <button onClick={handleLogout} className="back-login-btn" style={{ border: 'none', cursor: 'pointer' }}>Back to Login</button>
    </div>
  );

  return (
    <div className="servant-page-container">
      <aside className="servant-sidebar">
        <div className="servant-profile">
          <div className="servant-avatar-preview">
            {customization.profileImage ? (
              <img src={customization.profileImage} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">{customization.displayName?.charAt(0) || JSON.parse(localStorage.getItem('user'))?.full_name?.charAt(0)}</div>
            )}
          </div>
          <h3>{customization.displayName || 'Servant'}</h3>
          <span className="servant-role-badge">Ministry Partner</span>
        </div>

        <nav className="servant-nav">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <i className="fas fa-th-large"></i> <span>Dashboard</span>
          </div>
          <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <i className="fas fa-paint-brush"></i> <span>Appearance</span>
          </div>
          <div className={`nav-item ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
            <i className="fas fa-file-alt"></i> <span>Content</span>
          </div>
          <div className={`nav-item ${activeTab === 'contacts' ? 'active' : ''}`} onClick={() => setActiveTab('contacts')}>
            <i className="fas fa-comment-dots"></i> <span>Inquiries</span>
            {servantContacts.length > 0 && <span className="notif-badge">{servantContacts.length}</span>}
          </div>
          <div className={`nav-item ${activeTab === 'visitors' ? 'active' : ''}`} onClick={() => setActiveTab('visitors')}>
            <i className="fas fa-users"></i> <span>Visitors</span>
            {servantVisits.length > 0 && <span className="notif-badge">{servantVisits.length}</span>}
          </div>
          <div className="nav-item" onClick={clearNotifs}>
            <i className="fas fa-bell"></i> <span>Alerts</span>
            {notifications > 0 && <span className="notif-badge">{notifications}</span>}
          </div>
          <div className="nav-item" onClick={copyShareLink}>
            <i className="fas fa-share-alt"></i> <span>Share Link</span>
          </div>
        </nav>

        <div className="sidebar-footer">
           <button className="logout-btn-sm" onClick={handleLogout}>
             <i className="fas fa-power-off"></i> <span>Logout</span>
           </button>
        </div>
      </aside>

      <main className="servant-main">
        {activeTab === 'dashboard' && (
          <>
            <header className="servant-header">
              <div className="header-left">
                <h1>Overview</h1>
                <p className="date-subtitle">Manage your ministry reach and engagement</p>
              </div>
            </header>

            <div className="servant-dashboard-grid">
              <div className="dashboard-card">
                 <div className="card-icon"><i className="fas fa-users"></i></div>
                 <div className="card-info">
                    <span className="label">Total Visits</span>
                    <span className="value">{analytics.visits}</span>
                 </div>
              </div>
              <div className="dashboard-card">
                 <div className="card-icon"><i className="fas fa-music"></i></div>
                 <div className="card-info">
                    <span className="label">Music Feed</span>
                    <span className="value">{subscription || 'None'}</span>
                 </div>
              </div>
              <div className="dashboard-card">
                 <div className="card-icon"><i className="fas fa-envelope"></i></div>
                 <div className="card-info">
                    <span className="label">Messages</span>
                    <span className="value">{servantContacts.length}</span>
                 </div>
              </div>
            </div>

            <div className="dashboard-sections">
              <section className="section-card">
                <h3><i className="fas fa-bullseye"></i> Music Preference</h3>
                <div className="control-group">
                  <label>Update your music genre subscription to get relevant updates.</label>
                  <select value={subscription} onChange={(e) => handleSubscribe(e.target.value)}>
                    <option value="">None</option>
                    <option value="gospel">Gospel</option>
                    <option value="worship">Worship</option>
                    <option value="trap">Trap</option>
                    <option value="reggae">Reggae</option>
                  </select>
                </div>
              </section>
              
              <section className="section-card">
                <h3><i className="fas fa-info-circle"></i> Quick Links</h3>
                <button className="save-cust-btn-top" onClick={copyShareLink} style={{width: '100%'}}>Copy Public Page Link</button>
              </section>
            </div>
          </>
        )}

        {activeTab === 'profile' && (
          <>
            <header className="servant-header">
              <h1>Customization</h1>
              <button className="save-cust-btn-top" onClick={handleSaveCustomization} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </header>

            <div className="profile-edit-grid">
              <div className="edit-card">
                <h3>Branding</h3>
                <div className="control-group">
                  <label>Brand Theme Color</label>
                  <div className="color-picker-wrapper">
                    <input type="color" value={customization.themeColor} onChange={(e) => setCustomization({...customization, themeColor: e.target.value})} />
                    <code>{customization.themeColor}</code>
                  </div>
                </div>
                <div className="control-group">
                  <label>Display Name</label>
                  <input type="text" value={customization.displayName} placeholder="Your public name" onChange={(e) => setCustomization({...customization, displayName: e.target.value})} />
                </div>
                <div className="control-group">
                  <label>Avatar URL</label>
                  <input type="text" value={customization.profileImage} placeholder="Link to profile image" onChange={(e) => setCustomization({...customization, profileImage: e.target.value})} />
                </div>
              </div>

              <div className="edit-card">
                <h3>Spiritual Message</h3>
                <div className="control-group">
                  <label>Bio / Testimony</label>
                  <textarea value={customization.bio} placeholder="Your short bio..." onChange={(e) => setCustomization({...customization, bio: e.target.value})} rows="4"></textarea>
                </div>
                <div className="control-group">
                  <label>Ministry Vision</label>
                  <textarea value={customization.vision} placeholder="Your vision statement..." onChange={(e) => setCustomization({...customization, vision: e.target.value})} rows="4"></textarea>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'content' && (
          <>
            <header className="servant-header">
              <h1>Page Content</h1>
              <button className="save-cust-btn-top" onClick={addWidget}>Add Widget</button>
            </header>
            
            <div className="dashboard-sections">
              <section className="section-card">
                <h3>Admin Assigned Content</h3>
                <div className="contact-body" dangerouslySetInnerHTML={{ __html: page?.content || 'No content assigned yet.' }}></div>
              </section>
              
              <section className="section-card">
                <h3>My Widgets</h3>
                {customization.customWidgets.map(w => (
                  <div key={w.id} className="contact-message-card">
                    <div className="contact-meta">
                      <span className="contact-name">{w.title}</span>
                      <button onClick={() => removeWidget(w.id)} style={{background: 'none', border: 'none', color: 'red', cursor: 'pointer'}}><i className="fas fa-trash"></i></button>
                    </div>
                    <p className="contact-body">{w.content}</p>
                  </div>
                ))}
              </section>
            </div>
          </>
        )}

        {activeTab === 'visitors' && (
          <>
            <header className="servant-header">
              <h1>Recent Visitors</h1>
            </header>
            <div className="contacts-list">
              {servantVisits.length > 0 ? servantVisits.map((visit, index) => (
                <div key={visit._id || index} className="contact-message-card">
                  <div className="contact-meta">
                    <span className="contact-name">Visitor from {visit.visitorIp === '::1' ? 'Localhost' : visit.visitorIp}</span>
                    <span className="contact-date">{new Date(visit.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="contact-body">Unique visit recorded from this IP address.</p>
                </div>
              )) : (
                <div className="section-card">No unique visitors recorded yet.</div>
              )}
            </div>
          </>
        )}

        {activeTab === 'contacts' && (
          <>
            <header className="servant-header">
              <h1>Inquiries</h1>
            </header>
            <div className="contacts-list">
              {servantContacts.length > 0 ? servantContacts.map(contact => (
                <div key={contact.id} className="contact-message-card">
                  <div className="contact-meta">
                    <span className="contact-name">{contact.name}</span>
                    <span className="contact-date">{new Date(contact.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="contact-email">{contact.email}</div>
                  <p className="contact-body">{contact.message}</p>
                </div>
              )) : (
                <div className="section-card">No inquiries yet.</div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default ServantPage;
