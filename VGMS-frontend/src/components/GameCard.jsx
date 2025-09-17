import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export default function GameCard({
  game,
  coverLink,
  name,
  playtime,
  genres,
  onClick,
  onLibraryUpdate
}) {
  const { user } = useAuth();
  const [libraryStatus, setLibraryStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    playtime_hours: 0,
    personal_rating: 0,
    notes: ''
  });

  // Check if game is in user's library
  useEffect(() => {
    if (user && game?.slug) {
      checkLibraryStatus();
    }
  }, [user, game?.slug]);

  const checkLibraryStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINT}/api/games/library/status/${game.slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setLibraryStatus(data.inLibrary ? data : null);
      if (data.inLibrary) {
        setEditData({
          status: data.status,
          playtime_hours: data.playtime_hours || 0,
          personal_rating: data.personal_rating || 0,
          notes: data.notes || ''
        });
      }
    } catch (error) {
      console.error('Error checking library status:', error);
    }
  };

  const addToLibrary = async (status = 'wishlist') => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('${API_ENDPOINT}/api/games/library/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          game_id: game.id,
          game_slug: game.slug,
          game_name: game.name,
          game_image: game.background_image,
          status: status,
          platforms: game.platforms?.map(p => p.platform.name).join(', ') || '',
          genres: game.genres?.map(g => g.name).join(', ') || ''
        })
      });

      if (response.ok) {
        await checkLibraryStatus();
        onLibraryUpdate && onLibraryUpdate();
      }
    } catch (error) {
      console.error('Error adding to library:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateGame = async () => {
    if (!user || !libraryStatus) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update status
      await fetch(`${API_ENDPOINT}/api/games/library/status/${game.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: editData.status,
          notes: editData.notes 
        })
      });

      // Update rating if provided
      if (editData.personal_rating > 0) {
        await fetch(`${API_ENDPOINT}/api/games/library/rating/${game.slug}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ rating: editData.personal_rating })
        });
      }

      // Update progress/playtime
      await fetch(`${API_ENDPOINT}/api/games/library/progress/${game.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ playtime_hours: editData.playtime_hours })
      });

      await checkLibraryStatus();
      setShowEditModal(false);
      onLibraryUpdate && onLibraryUpdate();
    } catch (error) {
      console.error('Error updating game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!user || !libraryStatus) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINT}/api/games/library/status/${game.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await checkLibraryStatus();
        onLibraryUpdate && onLibraryUpdate();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromLibrary = async () => {
    if (!user || !libraryStatus) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_ENDPOINT}/api/games/library/remove/${game.slug}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setLibraryStatus(null);
        onLibraryUpdate && onLibraryUpdate();
      }
    } catch (error) {
      console.error('Error removing from library:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'playing': return 'bg-blue-600';
      case 'paused': return 'bg-yellow-600';
      case 'dropped': return 'bg-red-600';
      default: return 'bg-purple-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'wishlist': return 'Wishlist';
      case 'playing': return 'Playing';
      case 'completed': return 'Completed';
      case 'paused': return 'Paused';
      case 'dropped': return 'Dropped';
      default: return status;
    }
  };

  return (
    <>
      <div className="relative bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors duration-200 group">
        {/* Game Image */}
        <div className="relative cursor-pointer" onClick={onClick}>
          <img
            src={coverLink}
            alt={name}
            loading="lazy"
            className="w-full h-48 object-cover"
          />
          
          {/* Playtime Badge */}
          {(playtime !== 0 || (libraryStatus?.playtime_hours > 0)) && (
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded">
              <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-300 text-xs">
                {libraryStatus?.playtime_hours || playtime}h
              </span>
            </div>
          )}

          {/* Library Status Badge */}
          {libraryStatus && (
            <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(libraryStatus.status)}`}>
              {getStatusText(libraryStatus.status)}
            </div>
          )}

          {/* Rating Badge */}
          {libraryStatus?.personal_rating > 0 && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded">
              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-yellow-400 text-xs">{libraryStatus.personal_rating}</span>
            </div>
          )}
        </div>

        {/* Game Info */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg mb-2 cursor-pointer hover:text-blue-400 transition-colors" onClick={onClick}>
            {name}
          </h3>

          {/* Genres */}
          <div className="flex flex-wrap gap-1 mb-3">
            {genres?.slice(0, 3).map((genre) => (
              <span
                key={genre.name || genre}
                className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
              >
                {genre.name || genre}
              </span>
            ))}
          </div>

          {/* Library Actions */}
          {user && (
            <div className="space-y-2">
              {!libraryStatus ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => addToLibrary('wishlist')}
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                    </svg>
                    Wishlist
                  </button>
                  <button
                    onClick={() => addToLibrary('playing')}
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Play
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {['wishlist', 'playing', 'completed', 'paused', 'dropped'].map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(status)}
                        disabled={isLoading}
                        className={`px-2 py-1 text-xs rounded transition-colors disabled:opacity-50 ${
                          libraryStatus.status === status
                            ? `${getStatusColor(status)} text-white`
                            : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                        }`}
                      >
                        {getStatusText(status)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEditModal(true)}
                      disabled={isLoading}
                      className="flex-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={removeFromLibrary}
                      disabled={isLoading}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Edit Game Details</h3>
            
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({...editData, status: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="wishlist">Wishlist</option>
                  <option value="playing">Playing</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                  <option value="dropped">Dropped</option>
                </select>
              </div>

              {/* Playtime */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Playtime (hours)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editData.playtime_hours}
                  onChange={(e) => setEditData({...editData, playtime_hours: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating (1-5 stars)</label>
                <select
                  value={editData.personal_rating}
                  onChange={(e) => setEditData({...editData, personal_rating: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="0">No Rating</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  rows="3"
                  placeholder="Add your thoughts about this game..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={updateGame}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
