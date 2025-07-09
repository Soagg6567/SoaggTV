import React, { useState, useEffect, useCallback } from 'react';
import { TVShow } from '../types';
import { tmdbApi } from '../utils/api';
import { useApp } from '../contexts/AppContext';
import MediaCard from '../components/MediaCard';

interface TVShowsProps {
  onItemClick: (item: TVShow, type: 'tv') => void;
}

export default function TVShows({ onItemClick }: TVShowsProps) {
  const { state } = useApp();
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadTVShows = useCallback(async (pageNum: number, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await tmdbApi.getPopularTVShows(pageNum, state.language);
      const newShows = response.results || [];

      if (append) {
        setTVShows(prev => [...prev, ...newShows]);
      } else {
        setTVShows(newShows);
      }

      setHasMore(pageNum < response.total_pages && pageNum < 10); // Limit to 10 pages
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading TV shows:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [state.language]);

  useEffect(() => {
    loadTVShows(1);
  }, [loadTVShows]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 &&
        !loadingMore &&
        hasMore
      ) {
        loadTVShows(page + 1, true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadTVShows, page, loadingMore, hasMore]);

  if (loading) {
    return (
      <div className="bg-black min-h-screen pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-800 rounded w-48 mb-8" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-8">Serie TV</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tvShows.map((show) => (
            <MediaCard
              key={show.id}
              item={show}
              type="tv"
              onClick={() => onItemClick(show, 'tv')}
            />
          ))}
        </div>

        {loadingMore && (
          <div className="text-center mt-8">
            <div className="text-white text-lg">Caricamento altre serie TV...</div>
          </div>
        )}

        {!hasMore && tvShows.length > 0 && (
          <div className="text-center mt-8">
            <div className="text-gray-400">Non ci sono altre serie TV da caricare</div>
          </div>
        )}
      </div>
    </div>
  );
}
