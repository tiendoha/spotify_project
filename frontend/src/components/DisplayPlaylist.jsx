import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import { assets } from '../assets/assets';
import { TrackContext, PlaybackContext } from '../context/PlayerContext';

const DisplayPlaylist = () => {
    const { id } = useParams();
    const [playlist, setPlaylist] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [queue, setQueue] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const [user, setUser] = useState(null);
    const { playTrackById } = useContext(TrackContext);
    const { play, pause, isPlaying, setPlayNext, setPlayPrevious, setContextQueue } = useContext(PlaybackContext);
    const navigate = useNavigate();
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const playlistRes = await axios.get(`/api/playlists/${id}/`);
                setPlaylist(playlistRes.data);

                const userRes = await axios.get(`/api/users/${playlistRes.data.user}/`);
                setUser(userRes.data);

                const playlistTracksRes = await axios.get('/api/playlist-tracks/');
                const playlistTracks = playlistTracksRes.data
                    .filter(item => item.playlist === parseInt(id));

                const trackPromises = playlistTracks.map(async (item) => {
                    const trackRes = await axios.get(`/api/tracks/${item.track}/`);
                    const artistRes = await axios.get(`/api/artists/${trackRes.data.artist}/`);
                    return { ...trackRes.data, playlistTrackId: item.id, artistName: artistRes.data.name };
                });
                const trackDetails = await Promise.all(trackPromises);
                setTracks(trackDetails);
                setQueue(trackDetails);
                setContextQueue(trackDetails);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();

        // Cleanup khi component unmount
        return () => {
            setContextQueue([]); // Reset queue khi rời khỏi playlist
        };
    }, [id, setContextQueue]);

    useEffect(() => {
        setPlayNext(() => playNext);
        setPlayPrevious(() => playPrevious);
    }, [queue, currentTrackIndex, setPlayNext, setPlayPrevious]);

    const calculateTotalDuration = () => {
        if (!tracks.length) return '0 min';

        const totalSeconds = tracks.reduce((sum, track) => {
            const [hours, minutes, seconds] = track.duration.split(':').map(Number);
            return sum + (hours * 3600) + (minutes * 60) + seconds;
        }, 0);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours} hr ${minutes} min`;
        } else {
            return `${minutes} min ${seconds} sec`;
        }
    };

    const handlePlayOrPrompt = (trackId) => {
        const token = localStorage.getItem('token');
        if (token) {
            const index = queue.findIndex(track => track.id === trackId);
            setCurrentTrackIndex(index);
            playTrackById(trackId);
        } else {
            setShowLoginPrompt(true);
        }
    };

    const playNext = () => {
        if (currentTrackIndex < queue.length - 1) {
            const nextIndex = currentTrackIndex + 1;
            setCurrentTrackIndex(nextIndex);
            playTrackById(queue[nextIndex].id);
        } else {
            setCurrentTrackIndex(0);
            playTrackById(queue[0].id);
        }
    };

    const playPrevious = () => {
        if (currentTrackIndex > 0) {
            const prevIndex = currentTrackIndex - 1;
            setCurrentTrackIndex(prevIndex);
            playTrackById(queue[prevIndex].id);
        } else {
            const lastIndex = queue.length - 1;
            setCurrentTrackIndex(lastIndex);
            playTrackById(queue[lastIndex].id);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString || isNaN(new Date(dateString).getTime())) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleDeleteTrack = async (playlistTrackId) => {
        const token = localStorage.getItem('token');
        const currentUserId = localStorage.getItem('user_id');
        if (!token || !currentUserId || parseInt(currentUserId) !== playlist.user) {
            setShowLoginPrompt(true);
            return;
        }

        try {
            await axios.delete(`/api/playlist-tracks/${playlistTrackId}/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const updatedTracks = tracks.filter(track => track.playlistTrackId !== playlistTrackId);
            setTracks(updatedTracks);
            setQueue(updatedTracks);
            setContextQueue(updatedTracks);
        } catch (error) {
            console.error('Error deleting track:', error);
        }
    };

    const getInitialAvatar = () => {
        const initial = playlist.name.charAt(0).toUpperCase();
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
            '#D4A5A5', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71'
        ];
        const color = colors[playlist.id % colors.length];
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='224' height='224' viewBox='0 0 224 224'%3E%3Crect width='224' height='224' fill='${color}'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='100' font-family='Arial'%3E${initial}%3C/text%3E%3C/svg%3E`;
    };

    if (!playlist || !user) {
        return (
            <>
                <Navbar />
                <div className="mt-10 text-white text-center">Loading...</div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="mt-12 px-6 bg-[#121212] min-h-screen text-white">
                <div className="flex gap-8 flex-col md:flex-row md:items-end bg-[#181818] rounded-xl p-6 shadow-lg">
                    <img
                        className="w-56 h-56 rounded-lg shadow-md hover:opacity-90 transition-opacity duration-300"
                        src={playlist.image ? `/media${playlist.image}` : getInitialAvatar()}
                        alt={playlist.name}
                    />
                    <div className="flex flex-col">
                        <p className="text-sm uppercase tracking-wider text-[#1DB954]">Playlist</p>
                        <h2 className="text-4xl md:text-6xl font-extrabold mb-2">{playlist.name}</h2>
                        <p className="text-[#B3B3B3] text-sm mb-2">{formatDate(playlist.created_at)}</p>
                        <p className="text-[#B3B3B3]">
                            <span className="font-semibold text-white">{user.username}</span>
                            <span className="mx-2">•</span>
                            <span className="font-semibold">{tracks.length} songs</span>
                            <span className="mx-2">•</span>
                            <span>{calculateTotalDuration()}</span>
                        </p>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 p-4 bg-[#181818] rounded-t-xl text-[#B3B3B3] font-semibold text-sm shadow-md">
                        <p className="col-span-2"><span className="mr-4">#</span>Title</p>
                        <p>Artist</p>
                        <div className="flex justify-between items-center">
                            <img className="w-4 h-4" src={assets.clock_icon} alt="Duration" />
                            <span className="w-4 h-4"></span>
                        </div>
                    </div>
                    <hr className="border-[#282828]" />
                    <div className="bg-[#121212] rounded-b-xl shadow-md">
                        {tracks.map((item, index) => (
                            <div
                                key={item.id}
                                className="grid grid-cols-3 sm:grid-cols-4 gap-4 p-4 items-center text-[#B3B3B3] hover:bg-[#282828] rounded-lg group"
                            >
                                <p className="col-span-2 text-white flex items-center cursor-pointer" onClick={() => handlePlayOrPrompt(item.id)}>
                                    <span className="mr-4 text-[#B3B3B3] group-hover:text-[#1ed760]">{index + 1}</span>
                                    <img className="w-12 h-12 rounded-md mr-4 shadow-sm" src={`/media${item.image}`} alt="" />
                                    <span className="truncate">{item.name}</span>
                                </p>
                                <p className="text-sm truncate">{item.artistName}</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm">{item.duration}</p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTrack(item.playlistTrackId);
                                        }}
                                        className={`opacity-0 group-hover:opacity-100 text-[#FF4040] hover:text-[#FF6666] transition-opacity duration-200 ${parseInt(localStorage.getItem('user_id')) === playlist.user ? '' : 'hidden'}`}
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showLoginPrompt && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-[#181818] p-6 rounded-lg shadow-lg text-white">
                        <p>You need to log in to play music or modify the playlist. Would you like to log in?</p>
                        <div className="mt-4 flex justify-end gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 bg-[#1DB954] text-white rounded hover:bg-[#1ed760] transition-all duration-200"
                            >
                                Log in
                            </button>
                            <button
                                onClick={() => setShowLoginPrompt(false)}
                                className="px-4 py-2 bg-[#404040] text-white rounded hover:bg-[#555555] transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .bg-[#121212] { background-color: #121212; }
                .bg-[#181818] { background-color: #181818; }
                .border-[#282828] { border-color: #282828; }
                .hover\\:bg-[#282828]:hover { background-color: #282828; }
                .group:hover .group-hover\\:text-[#1ed760] { color: #1ed760; }
                .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .transition-all { transition: all 0.2s ease-in-out; }
                .hover\\:opacity-90:hover { opacity: 0.9; }
                .shadow-md { box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3); }
                .rounded-lg { border-radius: 0.5rem; }
            `}</style>
        </>
    );
};

export default DisplayPlaylist;