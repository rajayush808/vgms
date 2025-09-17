import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { gameLibraryAPI } from "../services/api";
import GameCard from "../components/GameCard";

export default function Library() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchLibrary();
    }
  }, [user, activeTab, sortBy]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        status: activeTab === 'all' ? undefined : activeTab,
        sortBy: getSortField(sortBy),
        order: 'DESC'
      };
      
      const data = await gameLibraryAPI.getUserLibrary(filters);
      setLibrary(data.games || []);
    } catch (err) {
      console.error('Error fetching library:', err);
      setError('Failed to load your library');
    } finally {
      setLoading(false);
    }
  };

  const getSortField = (sortType) => {
    switch (sortType) {
      case 'name':
        return 'game_name';
      case 'rating':
        return 'personal_rating';
      case 'playtime':
        return 'playtime_hours';
      default:
        return 'updated_date';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'playing':
        return 'bg-blue-600';
      case 'wishlist':
        return 'bg-purple-600';
      case 'paused':
        return 'bg-yellow-600';
      case 'dropped':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'playing':
        return 'Currently Playing';
      case 'completed':
        return 'Completed';
      case 'wishlist':
        return 'Wishlist';
      case 'paused':
        return 'Paused';
      case 'dropped':
        return 'Dropped';
      default:
        return status;
    }
  };

  const renderStars = (rating) => {
    if (!rating) return <span className="text-gray-500">Not rated</span>;
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-400'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Handle game updates from GameCard component
  const handleGameUpdate = (updatedGame) => {
    setLibrary(prevLibrary => 
      prevLibrary.map(game => 
        game.id === updatedGame.id ? { ...game, ...updatedGame } : game
      )
    );
  };

  const handleGameRemove = (gameId) => {
    setLibrary(prevLibrary => 
      prevLibrary.filter(game => game.id !== gameId)
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your library</h1>
          <a href="/login" className="text-blue-400 hover:text-blue-300">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Game Library</h1>
          <p className="text-gray-400">Manage your game collection and track your progress</p>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Tabs */}
          <div className="flex bg-gray-800 rounded-lg p-1">
            {[
              { key: 'all', label: 'All Games' },
              { key: 'playing', label: 'Currently Playing' },
              { key: 'completed', label: 'Completed' },
              { key: 'paused', label: 'Paused' },
              { key: 'wishlist', label: 'Wishlist' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
          >
            <option value="recent">Recently Updated</option>
            <option value="name">Name (A-Z)</option>
            <option value="rating">Highest Rated</option>
            <option value="playtime">Most Played</option>
          </select>

          <button
            onClick={fetchLibrary}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Games Grid */}
        {!loading && !error && (
          <>
            {library.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {library.map((game) => (
                  <GameCard
                    key={game.id}
                    game={{
                      id: game.rawg_id,
                      name: game.game_name,
                      background_image: game.game_image,
                      genres: game.genres ? game.genres.split(', ').map(g => ({ name: g })) : [],
                      released: game.release_date,
                      rating: game.average_rating
                    }}
                    userGame={game}
                    onGameUpdate={handleGameUpdate}
                    onGameRemove={handleGameRemove}
                    showManagementButtons={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-gray-400 text-xl mb-4">No games found</div>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'all' ? 'Start building your library by searching for games!' :
                   `No games in your ${activeTab} list yet.`}
                </p>
                <a 
                  href="/games"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Browse Games
                </a>
              </div>
            )}
          </>
        )}

        {/* Library Stats */}
        {library.length > 0 && (
          <div className="mt-8 bg-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Library Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{library.length}</p>
                <p className="text-sm text-gray-400">Total Games</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {library.filter(g => g.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-300">
                  {library.filter(g => g.status === 'playing').length}
                </p>
                <p className="text-sm text-gray-400">Playing</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {library.filter(g => g.status === 'wishlist').length}
                </p>
                <p className="text-sm text-gray-400">Wishlist</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {Math.round(library.reduce((sum, g) => sum + (g.playtime_hours || 0), 0))}h
                </p>
                <p className="text-sm text-gray-400">Total Playtime</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
