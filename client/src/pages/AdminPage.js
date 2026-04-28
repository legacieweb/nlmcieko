import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useMusic } from '../context/MusicContext';
import PremiumLoader from '../components/PremiumLoader';
import './AdminPage.css';

function AdminPage() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { showToast } = useMusic();
  const [activeTab, setActiveTab] = useState(tab || 'analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('analytics');
    }
  }, [tab]);
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [beliefs, setBeliefs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [servantPages, setServantPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Songs management state
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPageForm, setShowPageForm] = useState(false);
  const [pageFormData, setPageFormData] = useState({ title: '', content: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    artist: 'NLM Cieko',
    genre: 'gospel',
    audioUrl: '',
    thumbnailUrl: '',
    lyrics: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  // Check if user is admin
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAdmin(user.isAdmin === true);
    }
  }, []);

  // Fetch songs
  const fetchSongs = useCallback(async () => {
    try {
      const res = await api.get('/admin/songs');
      setSongs(res.data);
    } catch (err) {
      console.error('Error fetching songs:', err);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'songs') {
      fetchSongs();
    }
  }, [activeTab, fetchSongs]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data);
      } else if (activeTab === 'orders') {
        const res = await api.get('/admin/orders');
        setOrders(res.data);
      } else if (activeTab === 'beliefs') {
        const res = await api.get('/admin/beliefs');
        setBeliefs(res.data);
      } else if (activeTab === 'contacts') {
        const res = await api.get('/admin/contacts');
        setContacts(res.data);
      } else if (activeTab === 'users') {
        const [usersRes, pagesRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/servant-pages')
        ]);
        setUsers(usersRes.data);
        setServantPages(pagesRes.data);
      } else if (activeTab === 'servant-pages') {
        const res = await api.get('/admin/servant-pages');
        setServantPages(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle form submit - add new song with file upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Create FormData for file upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('artist', formData.artist);
      data.append('genre', formData.genre);
      data.append('lyrics', formData.lyrics);
      data.append('audioUrl', formData.audioUrl);
      data.append('thumbnailUrl', formData.thumbnailUrl);
      if (selectedFile) {
        data.append('audioFile', selectedFile);
      }
      
      await api.post('/admin/songs', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatusMessage({ type: 'success', text: 'Song added successfully!' });
      setTimeout(() => setStatusMessage(null), 3000);
      setFormData({ title: '', artist: 'NLM Cieko', genre: 'gospel', audioUrl: '', thumbnailUrl: '', lyrics: '' });
      setSelectedFile(null);
      setShowAddForm(false);
      fetchSongs();
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error adding song' });
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (songId) => {
    try {
      await api.delete(`/admin/songs/${songId}`);
      fetchSongs();
      setStatusMessage({ type: 'success', text: 'Song deleted!' });
      setDeletingId(null);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error deleting song' });
      setDeletingId(null);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Handle edit song
  const handleEdit = (song) => {
    setSelectedSong(song);
    setFormData({
      title: song.title,
      artist: song.artist,
      genre: song.genre,
      audioUrl: song.audio_url,
      thumbnailUrl: song.thumbnail_url || '',
      lyrics: song.lyrics || ''
    });
    setShowAddForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSong) return;
    setSaving(true);
    
    try {
      let data;
      const options = {};

      if (selectedFile) {
        // Use FormData if there is a new file to upload
        data = new FormData();
        data.append('title', formData.title);
        data.append('artist', formData.artist);
        data.append('genre', formData.genre);
        data.append('lyrics', formData.lyrics);
        data.append('audioUrl', formData.audioUrl);
        data.append('thumbnailUrl', formData.thumbnailUrl);
        data.append('audioFile', selectedFile);
        options.headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        // Use regular JSON if only metadata is being updated
        data = {
          title: formData.title,
          artist: formData.artist,
          genre: formData.genre,
          lyrics: formData.lyrics,
          audioUrl: formData.audioUrl,
          thumbnailUrl: formData.thumbnailUrl
        };
      }
      
      await api.put(`/admin/songs/${selectedSong.id}`, data, options);
      setStatusMessage({ type: 'success', text: 'Song updated successfully!' });
      setTimeout(() => setStatusMessage(null), 3000);
      setFormData({ title: '', artist: 'NLM Cieko', genre: 'gospel', audioUrl: '', thumbnailUrl: '', lyrics: '' });
      setSelectedFile(null);
      setSelectedSong(null);
      setShowAddForm(false);
      fetchSongs();
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Error updating song' });
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Cancel form
  const cancelForm = () => {
    setFormData({ title: '', artist: 'NLM Cieko', genre: 'gospel', audioUrl: '', thumbnailUrl: '', lyrics: '' });
    setSelectedFile(null);
    setSelectedSong(null);
    setShowAddForm(false);
  };

  const handlePromote = async (userId, isServant) => {
    try {
      await api.post('/admin/users/promote', { userId, isServant });
      fetchData();
      setStatusMessage({ type: 'success', text: `User ${isServant ? 'promoted' : 'demoted'} successfully` });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Error updating user status' });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handlePageSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/servant-pages', pageFormData);
      setStatusMessage({ type: 'success', text: 'Page created successfully' });
      setPageFormData({ title: '', content: '' });
      setShowPageForm(false);
      fetchData();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Error creating page' });
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleAssignPage = async (userId, pageId) => {
    try {
      await api.post('/admin/users/assign-page', { userId, pageId: parseInt(pageId) || null });
      fetchData();
      setStatusMessage({ type: 'success', text: 'Page assigned successfully' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Error assigning page' });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleResetPage = async (userId) => {
    showToast(
      "Confirm reset for this servant page?", 
      6000, 
      async () => {
        try {
          await api.post('/admin/users/reset-page', { userId });
          fetchData();
          showToast('Page reset successfully');
        } catch (err) {
          console.error(err);
          showToast('Error resetting page');
        }
      },
      "CONFIRM RESET"
    );
  };

  const genreColors = {
    gospel: '#6366f1',
    trap: '#ec4899',
    reggae: '#22c55e',
    worship: '#f59e0b'
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        {!isAdmin ? (
          <div className="access-denied-page">
            {/* Animated Background */}
            <div className="access-denied-bg">
              <div className="access-denied-gradient"></div>
              <div className="gradient-sphere"></div>
              <div className="gradient-sphere secondary"></div>
            </div>
            
            {/* Main Content */}
            <div className="access-denied-content">
              {/* Lock Icon */}
              <div className="denied-icon-container">
                <div className="denied-icon">
                  <i className="fas fa-lock"></i>
                </div>
              </div>
              
              {/* Title */}
              <h1 className="denied-title">ACCESS DENIED</h1>
              
              {/* Warning Badge */}
              <div className="denied-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <span>UNAUTHORIZED ACCESS ATTEMPT DETECTED</span>
              </div>
              
              {/* Message */}
              <p className="denied-message">
                You do not have permission to access this restricted area. 
                This incident has been logged for security purposes.
              </p>
              
              {/* Security Details */}
              <div className="denied-details">
                <div className="denied-detail-item">
                  <div className="detail-icon-wrapper">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Security Level</span>
                    <span className="detail-value">ADMIN ONLY</span>
                  </div>
                </div>
                <div className="denied-detail-item">
                  <div className="detail-icon-wrapper">
                    <i className="fas fa-user-lock"></i>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Required Role</span>
                    <span className="detail-value">Administrator</span>
                  </div>
                </div>
                <div className="denied-detail-item">
                  <div className="detail-icon-wrapper">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Attempt Logged</span>
                    <span className="detail-value">{new Date().toLocaleString()}</span>
                  </div>
                </div>
                <div className="denied-detail-item">
                  <div className="detail-icon-wrapper">
                    <i className="fas fa-network-wired"></i>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">IP Address</span>
                    <span className="detail-value">Logged</span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="denied-actions">
                <a href="/" className="denied-btn denied-btn-primary">
                  <i className="fas fa-home"></i>
                  <span>Return to Home</span>
                </a>
                <a href="/login" className="denied-btn denied-btn-secondary">
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Login with Admin Account</span>
                </a>
              </div>
              
              {/* Footer */}
              <div className="denied-footer">
                <p>If you believe this is an error, please contact the system administrator.</p>
                <div className="denied-security-badge">
                  <div className="badge-icon">
                    <i className="fas fa-fingerprint"></i>
                  </div>
                  <div className="badge-content">
                    <span className="badge-title">NLM Cieko Security System</span>
                    <span className="badge-subtitle">Protected by Advanced Security</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="admin-mobile-nav">
              <button className="mobile-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                <i className={`fas ${isSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
              <div className="mobile-brand">Admin Panel</div>
            </div>

            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
              <h2>Admin Panel</h2>
              <nav>
                <button 
                  className={activeTab === 'analytics' ? 'active' : ''} 
                  onClick={() => { navigate('/admin/analytics'); setIsSidebarOpen(false); }}
                >
                  <i className="fas fa-chart-line"></i> Analytics
                </button>
                <button 
                  className={activeTab === 'orders' ? 'active' : ''} 
                  onClick={() => { navigate('/admin/orders'); setIsSidebarOpen(false); }}
                >
                  <i className="fas fa-shopping-cart"></i> Orders
                </button>
                <button 
                  className={activeTab === 'beliefs' ? 'active' : ''} 
                  onClick={() => { navigate('/admin/beliefs'); setIsSidebarOpen(false); }}
                >
                  <i className="fas fa-pray"></i> Belief Data
                </button>
                <button 
                  className={activeTab === 'songs' ? 'active' : ''} 
                  onClick={() => { navigate('/admin/songs'); setIsSidebarOpen(false); }}
                >
                  <i className="fas fa-music"></i> Manage Songs
                </button>
                <button 
                  className={activeTab === 'users' ? 'active' : ''} 
                  onClick={() => { navigate('/admin/users'); setIsSidebarOpen(false); }}
                >
                  <i className="fas fa-users-cog"></i> Users
                </button>
                <button 
                  className={activeTab === 'servant-pages' ? 'active' : ''} 
                  onClick={() => { navigate('/admin/servant-pages'); setIsSidebarOpen(false); }}
                >
                  <i className="fas fa-file-alt"></i> Servant Pages
                </button>
                <button 
                  className={activeTab === 'contacts' ? 'active' : ''} 
                  onClick={() => { navigate('/admin/contacts'); setIsSidebarOpen(false); }}
                >
                  <i className="fas fa-envelope"></i> Contacts
                </button>
                <div className="sidebar-divider"></div>
                <button className="back-site-btn" onClick={() => navigate('/')}>
                  <i className="fas fa-arrow-left"></i> Main Site
                </button>
              </nav>
            </aside>

            <main className="admin-main-content">
              {statusMessage && (
                <div className={`admin-status-message ${statusMessage.type}`}>
                  {statusMessage.text}
                </div>
              )}
              {loading ? (
                <PremiumLoader message="Harmonizing spiritual data..." />
              ) : (
                <>
                  {/* SONGS TAB */}
                  {activeTab === 'songs' && (
                    <div className="songs-manager section-fade-in">
                      <header className="section-header">
                        <div className="header-text">
                          <h1>Music Library</h1>
                          <p>Manage and curate spiritual melodies</p>
                        </div>
                        <button className="add-btn-premium" onClick={() => setShowAddForm(true)}>
                          <i className="fas fa-plus"></i> Add New Song
                        </button>
                      </header>

                      {/* Add/Edit Form */}
                      {showAddForm && (
                        <div className="song-form-container glass-card">
                          <div className="form-header-premium">
                             <h2><i className={`fas ${selectedSong ? 'fa-edit' : 'fa-plus-circle'}`}></i> {selectedSong ? 'Edit Masterpiece' : 'New Creation'}</h2>
                             <button className="close-form-btn" onClick={cancelForm}><i className="fas fa-times"></i></button>
                          </div>
                          <form onSubmit={selectedSong ? handleUpdate : handleSubmit} className="premium-form">
                            <div className="form-grid-premium">
                              <div className="form-group-premium">
                                <label><i className="fas fa-heading"></i> Title</label>
                                <input 
                                  type="text" 
                                  value={formData.title}
                                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                                  required
                                  placeholder="What is the name of this melody?"
                                />
                              </div>
                              <div className="form-group-premium">
                                <label><i className="fas fa-user-tie"></i> Artist</label>
                                <input 
                                  type="text" 
                                  value={formData.artist}
                                  onChange={(e) => setFormData({...formData, artist: e.target.value})}
                                  placeholder="Who is the vessel?"
                                />
                              </div>
                              <div className="form-group-premium">
                                <label><i className="fas fa-tags"></i> Genre</label>
                                <select 
                                  value={formData.genre}
                                  onChange={(e) => setFormData({...formData, genre: e.target.value})}
                                >
                                  <option value="gospel">Gospel</option>
                                  <option value="trap">Trap / HipHop</option>
                                  <option value="reggae">Reggae / Rasta</option>
                                  <option value="worship">Worship</option>
                                </select>
                              </div>
                              <div className="form-group-premium">
                                <label><i className="fas fa-file-audio"></i> Audio Source</label>
                                <div className="file-upload-custom">
                                   <input 
                                     type="file" 
                                     id="audio-upload"
                                     accept=".mp3,.wav,.ogg,.m4a,.aac"
                                     onChange={(e) => {
                                       const file = e.target.files[0];
                                       setSelectedFile(file);
                                       if (file) setFormData({...formData, audioUrl: file.name});
                                     }}
                                   />
                                   <label htmlFor="audio-upload" className="upload-btn">
                                      <i className="fas fa-cloud-upload-alt"></i> {selectedFile ? selectedFile.name : (selectedSong ? 'Change Audio File' : 'Upload Audio')}
                                   </label>
                                </div>
                              </div>
                            </div>
                            
                            <div className="form-group-premium full-width">
                              <label><i className="fas fa-image"></i> Thumbnail URL</label>
                              <input 
                                type="text" 
                                value={formData.thumbnailUrl}
                                onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
                                placeholder="https://example.com/cover-art.jpg"
                              />
                            </div>

                            <div className="form-group-premium full-width">
                              <label><i className="fas fa-align-left"></i> Lyrics / Message</label>
                              <textarea 
                                value={formData.lyrics}
                                onChange={(e) => setFormData({...formData, lyrics: e.target.value})}
                                placeholder="Let the words flow here..."
                                rows="6"
                              ></textarea>
                            </div>

                            <div className="form-actions-premium">
                              <button type="button" className="btn-secondary-premium" onClick={cancelForm}>Dismiss</button>
                              <button type="submit" className="btn-primary-premium" disabled={saving}>
                                {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : (selectedSong ? 'Update Melody' : 'Publish Song')}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Songs List */}
                      <div className="songs-list-modern">
                        {songs.length > 0 ? (
                          <div className="song-cards-grid">
                            {songs.map(song => (
                              <div key={song.id} className="admin-song-card glass-card">
                                <div className="song-card-artwork">
                                  {song.thumbnail_url ? <img src={song.thumbnail_url} alt="" /> : <div className="artwork-placeholder"><i className="fas fa-music"></i></div>}
                                  <div className="song-card-overlay">
                                     <button className="play-btn-mini"><i className="fas fa-play"></i></button>
                                  </div>
                                </div>
                                <div className="song-card-info">
                                  <span className="song-genre-badge" style={{ background: genreColors[song.genre] }}>{song.genre}</span>
                                  <h3>{song.title}</h3>
                                  <p>{song.artist}</p>
                                  <div className="song-card-footer">
                                    <div className="song-meta-icons">
                                      {song.lyrics && <i className="fas fa-quote-right" title="Has Lyrics"></i>}
                                      <i className="fas fa-clock"></i>
                                    </div>
                                    <div className="song-actions-premium">
                                      <button className="action-btn edit" onClick={() => handleEdit(song)}><i className="fas fa-pen"></i></button>
                                      {deletingId === song.id ? (
                                        <div className="confirm-bubble">
                                          <button className="confirm-check" onClick={() => handleDelete(song.id)}><i className="fas fa-check"></i></button>
                                          <button className="confirm-cancel" onClick={() => setDeletingId(null)}><i className="fas fa-times"></i></button>
                                        </div>
                                      ) : (
                                        <button className="action-btn delete" onClick={() => setDeletingId(song.id)}><i className="fas fa-trash"></i></button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="no-items-placeholder glass-card">
                            <i className="fas fa-music-slash"></i>
                            <p>The library is quiet. Start by adding a spiritual melody.</p>
                            <button className="add-btn-premium" onClick={() => setShowAddForm(true)}>Add Your First Song</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ANALYTICS TAB */}
                  {activeTab === 'analytics' && analytics && (
                    <div className="analytics-view section-fade-in">
                      <header className="section-header">
                        <div className="header-text">
                          <h1>System Analytics</h1>
                          <p>Monitor platform growth and user engagement</p>
                        </div>
                        <div className="header-icon-glow">
                          <i className="fas fa-chart-line"></i>
                        </div>
                      </header>

                      <div className="stats-grid">
                        <div className="stat-card premium-card">
                          <div className="stat-icon-box orders-glow">
                             <i className="fas fa-shopping-bag"></i>
                          </div>
                          <div className="stat-content">
                            <h3>Total Orders</h3>
                            <p>{analytics.totalOrders}</p>
                            <span className="stat-trend positive"><i className="fas fa-arrow-up"></i> 12% increase</span>
                          </div>
                        </div>

                        <div className="stat-card premium-card">
                          <div className="stat-icon-box songs-glow">
                             <i className="fas fa-music"></i>
                          </div>
                          <div className="stat-content">
                            <h3>Total Songs</h3>
                            <p>{analytics.totalSongs || 0}</p>
                            <span className="stat-trend"><i className="fas fa-compact-disc"></i> Full Library</span>
                          </div>
                        </div>

                        <div className="stat-card premium-card">
                          <div className="stat-icon-box belief-glow">
                             <i className="fas fa-pray"></i>
                          </div>
                          <div className="stat-content">
                            <h3>Avg Bible Belief</h3>
                            <p>{parseFloat(analytics.averageBelief).toFixed(1)}%</p>
                            <span className="stat-trend neutral">Spiritual Maturity</span>
                          </div>
                        </div>
                      </div>

                      <div className="chart-mockup glass-card">
                        <div className="card-header-flex">
                          <h3><i className="fas fa-project-diagram"></i> Belief Distribution</h3>
                          <span className="tag-pill">User Insights</span>
                        </div>
                        <div className="chart-container">
                          {analytics.beliefDistribution.map(item => (
                            <div key={item.range} className="chart-row-modern">
                              <span className="range-label">{item.range}</span>
                              <div className="progress-bar-wrapper">
                                <div className="bar-bg-modern">
                                  <div className="bar-fill-modern" style={{width: `${(item.count / 10) * 100}%`}}>
                                    <div className="bar-glow"></div>
                                  </div>
                                </div>
                              </div>
                              <span className="count-label">{item.count} users</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ORDERS TAB */}
                  {activeTab === 'orders' && (
                    <div className="orders-view section-fade-in">
                      <header className="section-header">
                        <div className="header-text">
                          <h1>Customer Orders</h1>
                          <p>Track and fulfill spiritual resource requests</p>
                        </div>
                        <div className="header-icon-glow">
                          <i className="fas fa-shopping-cart"></i>
                        </div>
                      </header>

                      <div className="table-view-premium glass-card">
                        <table className="premium-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Recipient</th>
                              <th>Resource</th>
                              <th>Contact</th>
                              <th>Status</th>
                              <th>Timeline</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.map(order => (
                              <tr key={order.id}>
                                <td><span className="order-number">#{order.id}</span></td>
                                <td className="user-identity-cell">
                                   <div className="user-avatar-mini">{order.full_name?.charAt(0)}</div>
                                   <span className="user-name-bold">{order.full_name}</span>
                                </td>
                                <td><span className="book-title-tag">{order.book_title}</span></td>
                                <td><span className="phone-link"><i className="fas fa-phone-alt"></i> {order.phone}</span></td>
                                <td><span className={`premium-status-badge ${order.status}`}>{order.status}</span></td>
                                <td><span className="date-dim">{new Date(order.created_at).toLocaleDateString()}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* BELIEFS TAB */}
                  {activeTab === 'beliefs' && (
                    <div className="beliefs-view section-fade-in">
                      <header className="section-header">
                        <div className="header-text">
                          <h1>Belief Submissions</h1>
                          <p>Analyze spiritual maturity levels across the community</p>
                        </div>
                        <div className="header-icon-glow">
                          <i className="fas fa-pray"></i>
                        </div>
                      </header>

                      <div className="table-view-premium glass-card">
                        <table className="premium-table">
                          <thead>
                            <tr>
                              <th>Soul</th>
                              <th>Email Identity</th>
                              <th>Maturity Level</th>
                              <th>Submission Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {beliefs.map(b => (
                              <tr key={b.id}>
                                <td className="user-identity-cell">
                                   <div className="user-avatar-mini">{b.full_name?.charAt(0) || 'A'}</div>
                                   <span className="user-name-bold">{b.full_name || 'Anonymous'}</span>
                                </td>
                                <td><span className="user-email-dim">{b.email}</span></td>
                                <td>
                                   <div className="maturity-meter">
                                      <div className="maturity-fill" style={{ width: `${b.percentage}%` }}></div>
                                      <span className="maturity-text">{b.percentage}%</span>
                                   </div>
                                </td>
                                <td><span className="date-dim">{new Date(b.created_at).toLocaleString()}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* USERS TAB */}
                  {activeTab === 'users' && (
                    <div className="users-manager section-fade-in">
                      <header className="section-header">
                        <div className="header-text">
                          <h1>User Management</h1>
                          <p>Assign roles and manage ministry access</p>
                        </div>
                        <div className="header-icon-glow">
                          <i className="fas fa-users-cog"></i>
                        </div>
                      </header>

                      <div className="table-view-premium glass-card">
                        <table className="premium-table">
                          <thead>
                            <tr>
                              <th>Identity</th>
                              <th>Role & Access</th>
                              <th>Assigned Webpage</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map(u => (
                              <tr key={u.id}>
                                <td className="user-identity-cell">
                                  <div className="user-avatar-mini">
                                    {u.full_name?.charAt(0)}
                                  </div>
                                  <div className="user-info-text">
                                    <span className="user-name-bold">{u.full_name}</span>
                                    <span className="user-email-dim">{u.email}</span>
                                  </div>
                                </td>
                                <td>
                                  <div className="role-badge-container">
                                    {u.is_admin ? <span className="premium-badge admin">Administrator</span> : (
                                      u.is_servant ? <span className="premium-badge servant">Ministry Servant</span> : <span className="premium-badge user">Regular User</span>
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <div className="assign-page-wrapper">
                                    <select 
                                      className="premium-select-sm"
                                      value={u.assigned_page_id || ''} 
                                      onChange={(e) => handleAssignPage(u.id, e.target.value)}
                                      disabled={!u.is_servant}
                                    >
                                      <option value="">No Page Assigned</option>
                                      {servantPages.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                      ))}
                                    </select>
                                  </div>
                                </td>
                                <td>
                                  <div className="premium-action-group">
                                    {!u.is_admin && (
                                      <button 
                                        className={`btn-action-premium ${u.is_servant ? 'demote' : 'promote'}`}
                                        onClick={() => handlePromote(u.id, !u.is_servant)}
                                        title={u.is_servant ? 'Demote to User' : 'Promote to Servant'}
                                      >
                                        <i className={`fas ${u.is_servant ? 'fa-user-minus' : 'fa-user-plus'}`}></i>
                                      </button>
                                    )}
                                    {u.is_servant && (
                                      <button 
                                        className="btn-action-premium reset"
                                        onClick={() => handleResetPage(u.id)}
                                        title="Reset Servant Page"
                                      >
                                        <i className="fas fa-undo"></i>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* SERVANT PAGES TAB */}
                  {activeTab === 'servant-pages' && (
                    <div className="servant-pages-manager section-fade-in">
                      <header className="section-header">
                        <div className="header-text">
                          <h1>Ministry Webpages</h1>
                          <p>Templates and pre-configured gospel layouts</p>
                        </div>
                        <button className="add-btn-premium" onClick={() => setShowPageForm(true)}>
                          <i className="fas fa-file-medical"></i> Create Template
                        </button>
                      </header>

                      {showPageForm && (
                        <div className="song-form-container glass-card">
                          <div className="form-header-premium">
                             <h2><i className="fas fa-magic"></i> New Webpage Template</h2>
                             <button className="close-form-btn" onClick={() => setShowPageForm(false)}><i className="fas fa-times"></i></button>
                          </div>
                          <form onSubmit={handlePageSubmit} className="premium-form">
                            <div className="form-group-premium full-width">
                              <label><i className="fas fa-pen-nib"></i> Template Title</label>
                              <input 
                                type="text" 
                                value={pageFormData.title} 
                                onChange={(e) => setPageFormData({...pageFormData, title: e.target.value})}
                                required
                                placeholder="e.g. Youth Ministry Layout"
                              />
                            </div>
                            <div className="form-group-premium full-width">
                              <label><i className="fas fa-code"></i> Content Blueprint (HTML/Markdown)</label>
                              <textarea 
                                value={pageFormData.content}
                                onChange={(e) => setPageFormData({...pageFormData, content: e.target.value})}
                                required
                                placeholder="Structure the spiritual message here..."
                                rows="12"
                              ></textarea>
                            </div>
                            <div className="form-actions-premium">
                              <button type="button" className="btn-secondary-premium" onClick={() => setShowPageForm(false)}>Discard</button>
                              <button type="submit" className="btn-primary-premium" disabled={saving}>
                                {saving ? <><i className="fas fa-spinner fa-spin"></i> Creating...</> : 'Launch Template'}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      <div className="servant-pages-grid">
                        {servantPages.map(p => (
                          <div key={p.id} className="page-template-card glass-card">
                             <div className="template-visual">
                                <i className="fas fa-file-alt"></i>
                                <span className="template-id">#{p.id}</span>
                             </div>
                             <div className="template-info">
                                <h3>{p.title}</h3>
                                <p><i className="fas fa-calendar-alt"></i> Created {new Date(p.created_at).toLocaleDateString()}</p>
                                <div className="template-footer">
                                   <span className="usage-tag">System Template</span>
                                   <button className="preview-link-btn">Preview <i className="fas fa-external-link-alt"></i></button>
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'contacts' && (
                    <div className="contacts-view section-fade-in">
                      <header className="section-header">
                        <div className="header-text">
                          <h1>Contact Messages</h1>
                          <p>Respond to general inquiries and community feedback</p>
                        </div>
                        <div className="header-icon-glow">
                          <i className="fas fa-envelope"></i>
                        </div>
                      </header>

                      <div className="table-view-premium glass-card">
                        <table className="premium-table">
                          <thead>
                            <tr>
                              <th>Sender</th>
                              <th>Subject & Content</th>
                              <th>Timeline</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contacts.map(c => (
                              <tr key={c.id}>
                                <td className="user-identity-cell">
                                   <div className="user-avatar-mini">{c.name?.charAt(0)}</div>
                                   <div className="user-info-text">
                                      <span className="user-name-bold">{c.name}</span>
                                      <span className="user-email-dim">{c.email}</span>
                                   </div>
                                </td>
                                <td>
                                   <div className="subject-line"><strong>{c.subject}</strong></div>
                                   <div className="content-preview">{c.message?.substring(0, 60)}...</div>
                                </td>
                                <td><span className="date-dim">{new Date(c.created_at).toLocaleDateString()}</span></td>
                                <td>
                                   <button className="btn-action-premium promote" title="View & Reply"><i className="fas fa-reply"></i></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminPage;
