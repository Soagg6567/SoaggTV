import React, { useState, useEffect } from 'react';
import { Movie, TVShow, Genre } from '../types';
import { tmdbApi } from '../utils/api';
import { useApp } from '../contexts/AppContext';
import HeroSection from '../components/HeroSection';
import MediaCard from '../components/MediaCard';

interface HomeProps {
  onItemClick: (item: Movie | TVShow, type: 'movie' | 'tv') => void;
  onPlay: (item: Movie | TVShow, type: 'movie' | 'tv', season?: number, episode?: number) => void;
}

interface ContentSection {
  title: string;
  content: (Movie | TVShow)[];
  type: 'movie' | 'tv' | 'mixed';
}

export default function Home({ onItemClick, onPlay }: HomeProps) {
  const { state } = useApp();
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        // Fetch trending content
        const [trendingMovies, trendingTV, movieGenres, tvGenres] = await Promise.all([
          tmdbApi.getTrendingMovies('week', state.language),
          tmdbApi.getTrendingTVShows('week', state.language),
          tmdbApi.getMovieGenres(state.language),
          tmdbApi.getTVGenres(state.language)
        ]);

        const newSections: ContentSection[] = [
          {
            title: 'Top Tendenza',
            content: [
              ...trendingMovies.results.slice(0, 10).map((movie: Movie) => ({ ...movie, mediaType: 'movie' })),
              ...trendingTV.results.slice(0, 10).map((show: TVShow) => ({ ...show, mediaType: 'tv' }))
            ].sort(() => Math.random() - 0.5).slice(0, 15),
            type: 'mixed'
          },
          {
            title: 'Film Popolari',
            content: trendingMovies.results.slice(0, 15),
            type: 'movie'
          },
          {
            title: 'Serie TV Popolari',
            content: trendingTV.results.slice(0, 15),
            type: 'tv'
          }
        ];

        // Add genre-based sections for top movie genres
        const topMovieGenres = movieGenres.genres.slice(0, 4);
        for (const genre of topMovieGenres) {
          try {
            const genreMovies = await tmdbApi.getMoviesByGenre(genre.id, 1, state.language);
            if (genreMovies.results.length > 0) {
              newSections.push({
                title: `Film ${genre.name}`,
                content: genreMovies.results.slice(0, 15),
                type: 'movie'
              });
            }
          } catch (error) {
            console.error(`Error fetching ${genre.name} movies:`, error);
          }
        }

        // Add genre-based sections for top TV genres
        const topTVGenres = tvGenres.genres.slice(0, 3);
        for (const genre of topTVGenres) {
          try {
            const genreShows = await tmdbApi.getTVShowsByGenre(genre.id, 1, state.language);
            if (genreShows.results.length > 0) {
              newSections.push({
                title: `Serie TV ${genre.name}`,
                content: genreShows.results.slice(0, 15),
                type: 'tv'
              });
            }
          } catch (error) {
            console.error(`Error fetching ${genre.name} TV shows:`, error);
          }
        }

        setSections(newSections);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [state.language]);

  // Only show real data from user's actual list
  const myListItems = state.myList.slice(0, 6);

  if (loading) {
    return (
      <div className="bg-black min-h-screen">
        <div className="pt-16 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-12">
              <div className="h-96 bg-gray-800 rounded-lg" />
              <div className="space-y-6">
                <div className="h-8 bg-gray-800 rounded w-48" />
                <div className="flex space-x-4 overflow-hidden">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex-none w-40 aspect-[2/3] bg-gray-800 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      <HeroSection onPlay={onPlay} onInfo={onItemClick} />
      
      <div className="space-y-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">


          {/* My List */}
          {myListItems.length > 0 && (
            <section>
              <h2 className="text-white text-2xl font-bold mb-6">La mia lista</h2>
              <div className="relative">
                <div 
                  className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth touch-scroll scroll-container"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {myListItems.map((item) => (
                    <div key={`${item.type}-${item.tmdbId}`} className="flex-none w-40 sm:w-48 md:w-52 scroll-item">
                      <MediaCard
                        item={{ 
                          id: item.tmdbId, 
                          poster_path: item.posterPath || '',
                          title: item.title,
                          name: item.title,
                          vote_average: 0,
                          vote_count: 0,
                          overview: '',
                          release_date: '',
                          first_air_date: '',
                          backdrop_path: '',
                          genre_ids: []
                        }}
                        type={item.type}
                        onClick={() => {
                          onItemClick({ 
                            id: item.tmdbId, 
                            poster_path: item.posterPath || '',
                            title: item.title,
                            name: item.title,
                            vote_average: 0,
                            vote_count: 0,
                            overview: '',
                            release_date: '',
                            first_air_date: '',
                            backdrop_path: '',
                            genre_ids: []
                          }, item.type);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Dynamic Content Sections */}
          {sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-white text-2xl font-bold mb-6">{section.title}</h2>
              <div className="relative">
                <div 
                  className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth touch-scroll scroll-container"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {section.content.map((item) => {
                    const itemType = section.type === 'mixed' 
                      ? (item as any).mediaType || (item.hasOwnProperty('title') ? 'movie' : 'tv')
                      : section.type;
                    
                    return (
                      <div
                        key={`${itemType}-${item.id}`}
                        className="flex-none w-40 sm:w-48 md:w-52 scroll-item"
                      >
                        <MediaCard
                          item={item}
                          type={itemType as 'movie' | 'tv'}
                          onClick={() => onItemClick(item, itemType as 'movie' | 'tv')}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}