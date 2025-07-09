import React, { useState, useEffect, useCallback } from 'react';
import { Movie } from '../types';
import { tmdbApi } from '../utils/api';
import { useApp } from '../contexts/AppContext';
import MediaCard from '../components/MediaCard';

interface MoviesProps {
  onItemClick: (item: Movie, type: 'movie') => void;
}

export default function Movies({ onItemClick }: MoviesProps) {
  const { state } = useApp();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMovies = useCallback(async (pageNum: number, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await tmdbApi.getPopularMovies(pageNum, state.language);
      const newMovies = response.results || [];

      if (append) {
        setMovies(prev => [...prev, ...newMovies]);
      } else {
        setMovies(newMovies);
      }

      setHasMore(pageNum < response.total_pages && pageNum < 10); // Limit to 10 pages
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [state.language]);

  useEffect(() => {
    loadMovies(1);
  }, [loadMovies]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 &&
        !loadingMore &&
        hasMore
      ) {
        loadMovies(page + 1, true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMovies, page, loadingMore, hasMore]);

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
        <h1 className="text-2xl font-bold text-white mb-8">Film</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MediaCard
              key={movie.id}
              item={movie}
              type="movie"
              onClick={() => onItemClick(movie, 'movie')}
            />
          ))}
        </div>

        {loadingMore && (
          <div className="text-center mt-8">
            <div className="text-white text-lg">Caricamento altri film...</div>
          </div>
        )}

        {!hasMore && movies.length > 0 && (
          <div className="text-center mt-8">
            <div className="text-gray-400">Non ci sono altri film da caricare</div>
          </div>
        )}
      </div>
    </div>
  );
}
