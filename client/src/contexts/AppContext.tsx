import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction, User, WatchProgress, MyListItem } from '../types';
import { storageUtils } from '../utils/storage';

const initialState: AppState = {
  user: { id: 1, email: 'default@soaggtv.com', name: 'Default User', language: 'it' },
  language: 'it',
  watchProgress: [],
  myList: [],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LANGUAGE':
      return {
        ...state,
        language: action.payload,
      };
    case 'SET_WATCH_PROGRESS':
      return {
        ...state,
        watchProgress: action.payload,
      };
    case 'SET_MY_LIST':
      return {
        ...state,
        myList: action.payload,
      };
    case 'ADD_TO_MY_LIST':
      return {
        ...state,
        myList: [...state.myList, action.payload],
      };
    case 'REMOVE_FROM_MY_LIST':
      return {
        ...state,
        myList: state.myList.filter(
          item => !(item.tmdbId === action.payload.tmdbId && item.type === action.payload.type)
        ),
      };
    case 'ADD_WATCH_PROGRESS':
      const existing = state.watchProgress.find(
        p => p.tmdbId === action.payload.tmdbId && 
             p.type === action.payload.type &&
             p.season === action.payload.season &&
             p.episode === action.payload.episode
      );
      
      if (existing) {
        return {
          ...state,
          watchProgress: state.watchProgress.map(p =>
            p.id === existing.id ? action.payload : p
          ),
        };
      } else {
        return {
          ...state,
          watchProgress: [action.payload, ...state.watchProgress],
        };
      }
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data from localStorage and database
  useEffect(() => {
    const loadInitialData = async () => {
      const user = storageUtils.getUser() || state.user;
      const language = storageUtils.getLanguage();
      
      if (user) {
        dispatch({ type: 'SET_USER', payload: user });
        
        // Load watch progress from database
        try {
          const response = await fetch(`/api/users/${user.id}/watch-progress`);
          if (response.ok) {
            const watchProgress = await response.json();
            dispatch({ type: 'SET_WATCH_PROGRESS', payload: watchProgress });
          }
        } catch (error) {
          console.error('Error loading watch progress:', error);
          // Fallback to localStorage
          const watchProgress = storageUtils.getWatchProgress();
          dispatch({ type: 'SET_WATCH_PROGRESS', payload: watchProgress });
        }
        
        // Load my list from database
        try {
          const response = await fetch(`/api/users/${user.id}/my-list`);
          if (response.ok) {
            const myList = await response.json();
            dispatch({ type: 'SET_MY_LIST', payload: myList });
          }
        } catch (error) {
          console.error('Error loading my list:', error);
          // Fallback to localStorage
          const myList = storageUtils.getMyList();
          dispatch({ type: 'SET_MY_LIST', payload: myList });
        }
      }
      
      dispatch({ type: 'SET_LANGUAGE', payload: language });
    };

    loadInitialData();
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (state.user) {
      storageUtils.saveUser(state.user);
    }
  }, [state.user]);

  useEffect(() => {
    storageUtils.saveLanguage(state.language);
  }, [state.language]);

  useEffect(() => {
    storageUtils.saveWatchProgress(state.watchProgress);
  }, [state.watchProgress]);

  useEffect(() => {
    storageUtils.saveMyList(state.myList);
  }, [state.myList]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
