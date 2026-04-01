import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import './AdminPage.css';

function AdminPage() {
  const [activeTab, setActiveTab] = useState('analytics');
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
            <aside className="admin-sidebar">
              <h2>Admin Panel</h2>
              <nav>
                <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>Analytics</button>
                <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>Orders</button>
                <button className={activeTab === 'beliefs' ? 'active' : ''} onClick={() => setActiveTab('beliefs')}>Belief Data</button>
                <button className={activeTab === 'songs' ? 'active' : ''} onClick={() => setActiveTab('songs')}>Manage Songs</button>
                <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>Users</button>
                <button className={activeTab === 'servant-pages' ? 'active' : ''} onClick={() => setActiveTab('servant-pages')}>Servant Pages</button>
                <button className={activeTab === 'contacts' ? 'active' : ''} onClick={() => setActiveTab('contacts')}>Contacts</button>
              </nav>
            </aside>

            <main className="admin-content">
              {statusMessage && (
                <div className={`admin-status-message ${statusMessage.type}`}>
                  {statusMessage.text}
                </div>
              )}
              {loading ? (
                <div className="loader">Loading...</div>
              ) : (
                <>
                  {/* SONGS TAB */}
                  {activeTab === 'songs' && (
                    <div className="songs-manager">
                      <div className="songs-header">
                        <h1>Manage Songs</h1>
                        <button className="add-song-btn" onClick={() => setShowAddForm(true)}>+ Add Song</button>
                      </div>

                      {/* Add/Edit Form */}
                      {showAddForm && (
                        <div className="song-form-container">
                          <h2>{selectedSong ? 'Edit Song' : 'Add New Song'}</h2>
                          <form onSubmit={selectedSong ? handleUpdate : handleSubmit}>
                            <div className="form-row">
                              <div className="form-group">
                                <label>Title *</label>
                                <input 
                                  type="text" 
                                  value={formData.title}
                                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                                  required
                                  placeholder="Song title"
                                />
                              </div>
                              <div className="form-group">
                                <label>Artist</label>
                                <input 
                                  type="text" 
                                  value={formData.artist}
                                  onChange={(e) => setFormData({...formData, artist: e.target.value})}
                                  placeholder="Artist name"
                                />
                              </div>
                            </div>
                            <div className="form-row">
                              <div className="form-group">
                                <label>Genre *</label>
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
                              <div className="form-group">
                                <label>Audio File (mp3, wav, ogg)</label>
                                {selectedSong && !selectedFile && (
                                  <p className="current-file-text">Currently: {formData.audioUrl.split('/').pop()}</p>
                                )}
                                <input 
                                  type="file" 
                                  accept=".mp3,.wav,.ogg,.m4a,.aac"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    setSelectedFile(file);
                                    if (file) {
                                      setFormData({...formData, audioUrl: file.name});
                                    }
                                  }}
                                  className="file-input"
                                />
                                <p className="small-text">Or enter a URL/path below</p>
                              </div>
                            </div>
                            <div className="form-group">
                              <label>Thumbnail URL or Path (Image URL for the song)</label>
                              <input 
                                type="text" 
                                value={formData.thumbnailUrl}
                                onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})}
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                            <div className="form-group">
                              <label>Audio URL or Path (if not uploading file)</label>
                              <input 
                                type="text" 
                                value={formData.audioUrl}
                                onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}
                                placeholder="https://example.com/song.mp3"
                                disabled={!!selectedFile}
                              />
                            </div>
                            <div className="form-group">
                              <label>Lyrics</label>
                              <textarea 
                                value={formData.lyrics}
                                onChange={(e) => setFormData({...formData, lyrics: e.target.value})}
                                placeholder="Enter song lyrics here..."
                                rows="8"
                              ></textarea>
                            </div>
                            <div className="form-actions">
                              <button type="button" className="cancel-btn" onClick={cancelForm}>Cancel</button>
                              <button type="submit" className="save-btn" disabled={saving}>
                                {saving ? 'Saving...' : (selectedSong ? 'Update Song' : 'Add Song')}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Songs List */}
                      <div className="songs-list">
                        {songs.length > 0 ? (
                          <table>
                            <thead>
                              <tr>
                                <th>Title</th>
                                <th>Artist</th>
                                <th>Genre</th>
                                <th>Lyrics</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {songs.map(song => (
                                <tr key={song.id}>
                                  <td className="song-title-cell">{song.title}</td>
                                  <td>{song.artist}</td>
                                  <td>
                                    <span className="genre-tag" style={{ background: genreColors[song.genre] }}>
                                      {song.genre}
                                    </span>
                                  </td>
                                  <td>{song.lyrics ? <i className="fas fa-check"></i> : <i className="fas fa-minus"></i>}</td>
                                  <td>
                                    <div className="action-btns">
                                      <button className="edit-btn" onClick={() => handleEdit(song)}>Edit</button>
                                      {deletingId === song.id ? (
                                        <div className="confirm-delete">
                                          <button className="confirm-btn" onClick={() => handleDelete(song.id)}>Confirm?</button>
                                          <button className="cancel-btn-sm" onClick={() => setDeletingId(null)}>X</button>
                                        </div>
                                      ) : (
                                        <button className="delete-btn" onClick={() => setDeletingId(song.id)}>Delete</button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="no-songs-msg">
                            <p>No songs added yet. Click "Add Song" to get started.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ANALYTICS TAB */}
                  {activeTab === 'analytics' && analytics && (
                    <div className="analytics-view">
                      <h1>System Analytics</h1>
                      <div className="stats-grid">
                        <div className="stat-card">
                          <h3>Total Orders</h3>
                          <p>{analytics.totalOrders}</p>
                        </div>
                        <div className="stat-card">
                          <h3>Total Songs</h3>
                          <p>{analytics.totalSongs || 0}</p>
                        </div>
                        <div className="stat-card">
                          <h3>Avg Bible Belief</h3>
                          <p>{parseFloat(analytics.averageBelief).toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="chart-mockup">
                        <h3>Belief Distribution</h3>
                        {analytics.beliefDistribution.map(item => (
                          <div key={item.range} className="chart-row">
                            <span>{item.range}</span>
                            <div className="bar-bg">
                              <div className="bar-fill" style={{width: `${(item.count / 10) * 100}%`}}></div>
                            </div>
                            <span>{item.count} users</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div className="table-view">
                      <h1>Customer Orders</h1>
                      <table>
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Book</th>
                            <th>Phone</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order.id}>
                              <td>#{order.id}</td>
                              <td>{order.full_name}</td>
                              <td>{order.book_title}</td>
                              <td>{order.phone}</td>
                              <td><span className={`status-pill ${order.status}`}>{order.status}</span></td>
                              <td>{new Date(order.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === 'beliefs' && (
                    <div className="table-view">
                      <h1>Belief Submissions</h1>
                      <table>
                        <thead>
                          <tr>
                            <th>User</th>
                            <th>Email</th>
                            <th>Percentage</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {beliefs.map(b => (
                            <tr key={b.id}>
                              <td>{b.full_name || 'Anonymous'}</td>
                              <td>{b.email}</td>
                              <td><strong>{b.percentage}%</strong></td>
                              <td>{new Date(b.created_at).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === 'users' && (
                    <div className="users-manager">
                      <div className="songs-header">
                        <h1>User Management</h1>
                      </div>
                      <div className="table-view">
                        <table>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Role</th>
                              <th>Assigned Page</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map(u => (
                              <tr key={u.id}>
                                <td>{u.full_name}</td>
                                <td>{u.email}</td>
                                <td>
                                  {u.is_admin ? <span className="status-pill completed">Admin</span> : (
                                    u.is_servant ? <span className="status-pill in_progress">Servant</span> : <span className="status-pill pending">User</span>
                                  )}
                                </td>
                                <td>
                                  <select 
                                    value={u.assigned_page_id || ''} 
                                    onChange={(e) => handleAssignPage(u.id, e.target.value)}
                                    disabled={!u.is_servant}
                                    style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)', padding: '4px' }}
                                  >
                                    <option value="">No Page</option>
                                    {servantPages.map(p => (
                                      <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  {!u.is_admin && (
                                    <button 
                                      className={u.is_servant ? "delete-btn" : "add-song-btn"}
                                      onClick={() => handlePromote(u.id, !u.is_servant)}
                                      style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                                    >
                                      {u.is_servant ? 'Demote' : 'Promote to Servant'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'servant-pages' && (
                    <div className="servant-pages-manager">
                      <div className="songs-header">
                        <h1>Servant Webpages</h1>
                        <button className="add-song-btn" onClick={() => setShowPageForm(true)}>+ Create Page</button>
                      </div>

                      {showPageForm && (
                        <div className="song-form-container">
                          <h2>Create New Webpage</h2>
                          <form onSubmit={handlePageSubmit}>
                            <div className="form-group">
                              <label>Page Title</label>
                              <input 
                                type="text" 
                                value={pageFormData.title}
                                onChange={(e) => setPageFormData({...pageFormData, title: e.target.value})}
                                required
                                placeholder="e.g. Gospel Outreach"
                              />
                            </div>
                            <div className="form-group">
                              <label>Initial Content (Markdown/HTML supported)</label>
                              <textarea 
                                value={pageFormData.content}
                                onChange={(e) => setPageFormData({...pageFormData, content: e.target.value})}
                                required
                                placeholder="Enter page content here..."
                                rows="10"
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--glass-border)', padding: '10px' }}
                              ></textarea>
                            </div>
                            <div className="form-actions">
                              <button type="button" className="cancel-btn" onClick={() => setShowPageForm(false)}>Cancel</button>
                              <button type="submit" className="save-btn" disabled={saving}>
                                {saving ? 'Creating...' : 'Create Page'}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}

                      <div className="table-view">
                        <table>
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Title</th>
                              <th>Created At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {servantPages.map(p => (
                              <tr key={p.id}>
                                <td>#{p.id}</td>
                                <td>{p.title}</td>
                                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'contacts' && (
                    <div className="table-view">
                      <h1>Contact Messages</h1>
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Subject</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contacts.map(c => (
                            <tr key={c.id}>
                              <td>{c.name}</td>
                              <td>{c.email}</td>
                              <td>{c.subject}</td>
                              <td>{new Date(c.created_at).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
