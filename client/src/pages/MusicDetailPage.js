import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import MusicPreloader from '../components/MusicPreloader';
import './MusicDetailPage.css';

function MusicDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [lyrics, setLyrics] = useState([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [volume, setVolume] = useState(0.8);
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef(null);
  
  const activeLyricRef = useRef(null);
  const audioRef = useRef(null);
  const visualizerRef = useRef(null);
  const mobileVisualizerRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);

  const BASE_URL = 'https://nlmcieko.onrender.com';

  const parseLyrics = useCallback((rawLyrics) => {
    if (!rawLyrics) return [];
    const lines = rawLyrics.split('\n');
    const lrcPattern = /^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
    if (lines.some(line => lrcPattern.test(line))) {
      return lines.map(line => {
        const match = lrcPattern.exec(line);
        if (match) {
          const minutes = parseInt(match[1]);
          const seconds = parseInt(match[2]);
          const ms = parseInt(match[3]);
          const time = minutes * 60 + seconds + ms / (match[3].length === 3 ? 1000 : 100);
          return { time, text: match[4].trim() };
        }
        return { time: 0, text: line };
      }).filter(l => l.text);
    } else {
      return lines.map((text, i) => ({
        time: (i / lines.length) * (audioRef.current?.duration || 180),
        text: text.trim()
      })).filter(l => l.text);
    }
  }, []);

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/admin/songs/${id}`);
        const currentSong = response.data;
        
        if (currentSong) {
          setSong(currentSong);
          if (currentSong.lyrics) {
            setLyrics(parseLyrics(currentSong.lyrics));
          }
        } else {
          navigate('/music');
        }
        setPageLoading(false);
      } catch (err) {
        console.error('Error fetching song data:', err);
        navigate('/music');
        setPageLoading(false);
      }
    };
    fetchSongData();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [id, navigate]);

  useEffect(() => {
    if (song && audioRef.current) {
      let audioUrl = song.audio_url;
      if (audioUrl && !audioUrl.startsWith('http')) {
        audioUrl = `${BASE_URL}${audioUrl}`;
      }
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setIsPlaying(false);
    }
  }, [song, BASE_URL]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 992) {
        if (scrollRef.current && scrollRef.current.scrollTop > 100) {
          setIsMinimized(true);
        } else {
          setIsMinimized(false);
        }
      }
    };

    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const initVisualizer = useCallback(() => {
    if (!audioRef.current) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
      }
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        [visualizerRef.current, mobileVisualizerRef.current].forEach(canvas => {
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = (Math.min(canvas.width, canvas.height) / 2) - 40;
          
          // Draw glow rings
          for (let i = 0; i < bufferLength; i += 4) {
            const barHeight = (dataArray[i] / 255) * 50;
            const angle = (i / bufferLength) * Math.PI * 2;
            
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight);
            
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.4 + (dataArray[i]/255) * 0.6})`;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        });
      };
      draw();
    } catch (e) {
      console.warn("Visualizer init failed:", e);
    }
  }, []);

  useEffect(() => {
    if (isPlaying && song) initVisualizer();
  }, [isPlaying, song, initVisualizer]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      setCurrentTime(current);
      setProgress((current / audioRef.current.duration) * 100);
      if (lyrics.length > 0) {
        const index = lyrics.findIndex((l, i) => {
          const next = lyrics[i + 1];
          return current >= l.time && (!next || current < next.time);
        });
        if (index !== -1 && index !== activeLyricIndex) setActiveLyricIndex(index);
      }
    }
  };

  const updateDuration = () => {
    if (audioRef.current) setDuration(audioRef.current.duration || 0);
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
      audioRef.current.play().catch(err => console.error("Playback failed:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (duration) audioRef.current.currentTime = percent * duration;
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async (e, song) => {
    e?.stopPropagation();
    let audioUrl = song.audio_url;
    if (audioUrl && !audioUrl.startsWith('http')) {
      audioUrl = `${BASE_URL}${audioUrl}`;
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
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/music/${song.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied!');
  };

  if (pageLoading || !song) return <MusicPreloader />;

  return (
    <div className="perfect-music-detail">
      <Helmet>
        <title>{`${song.title} - ${song.artist} | Grace Church Music`}</title>
        <meta name="description" content={`Listen to ${song.title} by ${song.artist}. Explore the lyrics and find spiritual inspiration through our gospel music collection.`} />
        <meta property="og:title" content={`${song.title} by ${song.artist}`} />
        <meta property="og:description" content={`Listen to this beautiful gospel track: ${song.title} by ${song.artist} on Grace Church Music.`} />
        <meta property="og:image" content={song.thumbnail_url} />
      </Helmet>
      <div className="dynamic-background" style={{ backgroundImage: `url(${song.thumbnail_url})` }}></div>
      <div className="vignette-overlay"></div>
      <div className="noise-overlay"></div>

      <audio 
        ref={audioRef} 
        onTimeUpdate={handleTimeUpdate} 
        onLoadedMetadata={updateDuration}
        onCanPlay={() => setPageLoading(false)}
        onCanPlayThrough={() => setPageLoading(false)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="full-screen-layout" ref={scrollRef}>
        {/* Left Side: Player */}
        <div className="player-side">
          <header className="player-header">
            <button onClick={() => navigate('/music')} className="circular-back">
              <span className="back-icon">←</span>
            </button>
            <div className="track-meta">
              <span className="now-playing-label">Trending Now</span>
              <span className="current-genre-label">{song.genre} • High Fidelity</span>
            </div>
          </header>

          <div className="player-main-content">
            <div className={`album-art-stage ${isPlaying ? 'is-playing' : ''}`} onClick={togglePlay}>
              <div className="album-glow"></div>
              <div className="edge-visualizer">
                <canvas ref={visualizerRef} width="600" height="600"></canvas>
              </div>
              <img src={song.thumbnail_url} alt={song.title} className="hero-image" />
              <div className="hero-reflection"></div>
              <div className="album-play-overlay">
                <div className="overlay-icon-wrapper">
                  {isPlaying ? (
                    <svg className="overlay-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : (
                    <svg className="overlay-icon play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </div>
              </div>
            </div>

            <div className="hero-titles">
              <h1 className="song-main-title">{song.title}</h1>
              <h2 className="song-main-artist">{song.artist}</h2>
            </div>

            <div className="perfect-controls-pod">
              <div className="perfect-progress" onClick={handleSeek}>
                <div className="progress-outer">
                  <div className="progress-inner" style={{ width: `${progress}%` }}>
                    <div className="progress-glow"></div>
                  </div>
                </div>
                <div className="time-labels">
                  <span className="time-curr">{formatTime(currentTime)}</span>
                  <span className="time-dur">{formatTime(duration)}</span>
                </div>
              </div>

              <div className="perfect-playback">
                <button className="ctrl-btn secondary" onClick={() => audioRef.current.currentTime -= 10}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 16L7 12l5.5-4v8zm-5.5 0L1.5 12l5.5-4v8z"/></svg>
                </button>
                <button className="ctrl-btn primary-play" onClick={togglePlay}>
                  {isPlaying ? 
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : 
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  }
                </button>
                <button className="ctrl-btn secondary" onClick={() => audioRef.current.currentTime += 10}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 16l5.5-4-5.5-4v8zm5.5 0l5.5-4-5.5-4v8z"/></svg>
                </button>
              </div>

              <div className="desktop-actions">
                <button className="d-action-btn" onClick={(e) => handleShare(e, song)}>
                  <span className="icon"><i className="fas fa-link"></i></span> Share
                </button>
                <button className="d-action-btn accent" onClick={(e) => handleDownload(e, song)}>
                  <span className="icon"><i className="fas fa-download"></i></span> Download
                </button>
              </div>

              <div className="perfect-volume">
                <div className="volume-icon">
                  {volume === 0 ? <i className="fas fa-volume-mute"></i> : volume < 0.5 ? <i className="fas fa-volume-down"></i> : <i className="fas fa-volume-up"></i>}
                </div>
                <div className="volume-slider-wrapper">
                  <input 
                    type="range" min="0" max="1" step="0.01" value={volume} 
                    className="volume-slider"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setVolume(val);
                      audioRef.current.volume = val;
                    }}
                  />
                  <div className="volume-progress" style={{ width: `${volume * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Mobile Mini Player (Hidden on Desktop) */}
        <div className={`mobile-mini-player ${isMinimized ? 'minimized' : ''}`} onClick={togglePlay}>
          <div className="mini-info">
            <img src={song.thumbnail_url} alt={song.title} className="mini-thumb" />
            <div className="mini-text">
              <span className="mini-title">{song.title}</span>
              <span className="mini-artist">{song.artist}</span>
            </div>
          </div>
          <div className="mini-controls">
            <button className="mini-btn-icon" onClick={(e) => handleShare(e, song)}>
              <span><i className="fas fa-link"></i></span>
            </button>
            <button className="mini-btn-icon" onClick={(e) => handleDownload(e, song)}>
              <span><i className="fas fa-download"></i></span>
            </button>
            <button className="mini-btn main">
              {isPlaying ? 
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : 
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              }
            </button>
          </div>
          <div className="mini-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Lyrics Section (Right on Desktop, Main Scrollable on Mobile) */}
        <div className="lyrics-content-side">
          {/* Mobile Back Button (Breadcrumb) */}
          <div className="mobile-breadcrumb">
            <button onClick={() => navigate('/music')} className="mobile-back-btn">
              <i className="fas fa-chevron-left"></i> Back to Music
            </button>
          </div>
          
          {/* Expanded Mobile Player Header */}
          <div className="mobile-hero-player">
            <div className="mobile-hero-art">
              <div className="mobile-edge-visualizer">
                <canvas ref={mobileVisualizerRef} width="400" height="400"></canvas>
              </div>
              <img src={song.thumbnail_url} alt={song.title} />
              <div className={`mobile-hero-play ${isPlaying ? 'playing' : ''}`} onClick={togglePlay}>
                {isPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
              </div>
            </div>
            <div className="mobile-hero-info">
              <h2>{song.title}</h2>
              <p>{song.artist}</p>
            </div>
            <div className="mobile-hero-actions">
              <button className="hero-action-btn" onClick={(e) => handleShare(e, song)}>
                <span className="icon"><i className="fas fa-link"></i></span> Share
              </button>
              <button className="hero-action-btn accent" onClick={(e) => handleDownload(e, song)}>
                <span className="icon"><i className="fas fa-download"></i></span> Download
              </button>
            </div>
          </div>

          <div className="lyrics-header">
            <h3>Synchronized Lyrics</h3>
          </div>
          <div className="lyrics-container">
            {lyrics.length > 0 ? (
              lyrics.map((line, i) => (
                <div 
                  key={i} 
                  ref={i === activeLyricIndex ? activeLyricRef : null}
                  className="p-lyric-line-wrapper"
                  onClick={() => { audioRef.current.currentTime = line.time; }}
                >
                  <p className="p-lyric-line">{line.text}</p>
                </div>
              ))
            ) : (
              <div className="perfect-empty">
                <div className="empty-icon">🎵</div>
                <p>Lyrics are coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <audio 
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={updateDuration}
        crossOrigin="anonymous"
      />
    </div>
  );
}

export default MusicDetailPage;
