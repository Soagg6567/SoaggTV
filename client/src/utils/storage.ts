import { User, WatchProgress, MyListItem } from '../types';

const STORAGE_KEYS = {
  USER: 'soaggtv_user',
  LANGUAGE: 'soaggtv_language',
  WATCH_PROGRESS: 'soaggtv_watch_progress',
  MY_LIST: 'soaggtv_my_list',
};

export const storageUtils = {
  // User storage
  saveUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  removeUser: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  // Language storage
  saveLanguage: (language: string) => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  },

  getLanguage: (): string => {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'it';
  },

  // Watch progress storage
  saveWatchProgress: (progress: WatchProgress[]) => {
    localStorage.setItem(STORAGE_KEYS.WATCH_PROGRESS, JSON.stringify(progress));
  },

  getWatchProgress: (): WatchProgress[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS);
    return stored ? JSON.parse(stored) : [];
  },

  // My list storage
  saveMyList: (myList: MyListItem[]) => {
    localStorage.setItem(STORAGE_KEYS.MY_LIST, JSON.stringify(myList));
  },

  getMyList: (): MyListItem[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.MY_LIST);
    return stored ? JSON.parse(stored) : [];
  },

  // Clear all storage
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
};
