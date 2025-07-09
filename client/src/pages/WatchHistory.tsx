import React from 'react';
import { Play, Clock, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { getImageUrl } from '../utils/api';

export default function WatchHistory() {
  const { state, dispatch } = useApp();

  const removeFromHistory = async (id: number) => {
    try {
      if (state.user) {
        const response = await fetch(`/api/watch-progress/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          const updatedProgress = state.watchProgress.filter(p => p.id !== id);
          dispatch({ type: 'SET_WATCH_PROGRESS', payload: updatedProgress });
        }
      }
    } catch (error) {
      console.error('Error removing from history:', error);
    }
  };

  if (state.watchProgress.length === 0) {
    return (
      <div className="bg-black min-h-screen pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white mb-8">Cronologia</h1>
          
          <div className="text-center py-12">
            <Clock size={48} className="text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">
              Nessuna cronologia
            </h2>
            <p className="text-gray-500">
              Inizia a guardare contenuti per vedere la tua cronologia qui
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-white mb-8">Cronologia</h1>
        
        <div className="space-y-4">
          {state.watchProgress.map((progress) => {
            const percentage = progress.duration > 0 
              ? (progress.currentTime / progress.duration) * 100 
              : 0;
            
            const lastWatchedDate = progress.lastWatched 
              ? new Date(progress.lastWatched).toLocaleDateString('it-IT') 
              : '';

            return (
              <div
                key={progress.id}
                className="bg-gray-900 rounded-lg p-4 flex items-center space-x-4 hover:bg-gray-800 transition-colors group"
              >
                <div className="flex-shrink-0">
                  <img
                    src={getImageUrl(progress.posterPath)}
                    alt={progress.title}
                    className="w-16 h-10 object-cover rounded"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold truncate">{progress.title}</h3>
                  
                  {progress.season && progress.episode && (
                    <p className="text-gray-400 text-sm">
                      Stagione {progress.season} • Episodio {progress.episode}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-gray-400 text-sm">{lastWatchedDate}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">
                        {Math.floor(progress.currentTime / 60)}:{(progress.currentTime % 60).toString().padStart(2, '0')}
                      </span>
                      <div className="w-32 bg-gray-700 rounded-full h-1">
                        <div 
                          className="bg-white h-1 rounded-full transition-all duration-300" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm">{Math.round(percentage)}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      // This would need to implement resume functionality
                      console.log('Resume playback for:', progress);
                    }}
                    className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors"
                    title="Riprendi"
                  >
                    <Play size={16} />
                  </button>
                  
                  <button
                    onClick={() => removeFromHistory(progress.id)}
                    className="bg-gray-700 text-white p-2 rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Rimuovi dalla cronologia"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
