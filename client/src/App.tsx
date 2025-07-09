import React, { useState } from 'react';
import { Switch, Route } from 'wouter';
import { Movie, TVShow } from './types';
import { AppProvider } from './contexts/AppContext';
import Header from './components/Header';
import SearchModal from './components/SearchModal';
import ProfileModal from './components/ProfileModal';
import MediaDetailsModal from './components/MediaDetailsModal';
import VideoPlayer from './components/VideoPlayer';
import Home from './pages/Home';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import MyList from './pages/MyList';
import WatchHistory from './pages/WatchHistory';

function App() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Movie | TVShow | null>(null);
  const [selectedType, setSelectedType] = useState<'movie' | 'tv'>('movie');
  const [selectedSeason, setSelectedSeason] = useState<number | undefined>();
  const [selectedEpisode, setSelectedEpisode] = useState<number | undefined>();

  const handleItemClick = (item: Movie | TVShow, type: 'movie' | 'tv') => {
    setSelectedItem(item);
    setSelectedType(type);
    setDetailsModalOpen(true);
  };

  const handlePlay = (item: Movie | TVShow, type: 'movie' | 'tv', season?: number, episode?: number) => {
    setSelectedItem(item);
    setSelectedType(type);
    setSelectedSeason(season);
    setSelectedEpisode(episode);
    setDetailsModalOpen(false);
    setVideoPlayerOpen(true);
  };

  const closeModals = () => {
    setSearchModalOpen(false);
    setProfileModalOpen(false);
    setDetailsModalOpen(false);
    setVideoPlayerOpen(false);
    setSelectedItem(null);
    setSelectedSeason(undefined);
    setSelectedEpisode(undefined);
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-black">
        <Header
          onSearchClick={() => setSearchModalOpen(true)}
          onProfileClick={() => setProfileModalOpen(true)}
        />

        <Switch>
          <Route path="/" component={() => 
            <Home onItemClick={handleItemClick} onPlay={handlePlay} />
          } />
          <Route path="/movies" component={() => 
            <Movies onItemClick={handleItemClick} />
          } />
          <Route path="/tv" component={() => 
            <TVShows onItemClick={handleItemClick} />
          } />
          <Route path="/my-list" component={() => 
            <MyList onItemClick={handleItemClick} />
          } />
          <Route path="/history" component={() => 
            <WatchHistory />
          } />
        </Switch>

        {/* Modals */}
        <SearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onItemClick={handleItemClick}
        />

        <ProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />

        <MediaDetailsModal
          item={selectedItem}
          type={selectedType}
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          onPlay={handlePlay}
        />

        <VideoPlayer
          tmdbId={selectedItem?.id || 0}
          type={selectedType}
          title={selectedType === 'movie' ? (selectedItem as Movie)?.title : (selectedItem as TVShow)?.name}
          posterPath={selectedItem?.poster_path}
          season={selectedSeason}
          episode={selectedEpisode}
          isOpen={videoPlayerOpen}
          onClose={() => setVideoPlayerOpen(false)}
        />
      </div>
    </AppProvider>
  );
}

export default App;
