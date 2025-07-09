import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Movie, TVShow } from '../types';
import { tmdbApi } from '../utils/api';
import { useApp } from '../contexts/AppContext';
import MediaCard from './MediaCard';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (item: Movie | TVShow, type: 'movie' | 'tv') => void;
}

export default function SearchModal({ isOpen, onClose, onItemClick }: SearchModalProps) {
  const { state } = useApp();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<(Movie | TVShow) & { media_type: 'movie' | 'tv' }>>([]);
  const [loading, setLoading] = useState(false);

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
    const searchContent = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await tmdbApi.searchMulti(query, 1, state.language);
        
        // Filter and format results
        const filteredResults = response.results
          .filter((item: any) => 
            (item.media_type === 'movie' || item.media_type === 'tv') && 
            item.poster_path
          )
          .map((item: any) => ({
            ...item,
            // Normalize title field
            title: item.title || item.name,
            name: item.name || item.title,
          }))
          .slice(0, 30);

        setResults(filteredResults);
      } catch (error) {
        console.error('Error searching:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchContent, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, state.language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-8 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Cerca</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-8">
          <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 text-lg"
            placeholder="Cerca film e serie TV..."
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="text-center py-8">
              <div className="text-white text-lg">Ricerca in corso...</div>
            </div>
          )}

          {!loading && query.trim().length >= 2 && results.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg">Nessun risultato trovato per "{query}"</div>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-white mb-6">
                Risultati ({results.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {results.map((item) => (
                  <MediaCard
                    key={`${item.media_type}-${item.id}`}
                    item={item}
                    type={item.media_type}
                    onClick={() => {
                      onItemClick(item, item.media_type);
                      onClose();
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
