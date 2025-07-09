import { Movie, TVShow, Season, Episode } from '../types';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

export const tmdbApi = {
  getPopularMovies: async (page: number = 1, language: string = 'it') => {
    const response = await fetch(`/api/tmdb/movie/popular?page=${page}&language=${language}`);
    if (!response.ok) throw new Error('Failed to fetch popular movies');
    return response.json();
  },

  getPopularTVShows: async (page: number = 1, language: string = 'it') => {
    const response = await fetch(`/api/tmdb/tv/popular?page=${page}&language=${language}`);
    if (!response.ok) throw new Error('Failed to fetch popular TV shows');
    return response.json();
  },

  getMovieDetails: async (id: number, language: string = 'it'): Promise<Movie> => {
    const response = await fetch(`/api/tmdb/movie/${id}?language=${language}`);
    if (!response.ok) throw new Error('Failed to fetch movie details');
    return response.json();
  },

  getTVShowDetails: async (id: number, language: string = 'it'): Promise<TVShow> => {
    const response = await fetch(`/api/tmdb/tv/${id}?language=${language}`);
    if (!response.ok) throw new Error('Failed to fetch TV show details');
    return response.json();
  },

  getSeasonDetails: async (tvId: number, seasonNumber: number, language: string = 'it'): Promise<Season> => {
    const response = await fetch(`/api/tmdb/tv/${tvId}/season/${seasonNumber}?language=${language}`);
    if (!response.ok) throw new Error('Failed to fetch season details');
    return response.json();
  },

  searchMulti: async (query: string, page: number = 1, language: string = 'it') => {
    const response = await fetch(`/api/tmdb/search/multi?query=${encodeURIComponent(query)}&page=${page}&language=${language}`);
    if (!response.ok) throw new Error('Failed to search content');
    return response.json();
  },

  getMovieGenres: async (language: string = 'it') => {
    const response = await fetch(`/api/tmdb/genre/movie/list?language=${language}`);
    if (!response.ok) throw new Error('Failed to fetch movie genres');
    return response.json();
  },

  getTVGenres: async (language: string = 'it') => {
    const response = await fetch(`/api/tmdb/genre/tv/list?language=${language}`);
    if (!response.ok) throw new Error('Failed to fetch TV genres');
    return response.json();
  },

  getMoviesByGenre: async (genreId: number, page: number = 1, language: string = 'it') => {
    const response = await fetch(`/api/tmdb/discover/movie?with_genres=${genreId}&page=${page}&language=${language}`);
    if (!response.ok) throw new Error('Failed to fetch movies by genre');
    return response.json();
  },

  getTVShowsByGenre: async (genreId: number, page: number = 1, language: string = 'it') => {
    const response = await fetch(`/api/tmdb/discover/tv?with_genres=${genreId}&page=${page}&language=${language}`);
    if (!response.ok) throw new Error('Failed to fetch TV shows by genre');
    return response.json();
  },

  getTrendingMovies: async (timeWindow: 'day' | 'week' = 'week', language: string = 'it') => {
    const response = await fetch(`/api/tmdb/trending/movie/${timeWindow}?language=${language}`);
    if (!response.ok) throw new Error('Failed to fetch trending movies');
    return response.json();
  },

  getTrendingTVShows: async (timeWindow: 'day' | 'week' = 'week', language: string = 'it') => {
    const response = await fetch(`/api/tmdb/trending/tv/${timeWindow}?language=${language}`);
    if (!response.ok) throw new Error('Failed to fetch trending TV shows');
    return response.json();
  },
};

export const getImageUrl = (path: string | null, size: 'w500' | 'w1280' = 'w500'): string => {
  if (!path) return '';
  const baseUrl = size === 'w1280' ? TMDB_BACKDROP_BASE_URL : TMDB_IMAGE_BASE_URL;
  return `${baseUrl}${path}`;
};

export const vidsrcApi = {
  getMovieEmbedUrl: (tmdbId: number, primaryColor: string = 'B20710', secondaryColor: string = '170000', language: string = 'it', startAt?: number) => {
    const params = new URLSearchParams();
    params.append('lang', language);
    if (primaryColor) params.append('primaryColor', primaryColor);
    if (secondaryColor) params.append('secondaryColor', secondaryColor);
    if (startAt) params.append('startAt', startAt.toString());
    return `https://vixsrc.to/movie/${tmdbId}?${params.toString()}`;
  },

  getTVEmbedUrl: (tmdbId: number, season: number, episode: number, primaryColor: string = 'B20710', secondaryColor: string = '170000', language: string = 'it', startAt?: number) => {
    const params = new URLSearchParams();
    params.append('lang', language);
    if (primaryColor) params.append('primaryColor', primaryColor);
    if (secondaryColor) params.append('secondaryColor', secondaryColor);
    if (startAt) params.append('startAt', startAt.toString());
    return `https://vixsrc.to/tv/${tmdbId}/${season}/${episode}?${params.toString()}`;
  },
};

export const userApi = {
  createUser: async (userData: { email: string; name: string; avatar?: string; language: string }) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  getUser: async (id: number) => {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  updateUser: async (id: number, userData: Partial<{ email: string; name: string; avatar?: string; language: string }>) => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  getWatchProgress: async (userId: number) => {
    const response = await fetch(`/api/users/${userId}/watch-progress`);
    if (!response.ok) throw new Error('Failed to fetch watch progress');
    return response.json();
  },

  saveWatchProgress: async (userId: number, progressData: {
    tmdbId: number;
    type: 'movie' | 'tv';
    title: string;
    posterPath?: string;
    currentTime: number;
    duration: number;
    season?: number;
    episode?: number;
  }) => {
    const response = await fetch(`/api/users/${userId}/watch-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(progressData),
    });
    if (!response.ok) throw new Error('Failed to save watch progress');
    return response.json();
  },

  getMyList: async (userId: number) => {
    const response = await fetch(`/api/users/${userId}/my-list`);
    if (!response.ok) throw new Error('Failed to fetch my list');
    return response.json();
  },

  addToMyList: async (userId: number, itemData: {
    tmdbId: number;
    type: 'movie' | 'tv';
    title: string;
    posterPath?: string;
  }) => {
    const response = await fetch(`/api/users/${userId}/my-list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) throw new Error('Failed to add to my list');
    return response.json();
  },

  removeFromMyList: async (userId: number, tmdbId: number, type: 'movie' | 'tv') => {
    const response = await fetch(`/api/users/${userId}/my-list/${tmdbId}/${type}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove from my list');
    return response.json();
  },

  isInMyList: async (userId: number, tmdbId: number, type: 'movie' | 'tv') => {
    const response = await fetch(`/api/users/${userId}/my-list/${tmdbId}/${type}`);
    if (!response.ok) throw new Error('Failed to check my list');
    return response.json();
  },
};
