import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrackContext } from '../context/PlayerContext';

const SongItem = ({ name, image, artist_name, id }) => {
    const { playTrackById } = useContext(TrackContext);
    const navigate = useNavigate();
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const baseUrl = '/media';
    const imageUrl = image ? `${baseUrl}${image}` : '';

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
            <div
                onClick={() => handlePlayOrPrompt(id)}
                className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
            >
                <img
                    className="rounded"
                    src={imageUrl}
                    alt={name}
                    onError={() => console.log(`Failed to load image for ${name}`)}
                />
                <p className="font-bold mt-2 mb-1">{name}</p>
                <p className="text-slate-200 text-sm">{artist_name}</p>
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
        </>
    );
};

export default SongItem;