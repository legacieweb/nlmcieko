import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useMusic } from '../context/MusicContext';
import { SERVER_URL } from '../services/api';
import MusicPreloader from '../components/MusicPreloader';
import './MusicPage.css';

// Genre definitions - vibrant modern colors
const genres = [
  { id: 'all', name: 'All Music', color: '#6366f1', icon: 'fas fa-music' },
  { id: 'gospel', name: 'Gospel', color: '#4f46e5', icon: 'fas fa-hands-praying' },
  { id: 'trap', name: 'Trap', color: '#818cf8', icon: 'fas fa-fire' },
  { id: 'reggae', name: 'Reggae', color: '#10b981', icon: 'fas fa-guitar' },
  { id: 'worship', name: 'Worship', color: '#f59e0b', icon: 'fas fa-star' }
];

function MusicPage() {
  const navigate = useNavigate();
  const { 
    allSongs, 
    playingSong, 
    isPlaying, 
    playSong, 
    togglePlay, 
    handleNext, 
    handlePrev,
    activeGenre,
    setActiveGenre,
    libraryView,
    setLibraryView,
    currentTime,
    duration,
    progress,
    volume,
    setVolume,
    showToast,
    nextSongPopup,
    cancelNextSong
  } = useMusic();

  const [pageLoading, setPageLoading] = useState(allSongs.length === 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPlayer, setShowPlayer] = useState(false);
  
  useEffect(() => {
    if (nextSongPopup.visible && nextSongPopup.countdown === 0 && nextSongPopup.song) {
      navigate(`/music/${nextSongPopup.song.id}`);
    }
  }, [nextSongPopup.visible, nextSongPopup.countdown, nextSongPopup.song, navigate]);

  useEffect(() => {
    if (allSongs.length > 0) {
      setPageLoading(false);
    }
  }, [allSongs]);

  useEffect(() => {
    if (playingSong) {
      setShowPlayer(true);
    }
  }, [playingSong]);

  // Filter songs by genre, library view and search query
  const filteredSongs = useMemo(() => {
    let filtered = [...allSongs];

    // Library View logic
    if (libraryView === 'recently-added') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (libraryView === 'artists') {
      filtered.sort((a, b) => a.artist.localeCompare(b.artist));
    } else if (libraryView === 'albums') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (libraryView === 'songs') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (activeGenre !== 'all') {
      filtered = filtered.filter(song => song.genre === activeGenre);
    }
    if (searchQuery) {
      filtered = filtered.filter(song => 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [activeGenre, libraryView, searchQuery, allSongs]);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const audio = document.querySelector('audio'); // Accessing global audio via ref in context would be better but this works for now if we don't want to expose ref too much
    if (duration && audio) audio.currentTime = percent * duration;
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const handleDownload = async (e, song) => {
    e.stopPropagation();
    let audioUrl = song.audio_url;
    if (audioUrl && !audioUrl.startsWith('http')) {
      audioUrl = SERVER_URL+audioUrl;
    }
    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${song.title}.mp3`;
      a.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleShare = (e, song) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/#/music/${song.id}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Link copied!');
  };

  if (pageLoading) return <MusicPreloader />;

  return (
    <div className="modern-music-container">
      <Helmet>
        <title>Gospel Music | NLM Cieko</title>
        <meta name="description" content="Listen to and download spiritual gospel music, worship songs, and inspirational tracks from NLM Cieko." />
        <meta property="og:title" content="Grace Church Music Library" />
        <meta property="og:description" content="Explore our collection of gospel, worship, and spiritual music designed to uplift your soul and strengthen your faith." />
      </Helmet>
      <div className="vibrant-bg"></div>
      <div className="glass-overlay"></div>
      
      <div className="app-layout">
        {/* Main Content */}
        <main className="main-viewport">
          <header className="viewport-header">
            <div className="header-info">
              <h1>{activeGenre === 'all' ? 'Featured Music' : genres.find(g => g.id === activeGenre)?.name}</h1>
              <span className="track-count">{filteredSongs.length} Tracks Available</span>
            </div>
            
            <div className="modern-search">
              <span className="search-icon"><i className="fas fa-search"></i></span>
              <input 
                type="text" 
                placeholder="Search artists, songs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </header>

          <div className="genre-navigation-bar">
             <div className="genre-pills horizontal-scroll">
              {genres.map(g => (
                <button 
                  key={g.id} 
                  className={`genre-pill ${activeGenre === g.id ? 'active' : ''}`}
                  onClick={() => {setActiveGenre(g.id); setSearchQuery('');}}
                  style={{ '--genre-color': g.color }}
                >
                  <span className="pill-icon"><i className={g.icon}></i></span>
                  <span className="pill-name">{g.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="music-gallery">
            {filteredSongs.map((song) => (
              <div 
                key={song.id} 
                className={`modern-card ${playingSong?.id === song.id ? 'active' : ''}`}
                onClick={() => navigate(`/music/${song.id}`)}
              >
                <div className="card-media">
                  <img 
                    src={song.thumbnail_url || 'https://via.placeholder.com/300?text=Music'} 
                    alt={song.title} 
                    className="card-thumb"
                  />
                  <div className="card-glow"></div>
                </div>
                <div className="card-details">
                  <h4 className="card-title">{song.title}</h4>
                  <p className="card-artist">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredSongs.length === 0 && (
            <div className="empty-gallery">
              <div className="empty-icon"><i className="fas fa-headphones"></i></div>
              <h3>No results found</h3>
              <p>Try searching for something else or browse different genres.</p>
            </div>
          )}
        </main>
      </div>

      {/* Next Song Countdown Popup */}
      {nextSongPopup.visible && (
        <div className="next-song-popup">
          <div className="popup-overlay"></div>
          <div className="popup-content">
            <div className="countdown-ring">
              <svg viewBox="0 0 36 36">
                <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="ring-fill" strokeDasharray={`${(nextSongPopup.countdown / 4) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <span className="countdown-number">{nextSongPopup.countdown}</span>
            </div>
            <div className="next-song-info">
              <span className="up-next-label">Up Next</span>
              <h3 className="next-title">{nextSongPopup.song?.title}</h3>
              <p className="next-artist">{nextSongPopup.song?.artist}</p>
            </div>
            <div className="popup-actions">
              <button className="skip-btn" onClick={cancelNextSong}>Skip</button>
              <button className="play-now-btn" onClick={() => { playSong(nextSongPopup.song); navigate(`/music/${nextSongPopup.song.id}`); }}>Play Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Player Bar */}
      {showPlayer && playingSong && (
        <div className="modern-player">
          <div className="player-inner">
            <div className="player-left-section" onClick={() => navigate(`/music/${playingSong.id}`)}>
              <img 
                src={playingSong.thumbnail_url || 'https://via.placeholder.com/64?text=Music'} 
                alt={playingSong.title} 
                className="now-playing-thumb"
              />
              <div className="now-playing-meta">
                <div className="meta-title">{playingSong.title}</div>
                <div className="meta-artist">{playingSong.artist}</div>
              </div>
            </div>

            <div className="player-mid-section">
              <div className="main-controls">
                <button className="p-btn secondary" onClick={handlePrev}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                <button className="p-btn main-play" onClick={togglePlay}>
                  {isPlaying ? 
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : 
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  }
                </button>
                <button className="p-btn secondary" onClick={handleNext}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>
              </div>
              
              <div className="scrub-container">
                <span className="curr-time">{formatTime(currentTime)}</span>
                <div className="modern-progress" onClick={handleSeek}>
                  <div className="progress-bg">
                    <div className="progress-fill" style={{ width: `${progress}%` }}>
                      <div className="progress-thumb"></div>
                    </div>
                  </div>
                </div>
                <span className="total-time">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="player-right-section">
              <div className="mobile-controls">
                <button className="p-btn main-play" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
                  {isPlaying ? 
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : 
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  }
                </button>
              </div>
              <div className="extra-actions">
                <button className="action-circle" onClick={(e) => handleShare(e, playingSong)} title="Share">
                  <span><i className="fas fa-link"></i></span>
                </button>
                <button className="action-circle accent" onClick={(e) => handleDownload(e, playingSong)} title="Download">
                  <span><i className="fas fa-download"></i></span>
                </button>
              </div>
              <div className="volume-pod">
                <span className="v-icon"><i className="fas fa-volume-up"></i></span>
                <input 
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={handleVolumeChange}
                  className="v-slider"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MusicPage;
