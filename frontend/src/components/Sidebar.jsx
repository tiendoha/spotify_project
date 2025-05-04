import React, { useState, useEffect, useContext } from 'react';
import { assets } from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { TrackContext } from '../context/PlayerContext';
import axios from 'axios';

const Sidebar = () => {
    const navigate = useNavigate();
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
    const [playlists, setPlaylists] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [editPlaylistId, setEditPlaylistId] = useState(null);
    const [editPlaylistName, setEditPlaylistName] = useState('');
    const [editPlaylistImage, setEditPlaylistImage] = useState(null);

    // Danh sách màu ngẫu nhiên
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
        '#D4A5A5', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71'
    ];

    // Hàm lấy màu ngẫu nhiên dựa trên id
    const getColorById = (id) => {
        const index = id % colors.length;
        return colors[index];
    };

    // Fetch playlists for the logged-in user
    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('user_id');
                if (!token || !userId) return;

                const response = await axios.get('http://127.0.0.1:8000/api/playlists/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const userPlaylists = response.data.filter(playlist => playlist.user === parseInt(userId));
                setPlaylists(userPlaylists);
            } catch (error) {
                console.error('Error fetching playlists:', error);
            }
        };

        fetchPlaylists();
    }, []);

    // Check login status and create playlist
    const handleCreatePlaylist = () => {
        const token = localStorage.getItem('token');
        if (token) {
            setShowCreateModal(true);
        } else {
            setShowLoginPrompt(true);
        }
    };

    // Handle creating a new playlist
    const handleSubmitNewPlaylist = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');

        if (!token || !userId || !newPlaylistName) return;

        const playlistData = {
            name: newPlaylistName,
            user: parseInt(userId),
        };

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/playlists/', playlistData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setPlaylists([...playlists, response.data]);
            setShowCreateModal(false);
            setNewPlaylistName('');
        } catch (error) {
            console.error('Error creating playlist:', error);
            if (error.response) {
                console.log('Response data:', error.response.data);
            }
        }
    };

    // Handle editing a playlist
    const handleEditPlaylist = (playlistId, currentName) => {
        const token = localStorage.getItem('token');
        if (token) {
            setEditPlaylistId(playlistId);
            setEditPlaylistName(currentName);
            setShowEditModal(true);
        } else {
            setShowLoginPrompt(true);
        }
    };

    // Handle updating a playlist
    const handleUpdatePlaylist = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('user_id');

        if (!token || !userId || !editPlaylistId || !editPlaylistName) return;

        const playlistData = {
            name: editPlaylistName,
            user: parseInt(userId),
        };

        try {
            const response = await axios.put(`http://127.0.0.1:8000/api/playlists/${editPlaylistId}/`, playlistData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setPlaylists(playlists.map(p => p.id === editPlaylistId ? response.data : p));
            setShowEditModal(false);
            setEditPlaylistId(null);
            setEditPlaylistName('');
            setEditPlaylistImage(null);
        } catch (error) {
            console.error('Error updating playlist:', error);
            if (error.response) {
                console.log('Response data:', error.response.data);
            }
        }
    };

    // Toggle minimize/maximize and rotate arrow
    const handleToggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    return (
        <div className="w-[25%] h-full p-4 flex flex-col gap-4 text-white hidden lg:flex bg-black rounded-lg shadow-2xl">
            {/* Navigation Section */}
            <div className="h-[15%] rounded-lg bg-gradient-to-br from-black to-[#1a1a1a] p-4 flex flex-col justify-around shadow-md hover:shadow-lg transition-shadow duration-300">
                <div
                    onClick={() => navigate('/')}
                    className="flex items-center gap-3 pl-6 cursor-pointer hover:bg-[#22c55e] hover:bg-opacity-20 rounded-md p-2 transition-all duration-200"
                >
                    <i className="fas fa-home"></i>
                    <p className="font-bold text-lg">Home</p>
                </div>
                <div
                    onClick={() => navigate('/messages')}
                    className="flex items-center gap-3 pl-6 cursor-pointer hover:bg-[#22c55e] hover:bg-opacity-20 rounded-md p-2 transition-all duration-200"
                >
                    <i className="fas fa-message"></i>
                    <p className="font-bold text-lg">Messages</p>
                </div>
            </div>

            {/* Library Section */}
            <div className={`rounded-lg bg-gradient-to-br from-black to-[#1a1a1a] p-4 flex flex-col transition-all duration-700 shadow-md hover:shadow-lg ${isMinimized ? 'h-[10%]' : 'h-[85%]'}`}>
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <i className="fas fa-book"></i>
                        <p className="font-semibold text-xl">Your Library</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <img
                            className={`w-5 cursor-pointer hover:opacity-80 transform transition-transform duration-300 ${isMinimized ? 'rotate-90' : ''}`}
                            src={assets.arrow_icon}
                            alt="Toggle"
                            onClick={handleToggleMinimize}
                        />
                        <img
                            className="w-5 cursor-pointer hover:opacity-80"
                            src={assets.plus_icon}
                            alt="Add"
                            onClick={handleCreatePlaylist}
                        />
                    </div>
                </div>
                {!isMinimized && (
                    <div className="space-y-6">
                        {playlists.length > 0 ? (
                            playlists.map(playlist => (
                                <div
                                    key={playlist.id}
                                    className="p-4 bg-gradient-to-br from-[#1a1a1a] to-black m-2 rounded-lg font-semibold flex items-center gap-4 pl-6 shadow-inner hover:shadow-md transition-shadow duration-300 animate-slideDownFade cursor-pointer"
                                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                                >
                                    {playlist.image ? (
                                        <img
                                            className="w-12 h-12 rounded"
                                            src={`http://127.0.0.1:8000/media${playlist.image}`}
                                            alt={playlist.name}
                                        />
                                    ) : (
                                        <div
                                            className="w-12 h-12 rounded flex items-center justify-center text-white font-bold"
                                            style={{ backgroundColor: getColorById(playlist.id) }}
                                        >
                                            {playlist.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h1 className="text-lg">{playlist.name}</h1>
                                    </div>
                                    <i
                                        className="fas fa-edit w-5 h-5 cursor-pointer hover:opacity-80"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditPlaylist(playlist.id, playlist.name);
                                        }}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="p-4 bg-gradient-to-br from-[#1a1a1a] to-black m-2 rounded-lg font-semibold flex flex-col items-start justify-start gap-2 pl-6 shadow-inner hover:shadow-md transition-shadow duration-300 animate-slideDownFade">
                                <h1 className="text-xl">Create your first playlist</h1>
                                <p className="font-light text-gray-300">It's easy, we'll help you</p>
                                <button
                                    onClick={handleCreatePlaylist}
                                    className="px-6 py-2 bg-[#22c55e] text-black text-[15px] rounded-full mt-4 hover:bg-[#16a34a] transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Create playlist
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Login prompt */}
            {showLoginPrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg text-white">
                        <p>You need to log in to create a playlist. Would you like to log in?</p>
                        <div className="mt-4 flex justify-end gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 bg-[#22c55e] text-black rounded hover:bg-[#16a34a] transition-all duration-200"
                            >
                                Log in
                            </button>
                            <button
                                onClick={() => setShowLoginPrompt(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create playlist modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg text-white w-96">
                        <h2 className="text-xl font-semibold mb-4">Create a new playlist</h2>
                        <form onSubmit={handleSubmitNewPlaylist}>
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">Playlist name</label>
                                <input
                                    type="text"
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                                    placeholder="Enter playlist name"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#22c55e] text-black rounded hover:bg-[#16a34a] transition-all duration-200"
                                >
                                    Create
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit playlist modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#1a1a1a] p-6 rounded-lg shadow-lg text-white w-96">
                        <h2 className="text-xl font-semibold mb-4">Edit playlist</h2>
                        <form onSubmit={handleUpdatePlaylist}>
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">Playlist name</label>
                                <input
                                    type="text"
                                    value={editPlaylistName}
                                    onChange={(e) => setEditPlaylistName(e.target.value)}
                                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                                    placeholder="Enter playlist name"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">Cover image (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setEditPlaylistImage(e.target.files[0])}
                                    className="w-full p-2 bg-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#22c55e] text-black rounded hover:bg-[#16a34a] transition-all duration-200"
                                >
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-all duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Animation CSS */}
            <style>{`
                @keyframes slideDownFade {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-slideDownFade {
                    animation: slideDownFade 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Sidebar;