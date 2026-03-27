import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
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
  const [activeGenre, setActiveGenre] = useState('all');
  const [libraryView, setLibraryView] = useState('songs');
  const [playingSong, setPlayingSong] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef(null);
  
  // Single audio instance
  if (!audioRef.current) {
    audioRef.current = new Audio();
  }

  // Fetch all songs from database
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await axios.get('https://nlmcieko.onrender.com/api/admin/songs');
        const fetchedSongs = response.data;
        setAllSongs(fetchedSongs);
        setPageLoading(false);

        // Check for song ID in URL and redirect to detail page
        const params = new URLSearchParams(window.location.search);
        const songId = params.get('song');
        if (songId) {
          navigate(`/music/${songId}`);
          return;
        }
      } catch (err) {
        console.error('Error fetching songs:', err);
        setPageLoading(false);
      }
    };
    fetchSongs();
  }, [navigate]);

  // Filter songs by genre, library view and search query
  const songs = useMemo(() => {
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

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current && audioRef.current.duration) {
      const current = audioRef.current.currentTime;
      setCurrentTime(current);
      setProgress((current / audioRef.current.duration) * 100);
    }
  }, []);

  const updateDuration = useCallback(() => {
    if (audioRef.current) setDuration(audioRef.current.duration || 0);
  }, []);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlaySong = useCallback(async (song) => {
    let audioUrl = song.audio_url;
    if (audioUrl && !audioUrl.startsWith('http')) {
      audioUrl = `https://nlmcieko.onrender.com${audioUrl}`;
    }
    
    if (playingSong?.id === song.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setShowPlayer(true);
      audioRef.current.src = audioUrl;
      audioRef.current.play().then(() => {
        setPlayingSong(song);
        setIsPlaying(true);
      }).catch((err) => {
        console.error('Playback failed:', err);
      });
    }
  }, [playingSong, isPlaying]);

  const handleNext = useCallback(() => {
    if (!playingSong || songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === playingSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    handlePlaySong(songs[nextIndex]);
  }, [playingSong, songs, handlePlaySong]);

  const handlePrev = useCallback(() => {
    if (!playingSong || songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === playingSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    handlePlaySong(songs[prevIndex]);
  }, [playingSong, songs, handlePlaySong]);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (duration && audioRef.current) audioRef.current.currentTime = percent * duration;
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  const togglePlay = useCallback(() => {
    if (!playingSong || !audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  }, [playingSong, isPlaying]);

  // Initialize audio
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // Update audio properties and listeners
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.onended = handleNext;
      audioRef.current.ontimeupdate = handleTimeUpdate;
      audioRef.current.onloadedmetadata = updateDuration;
    }
  }, [volume, handleNext, handleTimeUpdate, updateDuration]);

  const handleDownload = async (e, song) => {
    e.stopPropagation();
    let audioUrl = song.audio_url;
    if (audioUrl && !audioUrl.startsWith('http')) {
      audioUrl = `https://nlmcieko.onrender.com${audioUrl}`;
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
    const shareUrl = `${window.location.origin}/music/${song.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied!');
  };

  if (pageLoading) return <MusicPreloader />;

  return (
    <div className="modern-music-container">
      <Helmet>
        <title>Gospel Music | Grace Church - NLM Cieko</title>
        <meta name="description" content="Listen to and download spiritual gospel music, worship songs, and inspirational tracks from Grace Church and NLM Cieko." />
        <meta property="og:title" content="Grace Church Music Library" />
        <meta property="og:description" content="Explore our collection of gospel, worship, and spiritual music designed to uplift your soul and strengthen your faith." />
      </Helmet>
      <div className="vibrant-bg"></div>
      <div className="glass-overlay"></div>
      
      <div className="app-layout">
        {/* Modern Sidebar */}
        <aside className="modern-sidebar">
          <div className="search-wrapper">
            <div className="modern-search">
              <span className="search-icon"><i className="fas fa-search"></i></span>
              <input 
                type="text" 
                placeholder="Search artists, songs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="nav-group">
            <h3 className="nav-title">Discover</h3>
            <button className={`nav-btn ${activeGenre === 'all' && !searchQuery ? 'active' : ''}`} onClick={() => {setActiveGenre('all'); setSearchQuery('');}}>
              <span className="btn-icon"><i className="fas fa-home"></i></span> Listen Now
            </button>
            <button className={`nav-btn ${libraryView === 'recently-added' ? 'active' : ''}`} onClick={() => setLibraryView('recently-added')}>
              <span className="btn-icon"><i className="fas fa-bolt"></i></span> New Releases
            </button>
          </div>

          <div className="nav-group">
            <h3 className="nav-title">Library</h3>
            <button className={`nav-btn ${libraryView === 'artists' ? 'active' : ''}`} onClick={() => setLibraryView('artists')}>
              <span className="btn-icon"><i className="fas fa-user"></i></span> Artists
            </button>
            <button className={`nav-btn ${libraryView === 'albums' ? 'active' : ''}`} onClick={() => setLibraryView('albums')}>
              <span className="btn-icon"><i className="fas fa-compact-disc"></i></span> Albums
            </button>
            <button className={`nav-btn ${libraryView === 'songs' ? 'active' : ''}`} onClick={() => setLibraryView('songs')}>
              <span className="btn-icon"><i className="fas fa-music"></i></span> Songs
            </button>
          </div>

          <div className="nav-group">
            <h3 className="nav-title">Genres</h3>
            <div className="genre-pills">
              {genres.slice(1).map(g => (
                <button 
                  key={g.id} 
                  className={`genre-pill ${activeGenre === g.id ? 'active' : ''}`}
                  onClick={() => setActiveGenre(g.id)}
                  style={{ '--genre-color': g.color }}
                >
                  <span className="pill-icon"><i className={g.icon}></i></span>
                  <span className="pill-name">{g.name}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-viewport">
          <header className="viewport-header">
            <div className="header-info">
              <h1>{activeGenre === 'all' ? 'Featured Music' : genres.find(g => g.id === activeGenre)?.name}</h1>
              <span className="track-count">{songs.length} Tracks Available</span>
            </div>
            <div className="header-actions">
              <div className="view-toggle">
                <button className="view-btn active">Grid</button>
                <button className="view-btn">List</button>
              </div>
            </div>
          </header>

          <div className="music-gallery">
            {songs.map((song) => (
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
                  <div className="card-play-overlay">
                    <div className="play-ring">
                      <span className="play-glyph">
                        {playingSong?.id === song.id && isPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="card-details">
                  <h4 className="card-title">{song.title}</h4>
                  <p className="card-artist">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>

          {songs.length === 0 && (
            <div className="empty-gallery">
              <div className="empty-icon"><i className="fas fa-headphones"></i></div>
              <h3>No results found</h3>
              <p>Try searching for something else or browse different genres.</p>
            </div>
          )}
        </main>
      </div>

      {/* Modern Player Bar */}
      {showPlayer && playingSong && (
        <div className="modern-player">
          <div className="player-inner">
            <div className="player-left-section">
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
