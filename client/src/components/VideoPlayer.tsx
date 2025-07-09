import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { vidsrcApi } from '../utils/api';
import { useApp } from '../contexts/AppContext';

interface VideoPlayerProps {
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  season?: number;
  episode?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoPlayer({ 
  tmdbId, 
  type, 
  title, 
  posterPath, 
  season, 
  episode, 
  isOpen,
  onClose 
}: VideoPlayerProps) {
  const { state, dispatch } = useApp();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [closeButtonTimer, setCloseButtonTimer] = useState<number | null>(null);
  
  // Get existing progress
  const existingProgress = state.watchProgress.find(p => 
    p.tmdbId === tmdbId && 
    p.type === type &&
    p.season === season &&
    p.episode === episode
  );

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      
      // Add ESC key listener
      const handleEscKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          // Check if we're in fullscreen mode
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            handleClose();
          }
        }
      };
      
      document.addEventListener('keydown', handleEscKey);
      
      return () => {
        document.removeEventListener('keydown', handleEscKey);
      };
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Real progress tracking would be implemented here with postMessage from iframe
    // For now, only track when the video is opened, not simulated progress

    // Listen for real progress updates from iframe (when the video player sends them)
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from vixsrc.to domain for security
      if (!event.origin.includes('vixsrc.to')) return;
      
      if (event.data.type === 'timeupdate' && event.data.currentTime !== undefined && event.data.duration) {
        const currentTimeSeconds = Math.floor(event.data.currentTime);
        const durationSeconds = Math.floor(event.data.duration);
        
        setCurrentTime(currentTimeSeconds);
        setDuration(durationSeconds);
        
        // Only save progress every 10 seconds to avoid too many updates
        if (currentTimeSeconds % 10 === 0) {
          const progress = {
            id: `${tmdbId}-${type}-${season || ''}-${episode || ''}`,
            userId: state.user?.id || 1,
            tmdbId,
            type,
            title,
            posterPath: posterPath || null,
            currentTime: currentTimeSeconds,
            duration: durationSeconds,
            season: season || null,
            episode: episode || null,
            lastWatched: new Date().toISOString(),
          };
          
          dispatch({ type: 'ADD_WATCH_PROGRESS', payload: progress });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, tmdbId, type, title, posterPath, season, episode, state.user, dispatch]);

  const getEmbedUrl = () => {
    const startAt = existingProgress?.currentTime ? Math.floor(existingProgress.currentTime) : undefined;
    
    if (type === 'movie') {
      return vidsrcApi.getMovieEmbedUrl(tmdbId, 'B20710', '170000', state.language, startAt);
    } else {
      return vidsrcApi.getTVEmbedUrl(tmdbId, season!, episode!, 'B20710', '170000', state.language, startAt);
    }
  };

  const handleClose = () => {
    // Save current progress before closing
    if (currentTime > 0 && duration > 0 && state.user) {
      const progress = {
        id: `${tmdbId}-${type}-${season || ''}-${episode || ''}`,
        userId: state.user.id,
        tmdbId,
        type,
        title,
        posterPath: posterPath || null,
        currentTime: currentTime,
        duration: duration,
        season: season || null,
        episode: episode || null,
        lastWatched: new Date().toISOString(),
      };
      
      dispatch({ type: 'ADD_WATCH_PROGRESS', payload: progress });
      
      // Also save to database
      fetch(`/api/users/${state.user.id}/watch-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tmdbId,
          type,
          title,
          posterPath,
          currentTime,
          duration,
          season,
          episode,
        }),
      }).catch(error => {
        console.error('Error saving watch progress to database:', error);
      });
    }
    
    onClose();
  };

  const handleMouseMove = () => {
    setShowCloseButton(true);
    
    // Clear existing timer
    if (closeButtonTimer) {
      clearTimeout(closeButtonTimer);
    }
    
    // Set new timer to hide button after 1 second
    const timer = setTimeout(() => {
      setShowCloseButton(false);
    }, 1000);
    
    setCloseButtonTimer(timer);
  };

  const handleMouseLeave = () => {
    // Clear timer on mouse leave
    if (closeButtonTimer) {
      clearTimeout(closeButtonTimer);
    }
    setShowCloseButton(false);
  };

  useEffect(() => {
    return () => {
      if (closeButtonTimer) {
        clearTimeout(closeButtonTimer);
      }
    };
  }, [closeButtonTimer]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black" 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Close button */}
      {showCloseButton && (
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-black hover:text-gray-700 transition-colors duration-200"
          style={{ background: 'none', border: 'none', padding: '8px' }}
        >
          <X size={24} />
        </button>
      )}

      {/* Video player */}
      <iframe
        ref={iframeRef}
        src={getEmbedUrl()}
        className="w-full h-full border-0 outline-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        title={title}
        loading="lazy"
      />
    </div>
  );
}
