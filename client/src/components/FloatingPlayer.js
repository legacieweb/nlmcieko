import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMusic } from '../context/MusicContext';
import './FloatingPlayer.css';

const FloatingPlayer = () => {
  const { playingSong, isPlaying, togglePlay, progress, handleNext, handlePrev } = useMusic();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on MusicPage or MusicDetailPage as they have their own players
  const isMusicPage = location.pathname === '/music' || location.pathname.startsWith('/music/');
  
  if (!playingSong || isMusicPage) return null;

  return (
    <div className="floating-mini-player" onClick={() => navigate(`/music/${playingSong.id}`)}>
      <div className="mini-player-content">
        <div className="mini-player-info">
          <img 
            src={playingSong.thumbnail_url || 'https://via.placeholder.com/40?text=Music'} 
            alt={playingSong.title} 
            className="mini-player-thumb"
          />
          <div className="mini-player-text">
            <span className="mini-player-title">{playingSong.title}</span>
            <span className="mini-player-artist">{playingSong.artist}</span>
          </div>
        </div>
        
        <div className="mini-player-controls">
          <button className="mini-ctrl-btn" onClick={(e) => { e.stopPropagation(); handlePrev(); }}>
            <i className="fas fa-step-backward"></i>
          </button>
          <button className="mini-ctrl-btn main" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
            {isPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
          </button>
          <button className="mini-ctrl-btn" onClick={(e) => { e.stopPropagation(); handleNext(); }}>
            <i className="fas fa-step-forward"></i>
          </button>
        </div>
      </div>
      <div className="mini-player-progress">
        <div className="mini-progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default FloatingPlayer;
