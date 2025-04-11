import React, { useContext, useState } from "react";
import PlayerProgress from "./PlayerProgress";
import PlayerControls from "./PlayerControls";
import { TrackContext, PlaybackContext } from "../context/PlayerContext";
import { ToastContainer, toast } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import CSS cho react-toastify

const Player = () => {
    const { currentTrack, getArtistName } = useContext(TrackContext);
    const { audioRef } = useContext(PlaybackContext);
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleVolumeChange = (e) => {
        const newVolume = e.target.value;
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100;
            setIsMuted(newVolume === 0);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            if (isMuted) {
                audioRef.current.volume = volume / 100;
                setIsMuted(false);
            } else {
                audioRef.current.volume = 0;
                setIsMuted(true);
            }
        }
    };

    const handleDownload = async () => {
        if (!currentTrack || !currentTrack.file) {
            toast.error("No track or file available to download!", {
                position: "top-left",
                autoClose: 3000,
            });
            return;
        }

        setIsDownloading(true);
        const downloadUrl = `http://127.0.0.1:8000/media${currentTrack.file}`;

        try {
            // Tải file bằng fetch
            const response = await fetch(downloadUrl);
            if (!response.ok) {
                throw new Error("File not found or inaccessible");
            }

            // Chuyển response thành Blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            // Tạo thẻ <a> để tải file
            const link = document.createElement("a");
            link.href = url;
            const extension = currentTrack.file.split(".").pop() || "mp3"; // Lấy định dạng file
            link.download = `${currentTrack.name || "track"}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Giải phóng URL object
            window.URL.revokeObjectURL(url);

            // Thông báo thành công
            toast.success("Download started successfully!", {
                position: "top-left",
                autoClose: 3000,
            });
        } catch (error) {
            console.error("Download failed:", error);
            toast.error(`Failed to download the track: ${error.message}`, {
                position: "top-left",
                autoClose: 3000,
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async () => {
        const shareUrl = `http://127.0.0.1:8000/tracks/${currentTrack.id}`;
        const shareData = {
            title: currentTrack.name,
            text: `Check out this song by ${getArtistName(currentTrack.artist)}!`,
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Share failed:", err);
                toast.error("Failed to share the track!", {
                    position: "top-left",
                    autoClose: 3000,
                });
            }
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                toast.success("Link copied to clipboard!", {
                    position: "top-left",
                    autoClose: 3000,
                });
            }).catch(err => {
                console.error("Failed to copy:", err);
                toast.error("Failed to copy the link!", {
                    position: "top-left",
                    autoClose: 3000,
                });
            });
        }
    };

    if (!currentTrack) {
        return (
            <div className="h-[10%] bg-gradient-to-r from-green-950 to-black flex justify-center items-center text-white px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2 bg-gray-900/80 rounded-lg px-4 py-2 border border-gray-700 shadow-md animate-pulse">
                    <i className="fas fa-music text-green-400 text-lg lg:text-xl"></i>
                    <p className="text-green-400 text-sm lg:text-lg font-medium">
                        No track selected - Pick a song to play!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <ToastContainer position="top-left" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
            <div className="h-[10%] bg-gradient-to-r from-green-950 to-black flex items-center text-white px-6 shadow-lg border-t border-gray-800">
                <div className="hidden lg:flex items-center gap-4 w-1/4 max-w-[250px]">
                    <img
                        className="w-14 h-14 object-cover rounded-md shadow-md transition-transform duration-300 hover:scale-105"
                        src={`http://127.0.0.1:8000/media${currentTrack.image}`}
                        alt={currentTrack.name || "Unknown"}
                    />
                    <div className="overflow-hidden">
                        <p className="text-ellipsis whitespace-nowrap overflow-hidden text-base font-semibold text-white">
                            {currentTrack.name || "Unknown Track"}
                        </p>
                        <p className="text-ellipsis whitespace-nowrap overflow-hidden text-sm text-gray-400">
                            {getArtistName(currentTrack.artist) || "Unknown Artist"}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2 flex-1 max-w-[600px] mx-auto">
                    <PlayerControls />
                    <PlayerProgress />
                </div>

                <div className="hidden lg:flex items-center gap-3 opacity-90 w-1/4 max-w-[200px] justify-end relative">
                    {/* Volume */}
                    <div
                        className="relative group flex items-center"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                    >
                        <div className="flex items-center md:">
                            <div className="relative">
                                <i
                                    onClick={toggleMute}
                                    className={`fas ${isMuted ? "fa-volume-mute" : "fa-volume-up"} w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-100 transition-opacity duration-200`}
                                ></i>
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-20">
                                    Volume
                                </span>
                            </div>
                            <div className="ml-2 mb-2 volume-slider">
                                {showVolumeSlider && (
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={volume}
                                        onChange={handleVolumeChange}
                                        className="w-24 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer"
                                        style={{
                                            background: `linear-gradient(to right, #fff ${volume}%, #4B5563 ${volume}%)`,
                                            boxShadow: "0 0.125rem 0.25rem rgba(0, 0, 0, 0.2)",
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* MV */}
                    <div className="relative group">
                        <i className="fas fa-video w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-100 transition-opacity duration-200"></i>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                            Music Video
                        </span>
                    </div>

                    {/* Queue */}
                    <div className="relative group">
                        <i className="fas fa-list w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-100 transition-opacity duration-200"></i>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                            Queue
                        </span>
                    </div>

                    {/* Add to Playlist */}
                    <div className="relative group">
                        <i
                            onClick={() => setShowPlaylistPopup(true)}
                            className="fas fa-plus w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-100 transition-opacity duration-200"
                        ></i>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                            Add to Playlist
                        </span>
                    </div>

                    {/* Download */}
                    <div className="relative group">
                        <i
                            onClick={handleDownload}
                            className="fas fa-download w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-100 transition-opacity duration-200"
                        ></i>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                            Download
                        </span>
                    </div>

                    {/* Share */}
                    <div className="relative group">
                        <i
                            onClick={handleShare}
                            className="fas fa-share w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-100 transition-opacity duration-200"
                        ></i>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                            Share
                        </span>
                    </div>

                    {/* Popup Playlist */}
                    {showPlaylistPopup && (
                        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 p-4 rounded shadow-lg w-48">
                            <h3 className="text-white text-sm font-semibold mb-2">Add to Playlist</h3>
                            <ul className="text-gray-400 text-sm">
                                <li className="py-1 hover:text-white cursor-pointer">Playlist 1</li>
                                <li className="py-1 hover:text-white cursor-pointer">Playlist 2</li>
                                <li className="py-1 hover:text-white cursor-pointer">New Playlist</li>
                            </ul>
                            <button
                                onClick={() => setShowPlaylistPopup(false)}
                                className="mt-2 text-gray-400 hover:text-white text-sm"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default React.memo(Player, (prevProps, nextProps) => {
    return prevProps.currentTrack?.id === nextProps.currentTrack?.id;
});