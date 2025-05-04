import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import { assets } from '../assets/assets';
import { TrackContext, PlaybackContext } from '../context/PlayerContext';

const DisplayAlbum = () => {
    const { id } = useParams();
    const [album, setAlbum] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [artist, setArtist] = useState(null);
    const [queue, setQueue] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const { playTrackById } = useContext(TrackContext);
    const { setContextQueue, setPlayNext, setPlayPrevious } = useContext(PlaybackContext);
    const navigate = useNavigate();
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const albumRes = await axios.get(`http://127.0.0.1:8000/api/albums/${id}/`);
                const artistRes = await axios.get(`http://127.0.0.1:8000/api/artists/${albumRes.data.artist}/`);
                setArtist(artistRes.data);
                const tracksRes = await axios.get('http://127.0.0.1:8000/api/tracks/');
                setAlbum(albumRes.data);

                const albumTracks = tracksRes.data.filter(track => track.album === parseInt(id));
                setTracks(albumTracks);
                setQueue(albumTracks);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();

        return () => {
            setContextQueue([]);
        };
    }, [id, setContextQueue]);

    useEffect(() => {
        if (tracks.length > 0) {
            setContextQueue(tracks);
        }
    }, [tracks, setContextQueue]);

    useEffect(() => {
        setPlayNext(() => playNext);
        setPlayPrevious(() => playPrevious);
    }, [queue, currentTrackIndex, setPlayNext, setPlayPrevious]);

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

    if (!album) {
        return (
            <>
                <Navbar />
                <div className="mt-10 text-white">Loading...</div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="mt-10 flex gap-8 flex-col md:flex-row md:items-end">
                <img className="w-48 rounded" src={`http://127.0.0.1:8000/media${album.image}`} alt={album.name} />
                <div className="flex flex-col">
                    <p>Album</p>
                    <h2 className="text-5xl font-bold mb-4 md:text-7xl">{album.name}</h2>
                    <h4>{album.release_date}</h4>
                    <p className="mt-1">
                        <img className="inline-block w-5" src={`http://127.0.0.1:8000/media${artist.image}`} alt={artist.name} />
                        <b> {artist.name} </b>
                        • <b>{tracks.length} songs, </b>
                        {calculateTotalDuration()}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 mt-10 mb-4 pl-2 text-[#a7a7a7]">
                <p><b className="mr-4">#</b>Title</p>
                <p>Artist</p>
                <p className="hidden sm:block">Release Date</p>
                <img className="m-auto w-4" src={assets.clock_icon} alt="" />
            </div>
            <hr />
            {tracks.map((item, index) => (
                <div
                    onClick={() => handlePlayOrPrompt(item.id)}
                    key={item.id}
                    className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2 items-center text-[#a7a7a7] hover:bg-[#ffffff2b] cursor-pointer"
                >
                    <p className="text-white">
                        <b className="mr-4 text-[#a7a7a7]">{index + 1}</b>
                        <img className="inline w-10 mr-5" src={`http://127.0.0.1:8000/media${item.image}`} alt="" />
                        {item.name}
                    </p>
                    <p className="text-[15px]">{artist.name}</p>
                    <p className="text-[15px] hidden sm:block">{album.release_date}</p>
                    <p className="text-[15px] text-center">{item.duration}</p>
                </div>
            ))}

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
        </>
    );
};

export default DisplayAlbum;