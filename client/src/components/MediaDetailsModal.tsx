import React, { useState, useEffect } from 'react';
import { X, Play, Plus, Check, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Movie, TVShow, Season, Episode } from '../types';
import { tmdbApi, getImageUrl } from '../utils/api';
import { useApp } from '../contexts/AppContext';

interface MediaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Movie | TVShow | null;
  type: 'movie' | 'tv';
  onPlay: (item: Movie | TVShow, type: 'movie' | 'tv', season?: number, episode?: number) => void;
}

export default function MediaDetailsModal({ 
  item, 
  type, 
  isOpen, 
  onClose, 
  onPlay 
}: MediaDetailsModalProps) {
  const { state, dispatch } = useApp();
  const [details, setDetails] = useState<Movie | TVShow | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);
  const [showEpisodeDropdown, setShowEpisodeDropdown] = useState(false);
  const [isInMyList, setIsInMyList] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  useEffect(() => {
    if (!item || !isOpen) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        let detailsData;
        if (type === 'movie') {
          detailsData = await tmdbApi.getMovieDetails(item.id, state.language);
        } else {
          detailsData = await tmdbApi.getTVShowDetails(item.id, state.language);
          // TV shows have seasons
          if (detailsData.seasons) {
            const validSeasons = detailsData.seasons.filter((s: Season) => s.season_number > 0);
            setSeasons(validSeasons);
            if (validSeasons.length > 0) {
              setSelectedSeason(validSeasons[0].season_number);
            }
          }
        }
        setDetails(detailsData);

        // Check if item is in my list
        const inList = state.myList.some(listItem => 
          listItem.tmdbId === item.id && listItem.type === type
        );
        setIsInMyList(inList);
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [item, type, isOpen, state.language, state.myList]);

  // Fetch episodes when season is selected
  useEffect(() => {
    if (!item || type !== 'tv') return;

    const fetchEpisodes = async () => {
      try {
        const episodesData = await tmdbApi.getSeasonEpisodes(
          item.id, 
          selectedSeason, 
          state.language
        );
        setEpisodes(episodesData.episodes || []);
      } catch (error) {
        console.error('Error fetching episodes:', error);
      }
    };

    fetchEpisodes();
  }, [selectedSeason, item, type, state.language]);

  const handleToggleMyList = () => {
    if (!item) return;

    if (isInMyList) {
      dispatch({ 
        type: 'REMOVE_FROM_MY_LIST', 
        payload: { itemId: item.id, type } 
      });
    } else {
      dispatch({ 
        type: 'ADD_TO_MY_LIST', 
        payload: { 
          item, 
          type 
        } 
      });
    }
    setIsInMyList(!isInMyList);
  };

  if (!isOpen || !item) return null;

  const title = type === 'movie' ? (item as Movie).title : (item as TVShow).name;
  const releaseDate = type === 'movie' ? (item as Movie).release_date : (item as TVShow).first_air_date;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Header with backdrop */}
          <div className="relative h-64 md:h-80">
            <img
              src={item.backdrop_path ? getImageUrl(item.backdrop_path, 'w1280') : '/api/placeholder/1280/720'}
              alt={title}
              className="w-full h-full object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Title and controls */}
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-white text-2xl md:text-4xl font-bold mb-2">{title}</h1>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => onPlay(item, type)}
                  className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Riproduci</span>
                </button>
                <button
                  onClick={handleToggleMyList}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  {isInMyList ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  <span>{isInMyList ? 'Nella lista' : 'Aggiungi alla lista'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {loading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ) : details ? (
              <>
                {/* Movie/Show info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-4 text-gray-300 mb-4">
                      <span className="flex items-center">
                        <Star className="w-4 h-4 mr-1 text-yellow-500" />
                        {details.vote_average.toFixed(1)}
                      </span>
                      <span>{releaseDate}</span>
                      {details.genres && (
                        <span>{details.genres.map(g => g.name).join(', ')}</span>
                      )}
                    </div>
                    <p className="text-gray-300 leading-relaxed">{details.overview}</p>
                  </div>
                  <div className="flex justify-center md:justify-start">
                    <img
                      src={details.poster_path ? getImageUrl(details.poster_path, 'w500') : '/api/placeholder/400/600'}
                      alt={title}
                      className="w-48 h-72 object-cover rounded-lg"
                    />
                  </div>
                </div>

                {/* Seasons */}
                {type === 'tv' && seasons.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">Stagioni</h3>
                      <div className="relative">
                        <button
                          onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                          className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center space-x-2 min-w-[200px] justify-between"
                        >
                          <span>
                            {seasons.find(s => s.season_number === selectedSeason)?.name || `Stagione ${selectedSeason}`}
                          </span>
                          {showSeasonDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {showSeasonDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                            {seasons.map((season) => (
                              <button
                                key={season.season_number}
                                onClick={() => {
                                  setSelectedSeason(season.season_number);
                                  setShowSeasonDropdown(false);
                                }}
                                className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                              >
                                {season.name || `Stagione ${season.season_number}`}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Episodes */}
                    {episodes.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-white">
                            Episodi - Stagione {selectedSeason}
                          </h4>
                          <div className="relative">
                            <button
                              onClick={() => setShowEpisodeDropdown(!showEpisodeDropdown)}
                              className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center space-x-2"
                            >
                              <span>Seleziona episodio</span>
                              {showEpisodeDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                            {showEpisodeDropdown && (
                              <div className="absolute top-full right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto min-w-[250px]">
                                {episodes.map((episode) => (
                                  <button
                                    key={episode.id}
                                    onClick={() => {
                                      onPlay(item!, type, selectedSeason, episode.episode_number);
                                      setShowEpisodeDropdown(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span>{episode.episode_number}. {episode.name}</span>
                                      <Play size={16} />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Episode Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                          {episodes.map((episode) => (
                            <div
                              key={episode.id}
                              className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 cursor-pointer transition-colors"
                              onClick={() => onPlay(item!, type, selectedSeason, episode.episode_number)}
                            >
                              <div className="aspect-video mb-3 overflow-hidden rounded">
                                <img
                                  src={getImageUrl(episode.still_path, 'w300')}
                                  alt={episode.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <h5 className="font-medium text-white mb-2 text-sm">
                                {episode.episode_number}. {episode.name}
                              </h5>
                              <p className="text-gray-400 text-xs line-clamp-2 mb-2">
                                {episode.overview}
                              </p>
                              <div className="flex items-center space-x-2 text-xs">
                                <span className="text-yellow-400">★</span>
                                <span className="text-gray-400">
                                  {episode.vote_average?.toFixed(1) || 'N/A'}
                                </span>
                                {episode.runtime && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-400">{episode.runtime} min</span>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">Impossibile caricare i dettagli</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}