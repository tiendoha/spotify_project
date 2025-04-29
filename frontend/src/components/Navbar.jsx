import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const Navbar = () => {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterGenre, setFilterGenre] = useState('');

  const handleSearch = async (query, type = '', genre = '') => {
    setSearchQuery(query);
    setError(null);

    if (query.length > 0) {
      try {
        let url = `http://localhost:8000/api/search/?q=${encodeURIComponent(query)}`;
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
        setError(`Không thể tải kết quả tìm kiếm: ${error.message}`);
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

  return (
    <>
      <div className="w-full flex justify-between items-center font-semibold relative">
        {/* Nút điều hướng bên trái */}
        <div className="flex items-center gap-2">
          <img
            onClick={() => navigate(-1)}
            className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
            src={assets.arrow_left}
            alt="Back"
          />
          <img
            onClick={() => navigate(1)}
            className="w-8 bg-black p-2 rounded-2xl cursor-pointer"
            src={assets.arrow_right}
            alt="Forward"
          />
        </div>

        {/* Thanh tìm kiếm và các nút bên phải */}
        <div className="flex items-center gap-4">
          {/* Thanh tìm kiếm */}
          <div className="relative flex items-center">
            <img
              className="w-6 cursor-pointer mr-2"
              src={assets.search_icon}
              alt="Search"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            />
            {isSearchOpen && (
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value, filterType, filterGenre)}
                  placeholder="Tìm bài hát, ca sĩ, album..."
                  className="w-64 p-2 rounded-2xl bg-[#2a2a2a] text-white border-none focus:outline-none placeholder-gray-400 text-sm"
                />
                {(searchResults.length > 0 || error) && (
                  <div className="absolute top-12 right-0 w-80 max-h-96 bg-[#1a1a1a] rounded-lg shadow-lg z-10 flex flex-col">
                    {/* Bộ lọc loại nội dung */}
                    <div className="flex gap-2 p-3 border-b border-gray-700">
                      <button
                        onClick={() => handleFilterTypeChange('')}
                        className={`px-3 py-1 rounded-2xl text-sm ${filterType === '' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => handleFilterTypeChange('song')}
                        className={`px-3 py-1 rounded-2xl text-sm ${filterType === 'song' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white'}`}
                      >
                        Songs
                      </button>
                      <button
                        onClick={() => handleFilterTypeChange('artist')}
                        className={`px-3 py-1 rounded-2xl text-sm ${filterType === 'artist' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white'}`}
                      >
                        Artists
                      </button>
                      <button
                        onClick={() => handleFilterTypeChange('album')}
                        className={`px-3 py-1 rounded-2xl text-sm ${filterType === 'album' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white'}`}
                      >
                        Albums
                      </button>
                    </div>
                    {/* Bộ lọc thể loại (chỉ hiển thị khi chọn Songs) */}
                    {filterType === 'song' && (
                      <div className="flex gap-2 p-3 border-b border-gray-700">
                        <button
                          onClick={() => handleFilterGenreChange('')}
                          className={`px-3 py-1 rounded-2xl text-sm ${filterGenre === '' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white'}`}
                        >
                          All Genres
                        </button>
                        <button
                          onClick={() => handleFilterGenreChange('pop')}
                          className={`px-3 py-1 rounded-2xl text-sm ${filterGenre === 'pop' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white'}`}
                        >
                          Pop
                        </button>
                        <button
                          onClick={() => handleFilterGenreChange('rock')}
                          className={`px-3 py-1 rounded-2xl text-sm ${filterGenre === 'rock' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white'}`}
                        >
                          Rock
                        </button>
                        <button
                          onClick={() => handleFilterGenreChange('jazz')}
                          className={`px-3 py-1 rounded-2xl text-sm ${filterGenre === 'jazz' ? 'bg-white text-black' : 'bg-[#2a2a2a] text-white'}`}
                        >
                          Jazz
                        </button>
                      </div>
                    )}
                    {/* Hiển thị lỗi nếu có */}
                    {error && (
                      <p className="text-red-500 text-sm p-3">{error}</p>
                    )}
                    {/* Kết quả tìm kiếm */}
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="p-3 hover:bg-[#2a2a2a] cursor-pointer flex items-center gap-3"
                          onClick={() => {
                            navigate(`/${result.type}/${result.id}`);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                            setSearchResults([]);
                          }}
                        >
                          <div>
                            {result.type === 'song' && (
                              <>
                                <p className="font-bold text-white text-sm">{result.title}</p>
                                <p className="text-xs text-gray-400">
                                  {result.artist} • {result.album || 'Single'}
                                </p>
                                {result.genre && (
                                  <p className="text-xs text-gray-500">{result.genre}</p>
                                )}
                              </>
                            )}
                            {result.type === 'artist' && (
                              <p className="font-bold text-white text-sm">{result.name}</p>
                            )}
                            {result.type === 'album' && (
                              <>
                                <p className="font-bold text-white text-sm">{result.title}</p>
                                <p className="text-xs text-gray-400">{result.artist}</p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Các nút khác */}
          <p className="bg-white text-black text-[15px] px-4 py-1 rounded-2xl hidden md:block cursor-pointer">
            Explore Premium
          </p>
          <p className="bg-black py-1 px-3 rounded-2xl text-[15px] cursor-pointer">
            Install App
          </p>
          <p
            onClick={() => navigate('/login')}
            className="bg-white text-black text-[15px] px-4 py-1 rounded-2xl hidden md:block cursor-pointer"
          >
            Login
          </p>
        </div>
      </div>

      {/* Tabs bên dưới */}
      <div className="flex items-center gap-2 mt-4">
        <p className="bg-white text-black px-4 py-1 rounded-2xl cursor-pointer">All</p>
        <p className="bg-black px-4 py-1 rounded-2xl cursor-pointer">Music</p>
        <p className="bg-black px-4 py-1 rounded-2xl cursor-pointer">Podcasts</p>
      </div>
    </>
  );
};

export default Navbar;