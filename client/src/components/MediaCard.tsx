import React from 'react';
import { Play } from 'lucide-react';
import { Movie, TVShow } from '../types';
import { getImageUrl } from '../utils/api';

interface MediaCardProps {
  item: Movie | TVShow;
  type: 'movie' | 'tv';
  onClick: () => void;
}

export default function MediaCard({ item, type, onClick }: MediaCardProps) {
  const title = type === 'movie' ? (item as Movie).title : (item as TVShow).name;
  const releaseDate = type === 'movie' ? (item as Movie).release_date : (item as TVShow).first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : '';

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <div className="relative overflow-hidden rounded-lg bg-gray-800 aspect-[2/3]">
        {item.poster_path ? (
          <img
            src={getImageUrl(item.poster_path)}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-400 text-sm text-center px-2">Nessuna immagine</span>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="text-black text-xl ml-1" size={24} />
          </div>
        </div>

        {/* Rating badge */}
        {item.vote_average > 0 && (
          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-semibold">
            {item.vote_average.toFixed(1)}
          </div>
        )}
      </div>

      {/* Title and year (optional, can be removed for cleaner look) */}
      <div className="mt-2 px-1">
        <h3 className="text-white text-sm font-medium line-clamp-1">{title}</h3>
        {year && (
          <p className="text-gray-400 text-xs">{year}</p>
        )}
      </div>
    </div>
  );
}
