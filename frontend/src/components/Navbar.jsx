import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { TrackContext } from '../context/PlayerContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { playTrackById } = useContext(TrackContext);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [profile, setProfile] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Fetch profile information from API based on user_id
  useEffect(() => {
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    if (userId && token) {
      fetch(`/api/profiles/${userId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(data => setProfile(data))
        .catch(err => console.error('Error fetching profile:', err));
    }
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    setProfile(null);
    window.location.reload();
  };

  // Handle "Coming Soon" toast for buttons
  const handleComingSoon = () => {
    toast.info("Coming Soon", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleSearch = async (query, type = '', genre = '') => {
    setSearchQuery(query);
    setError(null);

    if (query.length > 0) {
      try {
        let url = `/api/search/?q=${encodeURIComponent(query)}`;
        if (type) url += `&type=${type}`;
        if (genre) url += `&genre=${genre}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.log('Error response:', errorData);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError(`Unable to load search results: ${error.message}`);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    if (searchQuery) {
      handleSearch(searchQuery, type, filterGenre);
    }
  };

  const handleFilterGenreChange = (genre) => {
    setFilterGenre(genre);
    if (searchQuery) {
      handleSearch(searchQuery, filterType, genre);
    }
  };

  // Generate avatar from the first letter of username if no profile_image
  const getInitialAvatar = (username) => {
    if (!username) return 'https://via.placeholder.com/30';
    const initial = username.charAt(0).toUpperCase();
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Crect width='30' height='30' fill='%232D2D2D'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='14' font-family='Arial'%3E${initial}%3C/text%3E%3C/svg%3E`;
  };

  // Check login status and play track
  const handlePlayOrPrompt = (trackId) => {
    const token = localStorage.getItem('token');
    if (token) {
      playTrackById(trackId);
    } else {
      setShowLoginPrompt(true);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="dark"
        toastStyle={{ backgroundColor: "#181818", color: "#22c55e", border: "1px solid #22c55e" }}
      />
      <div className="w-full flex justify-between items-center font-semibold relative">
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <img
            onClick={() => navigate(-1)}
            className="w-8 bg-gradient-to-r from-gray-800 to-gray-900 p-2 rounded-full cursor-pointer hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-sm"
            src={assets.arrow_left}
            alt="Back"
          />
          <img
            onClick={() => navigate(1)}
            className="w-8 bg-gradient-to-r from-gray-800 to-gray-900 p-2 rounded-full cursor-pointer hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-sm"
            src={assets.arrow_right}
            alt="Forward"
          />
        </div>

        {/* Search bar and other buttons */}
        <div className="flex items-center gap-4">
          {/* Search bar */}
          <div className="relative flex items-center">
            {/* Search icon and input */}
            <div className="relative flex items-center">
              <img
                className="w-5 h-5 absolute left-3 cursor-pointer text-gray-400"
                src={assets.search_icon}
                alt="Search"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value, filterType, filterGenre)}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search for songs, artists, albums..."
                className={`pl-10 pr-4 py-2 rounded-full text-sm text-white placeholder-gray-400 bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 focus:border-green-500 focus:outline-none transition-all duration-300 shadow-sm ${isSearchOpen ? 'w-64 opacity-100' : 'w-32 opacity-50'
                  } md:w-80`}
              />
            </div>

            {/* Search results dropdown */}
            {isSearchOpen && (searchResults.length > 0 || error || (searchQuery.length > 0 && searchResults.length === 0)) && (
              <div className="absolute top-12 right-0 w-64 md:w-80 max-h-96 bg-gray-900 rounded-xl shadow-2xl z-10 flex flex-col transform transition-all duration-300 animate-slideDown">
                {/* Content type filters */}
                <div className="flex gap-2 p-2 border-b border-gray-800">
                  <button
                    onClick={() => handleFilterTypeChange('')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm ${filterType === '' ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg.wp-gray-600'
                      }`}
                  >
                    <span className="text-teal-400 text-sm">🌐</span> All
                  </button>
                  <button
                    onClick={() => handleFilterTypeChange('song')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm ${filterType === 'song' ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    <span className="text-teal-400 text-sm">♪</span> Songs
                  </button>
                  <button
                    onClick={() => handleFilterTypeChange('artist')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm ${filterType === 'artist' ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    <span className="text-teal-400 text-sm">👤</span> Artists
                  </button>
                  <button
                    onClick={() => handleFilterTypeChange('album')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm ${filterType === 'album' ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    <span className="text-teal-400 text-sm">💿</span> Albums
                  </button>
                </div>
                {/* Genre filters (only for Songs) */}
                {filterType === 'song' && (
                  <div className="flex gap-2 p-2 border-b border-gray-800">
                    <button
                      onClick={() => handleFilterGenreChange('')}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm ${filterGenre === '' ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      All Genres
                    </button>
                    <button
                      onClick={() => handleFilterGenreChange('pop')}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm ${filterGenre === 'pop' ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      Pop
                    </button>
                    <button
                      onClick={() => handleFilterGenreChange('rock')}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm ${filterGenre === 'rock' ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      Rock
                    </button>
                    <button
                      onClick={() => handleFilterGenreChange('jazz')}
                      className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 shadow-sm ${filterGenre === 'jazz' ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      Jazz
                    </button>
                  </div>
                )}
                {/* Display error if any */}
                {error && (
                  <p className="text-red-400 text-xs p-2">{error}</p>
                )}
                {/* Display when no results */}
                {!error && searchQuery.length > 0 && searchResults.length === 0 && (
                  <p className="text-gray-400 text-xs p-2">No results</p>
                )}
                {/* Search results */}
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.id}-${index}`}
                      className="p-2 hover:bg-gray-800 cursor-pointer flex items-center gap-2 transition-colors duration-200"
                      onClick={() => {
                        if (result.type === 'song') {
                          handlePlayOrPrompt(result.id); // Check login before playing
                        } else {
                          navigate(`/${result.type}/${result.id}`); // Navigate for artists and albums
                        }
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      {/* Icon representing type */}
                      <div className="w-5 h-5 flex items-center justify-center">
                        {result.type === 'song' && (
                          <span className="text-teal-400 text-base">♪</span>
                          // If you have icons in assets, you can replace with:
                          // <img src={assets.song_icon} alt="Song" className="w-5 h-5" />
                        )}
                        {result.type === 'artist' && (
                          <span className="text-teal-400 text-base">👤</span>
                          // If you have icons: <img src={assets.artist_icon} alt="Artist" className="w-5 h-5" />
                        )}
                        {result.type === 'album' && (
                          <span className="text-teal-400 text-base">💿</span>
                          // If you have icons: <img src={assets.album_icon} alt="Album" className="w-5 h-5" />
                        )}
                      </div>
                      {/* Result content */}
                      <div>
                        {result.type === 'song' && (
                          <>
                            <p className="font-bold text-white text-sm">{result.title || 'Unknown Song'}</p>
                            <p className="text-xs text-gray-400">
                              {result.artist || 'Unknown Artist'} • {result.album || 'Single'}
                            </p>
                            {result.genre && (
                              <p className="text-xs text-gray-500">{result.genre}</p>
                            )}
                          </>
                        )}
                        {result.type === 'artist' && (
                          <p className="font-bold text-white text-sm">{result.name || 'Unknown Artist'}</p>
                        )}
                        {result.type === 'album' && (
                          <>
                            <p className="font-bold text-white text-sm">{result.title || 'Unknown Album'}</p>
                            <p className="text-xs text-gray-400">{result.artist || 'Unknown Artist'}</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Other buttons */}
          <p
            onClick={handleComingSoon}
            className="bg-gradient-to-r from-gray-200 to-gray-300 text-black text-sm px-4 py-1 rounded-full hidden md:block cursor-pointer hover:from-gray-300 hover:to-gray-400 transition-all duration-200 shadow-sm"
          >
            Explore Premium
          </p>
          <p
            onClick={handleComingSoon}
            className="bg-gradient-to-r from-gray-800 to-gray-900 text-white text-sm px-4 py-1 rounded-full cursor-pointer hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-sm"
          >
            Install App
          </p>
          {profile ? (
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img
                  src={profile.profile_image ? profile.profile_image : getInitialAvatar(profile.user.username)}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                />
                <p className="text-sm text-white">{profile.user.username}</p>
              </div>
              {isDropdownOpen && (
                <div className="absolute top-12 right-0 w-40 bg-gray-800 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => navigate('/edit-profile')}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-t-md"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 rounded-b-md"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-gray-200 to-gray-300 text-black text-sm px-4 py-1 rounded-full hidden md:block cursor-pointer hover:from-gray-300 hover:to-gray-400 transition-all duration-200 shadow-sm"
            >
              Login
            </p>
          )}
        </div>
      </div>

      {/* Login prompt */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
            <p>You need to log in to play music. Would you like to log in?</p>
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Log in
              </button>
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs below */}
      <div className="flex items-center gap-2 mt-4">
        <p className="bg-gradient-to-r from-gray-200 to-gray-300 text-black px-4 py-1 rounded-full cursor-pointer hover:from-gray-300 hover:to-gray-400 transition-all duration-200 shadow-sm">
          All
        </p>
        <p
          onClick={handleComingSoon}
          className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-1 rounded-full cursor-pointer hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-sm"
        >
          Music
        </p>
        <p
          onClick={handleComingSoon}
          className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-1 rounded-full cursor-pointer hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-sm"
        >
          Podcasts
        </p>
      </div>

      {/* Custom CSS for scrollbar and animation */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2a2a2a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a4a4a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6a6a6a;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Navbar;