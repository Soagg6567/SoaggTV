import React from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { getImageUrl } from '../utils/api';
import { Movie, TVShow } from '../types';

interface MyListProps {
  onItemClick: (item: Movie | TVShow, type: 'movie' | 'tv') => void;
}

export default function MyList({ onItemClick }: MyListProps) {
  const { state, dispatch } = useApp();

  const removeFromList = (tmdbId: number, type: 'movie' | 'tv') => {
    dispatch({ type: 'REMOVE_FROM_MY_LIST', payload: { tmdbId, type } });
  };

  if (state.myList.length === 0) {
    return (
      <div className="bg-black min-h-screen pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white mb-8">La mia lista</h1>
          
          <div className="text-center py-12">
            <Heart size={48} className="text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">
              La tua lista è vuota
            </h2>
            <p className="text-gray-500">
              Aggiungi film e serie TV alla tua lista per trovarli facilmente qui
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-8">La mia lista</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {state.myList.map((listItem) => (
            <div key={`${listItem.type}-${listItem.tmdbId}`} className="relative group">
              <div 
                className="cursor-pointer"
                onClick={() => {
                  // This would need to fetch full item details
                  const mockItem = {
                    id: listItem.tmdbId,
                    title: listItem.title,
                    name: listItem.title,
                    poster_path: listItem.posterPath || '',
                    backdrop_path: '',
                    overview: '',
                    release_date: '',
                    first_air_date: '',
                    vote_average: 0,
                    vote_count: 0,
                    genre_ids: [],
                  };
                  onItemClick(mockItem, listItem.type);
                }}
              >
                <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-[2/3]">
                  <img
                    src={getImageUrl(listItem.posterPath)}
                    alt={listItem.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFromList(listItem.tmdbId, listItem.type)}
                className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                title="Rimuovi dalla lista"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
