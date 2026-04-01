import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api, { SERVER_URL } from '../services/api';

const MusicContext = createContext();

export const useMusic = () => useContext(MusicContext);

export const MusicProvider = ({ children }) => {
  const [allSongs, setAllSongs] = useState([]);
  const [playingSong, setPlayingSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    return parseFloat(localStorage.getItem('musicVolume')) || 0.8;
  });
  const [activeGenre, setActiveGenre] = useState(() => {
    return localStorage.getItem('activeGenre') || 'all';
  });
  const [libraryView, setLibraryView] = useState(() => {
    return localStorage.getItem('libraryView') || 'songs';
  });
  const [toast, setToast] = useState(null);
  const [toastAction, setToastAction] = useState(null);
  const [pendingSong, setPendingSong] = useState(null);
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const [nextSongPopup, setNextSongPopup] = useState({ visible: false, song: null, countdown: 4 });

  const audioRef = useRef(new Audio());

  useEffect(() => {
    // Enable CORS for audio visualization
    audioRef.current.crossOrigin = "anonymous";
  }, []);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const response = await api.get('/admin/songs');
        setAllSongs(response.data);
      } catch (err) {
        console.error('Error fetching songs in context:', err);
      }
    };
    fetchSongs();
  }, []);

  useEffect(() => {
    const handleFirstInteraction = () => {
      setIsUserInteracted(true);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const showToast = useCallback((message, duration = 3000, action = null, actionText = '') => {
    setToast(message);
    setToastAction(action ? { callback: action, text: actionText } : null);
    setTimeout(() => {
      setToast(null);
      setToastAction(null);
    }, duration);
  }, []);

  const safePlay = useCallback(async () => {
    try {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
        setPendingSong(null);
        return true;
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        console.warn('Autoplay blocked, waiting for interaction');
        setIsPlaying(false);
        return false;
      }
      console.error('Playback error:', err);
      setIsPlaying(false);
    }
    return false;
  }, []);

  const playSong = useCallback(async (song) => {
    if (!song) return;

    // Reset popup if active
    setNextSongPopup({ visible: false, song: null, countdown: 4 });

    let audioUrl = song.audio_url;
    if (audioUrl && !audioUrl.startsWith('http')) {
      audioUrl = `${SERVER_URL}${audioUrl}`;
    }

    const isNewSong = !playingSong || playingSong.id !== song.id;

    if (isNewSong) {
      audioRef.current.src = audioUrl;
      setPlayingSong(song);
    } else {
      setPlayingSong(song);
    }

    const played = await safePlay();
    if (!played) {
      setPendingSong(song);
      showToast('Tap anywhere to play music');
    }
  }, [playingSong, SERVER_URL, showToast, safePlay]);

  useEffect(() => {
    if (isUserInteracted && pendingSong) {
      playSong(pendingSong);
    }
  }, [isUserInteracted, pendingSong, playSong]);

  const togglePlay = useCallback(async () => {
    if (!playingSong) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const played = await safePlay();
        if (!played) {
          showToast('Click again to play');
        }
      }
    } catch (err) {
      console.error("Toggle play error:", err);
      setIsPlaying(false);
    }
  }, [playingSong, isPlaying, safePlay, showToast]);

  const getNextSong = useCallback(() => {
    if (!playingSong || allSongs.length === 0) return null;

    let songsToPickFrom = [...allSongs];
    if (activeGenre !== 'all') {
      songsToPickFrom = allSongs.filter(s => s.genre === activeGenre);
    }

    if (songsToPickFrom.length === 0) songsToPickFrom = [...allSongs];

    const currentIndex = songsToPickFrom.findIndex(s => s.id === playingSong.id);
    const nextIndex = (currentIndex + 1) % songsToPickFrom.length;
    return songsToPickFrom[nextIndex];
  }, [playingSong, allSongs, activeGenre]);

  const handleNext = useCallback(() => {
    const nextSong = getNextSong();
    if (nextSong) {
      showToast(`Next song loading: ${nextSong.title}`);
      playSong(nextSong);
    }
  }, [getNextSong, playSong, showToast]);

  const cancelNextSong = () => {
    setNextSongPopup({ visible: false, song: null, countdown: 4 });
  };

  useEffect(() => {
    let timer;
    if (nextSongPopup.visible && nextSongPopup.countdown > 0) {
      timer = setInterval(() => {
        setNextSongPopup(prev => ({ ...prev, countdown: prev.countdown - 1 }));
      }, 1000);
    } else if (nextSongPopup.visible && nextSongPopup.countdown === 0) {
      playSong(nextSongPopup.song);
    }
    return () => clearInterval(timer);
  }, [nextSongPopup.visible, nextSongPopup.countdown, nextSongPopup.song, playSong]);

  const handlePrev = useCallback(() => {
    if (!playingSong || allSongs.length === 0) return;

    let songsToPickFrom = [...allSongs];
    if (activeGenre !== 'all') {
      songsToPickFrom = allSongs.filter(s => s.genre === activeGenre);
    }

    if (songsToPickFrom.length === 0) songsToPickFrom = [...allSongs];

    const currentIndex = songsToPickFrom.findIndex(s => s.id === playingSong.id);
    const prevIndex = (currentIndex - 1 + songsToPickFrom.length) % songsToPickFrom.length;
    playSong(songsToPickFrom[prevIndex]);
  }, [playingSong, allSongs, activeGenre, playSong]);

  useEffect(() => {
    const audio = audioRef.current;
    
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
      const next = getNextSong();
      if (next) {
        setNextSongPopup({ visible: true, song: next, countdown: 4 });
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.volume = volume;

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [getNextSong, volume]);

  useEffect(() => {
    localStorage.setItem('activeGenre', activeGenre);
  }, [activeGenre]);

  useEffect(() => {
    localStorage.setItem('libraryView', libraryView);
  }, [libraryView]);

  useEffect(() => {
    localStorage.setItem('musicVolume', volume.toString());
    audioRef.current.volume = volume;
  }, [volume]);

  const value = {
    allSongs,
    playingSong,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    setVolume,
    activeGenre,
    setActiveGenre,
    libraryView,
    setLibraryView,
    playSong,
    togglePlay,
    handleNext,
    handlePrev,
    toast,
    toastAction,
    showToast,
    nextSongPopup,
    cancelNextSong,
    audioRef
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};
