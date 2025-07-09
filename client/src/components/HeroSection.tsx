import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Check } from 'lucide-react';
import { Movie, TVShow } from '../types';
import { tmdbApi, getImageUrl } from '../utils/api';
import { useApp } from '../contexts/AppContext';

interface HeroSectionProps {
  onPlay: (item: Movie | TVShow, type: 'movie' | 'tv') => void;
  onInfo: (item: Movie | TVShow, type: 'movie' | 'tv') => void;
}

export default function HeroSection({ onPlay, onInfo }: HeroSectionProps) {
  const { state, dispatch } = useApp();
  const [heroContent, setHeroContent] = useState<(Movie | TVShow) | null>(null);
  const [heroType, setHeroType] = useState<'movie' | 'tv'>('movie');
  const [loading, setLoading] = useState(true);
  const [isInMyList, setIsInMyList] = useState(false);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        // Fetch popular movies and TV shows
        const [moviesResponse, tvResponse] = await Promise.all([
          tmdbApi.getPopularMovies(1, state.language),
          tmdbApi.getPopularTVShows(1, state.language),
        ]);

        // Combine and select a random hero item
        const allContent = [
          ...moviesResponse.results.map((item: Movie) => ({ ...item, type: 'movie' })),
          ...tvResponse.results.map((item: TVShow) => ({ ...item, type: 'tv' })),
        ];

        const randomIndex = Math.floor(Math.random() * Math.min(allContent.length, 10));
        const selectedContent = allContent[randomIndex];
        
        if (selectedContent) {
          setHeroContent(selectedContent);
          setHeroType(selectedContent.type);
          
          // Check if item is in user's list
          if (state.user) {
            const listItem = state.myList.find(
              item => item.tmdbId === selectedContent.id && item.type === selectedContent.type
            );
            setIsInMyList(!!listItem);
          }
        }
      } catch (error) {
        console.error('Error fetching hero content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroContent();
  }, [state.language, state.user, state.myList]);

  const handleAddToMyList = async () => {
    if (!heroContent || !state.user) return;

    const title = heroType === 'movie' ? (heroContent as Movie).title : (heroContent as TVShow).name;
    
    try {
      if (isInMyList) {
        // Remove from list
        dispatch({
          type: 'REMOVE_FROM_MY_LIST',
          payload: { tmdbId: heroContent.id, type: heroType }
        });
        setIsInMyList(false);
      } else {
        // Add to list
        const newItem = {
          id: Date.now(),
          userId: state.user.id,
          tmdbId: heroContent.id,
          type: heroType,
          title,
          posterPath: heroContent.poster_path,
          addedAt: new Date(),
        };
        
        dispatch({ type: 'ADD_TO_MY_LIST', payload: newItem });
        setIsInMyList(true);
      }
    } catch (error) {
      console.error('Error updating my list:', error);
    }
  };

  if (loading || !heroContent) {
    return (
      <section className="relative h-screen bg-gray-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl space-y-6">
              <div className="h-12 bg-gray-700 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded animate-pulse" />
                <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
              </div>
              <div className="flex gap-4">
                <div className="h-12 w-32 bg-gray-700 rounded-lg animate-pulse" />
                <div className="h-12 w-32 bg-gray-700 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const title = heroType === 'movie' ? (heroContent as Movie).title : (heroContent as TVShow).name;
  const releaseDate = heroType === 'movie' ? (heroContent as Movie).release_date : (heroContent as TVShow).first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

  return (
    <section className="relative h-screen">
      {/* Hero Background Image */}
      <div className="absolute inset-0">
        {heroContent.backdrop_path ? (
          <img
            src={getImageUrl(heroContent.backdrop_path, 'w1280')}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl space-y-6">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                {title}
              </h1>
              {year && (
                <p className="text-gray-300 text-lg">{year}</p>
              )}
            </div>
            
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed line-clamp-3">
              {heroContent.overview}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => onPlay(heroContent, heroType)}
                className="flex items-center space-x-3 bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-lg"
              >
                <Play size={20} />
                <span>Riproduci</span>
              </button>
              
              <button
                onClick={() => onInfo(heroContent, heroType)}
                className="flex items-center space-x-3 bg-gray-600/70 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-lg"
              >
                <Info size={20} />
                <span>Maggiori info</span>
              </button>

              {state.user && (
                <button
                  onClick={handleAddToMyList}
                  className="flex items-center space-x-3 bg-gray-600/70 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-lg"
                >
                  {isInMyList ? <Check size={20} /> : <Plus size={20} />}
                  <span>{isInMyList ? 'Nella lista' : 'La mia lista'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
