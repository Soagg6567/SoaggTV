export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: Genre[];
  runtime?: number;
}

export interface TVShow {
  id: number;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: Genre[];
  seasons?: Season[];
  number_of_seasons?: number;
  number_of_episodes?: number;
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  overview: string;
  poster_path: string;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  still_path: string;
  runtime: number;
  vote_average: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
  language: string;
}

export interface WatchProgress {
  id: number;
  userId: number;
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  currentTime: number;
  duration: number;
  season?: number;
  episode?: number;
  lastWatched?: Date;
}

export interface MyListItem {
  id: number;
  userId: number;
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  addedAt?: Date;
}

export interface AppState {
  user: User | null;
  language: string;
  watchProgress: WatchProgress[];
  myList: MyListItem[];
}

export interface AppAction {
  type: 'SET_USER' | 'SET_LANGUAGE' | 'SET_WATCH_PROGRESS' | 'SET_MY_LIST' | 'ADD_TO_MY_LIST' | 'REMOVE_FROM_MY_LIST' | 'ADD_WATCH_PROGRESS';
  payload: any;
}
