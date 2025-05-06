import React, { useContext, useState, useRef, useEffect } from "react";
import PlayerProgress from "./PlayerProgress";
import PlayerControls from "./PlayerControls";
import { TrackContext, PlaybackContext } from "../context/PlayerContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from "react-modal";

Modal.setAppElement("#root");

const Player = () => {
    const { currentTrack, getArtistName, findMVbyId, musicVideo } = useContext(TrackContext);
    const {
        audioRef,
        pause,
        isPlaying,
        play,
        playPreviousTrack,
        next,
        setPlayNext,
        setPlayPrevious,
        queue,
    } = useContext(PlaybackContext);
    const [volume, setVolume] = useState(50);
    const [isMuted, setIsMuted] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [showPlaylistPopup, setShowPlaylistPopup] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isMvModalOpen, setIsMvModalOpen] = useState(false);
    const [isInPictureInPicture, setIsInPictureInPicture] = useState(false);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const videoRef = useRef(null);

    // Set playNext and playPrevious for PlayerControls
    useEffect(() => {
        setPlayNext(() => () => next());
        setPlayPrevious(() => () => playPreviousTrack());
    }, [setPlayNext, setPlayPrevious, next, playPreviousTrack]);

    // Keyboard controls for volume
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore key events when modal is open to avoid conflicts
            if (isMvModalOpen) return;

            const audio = audioRef.current;
            if (!audio || !currentTrack) return;

            switch (e.key) {
                case "ArrowUp":
                    e.preventDefault();
                    setVolume(prev => {
                        const newVolume = Math.min(100, prev + 5);
                        audio.volume = newVolume / 100;
                        setIsMuted(newVolume === 0);
                        return newVolume;
                    });
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    setVolume(prev => {
                        const newVolume = Math.max(0, prev - 5);
                        audio.volume = newVolume / 100;
                        setIsMuted(newVolume === 0);
                        return newVolume;
                    });
                    break;
                default:
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [audioRef, currentTrack, isMvModalOpen]);

    // Fetch playlists
    const fetchPlaylists = async () => {
        try {
            const userId = parseInt(localStorage.getItem("user_id"));
            const token = localStorage.getItem("token");
            if (!userId || !token) {
                throw new Error("User ID or token not found in localStorage");
            }

            const response = await fetch("/api/playlists/", {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch playlists: ${response.statusText}`);
            }
            const data = await response.json();
            const userPlaylists = data.filter(playlist => playlist.user === userId);
            setPlaylists(userPlaylists);
        } catch (error) {
            console.error("Failed to fetch playlists:", error);
            toast.error("Failed to load playlists!", {
                position: "top-left",
                autoClose: 3000,
                icon: "🎵",
            });
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    useEffect(() => {
        if (showPlaylistPopup) {
            fetchPlaylists();
        }
    }, [showPlaylistPopup]);

    // Handle video events
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleEnterPiP = () => {
            setIsInPictureInPicture(true);
            setIsMvModalOpen(false);
            if (isVideoPlaying) {
                video.play().catch(err => console.error("Failed to resume in PiP:", err));
            }
        };

        const handleLeavePiP = () => {
            setIsInPictureInPicture(false);
            setIsMvModalOpen(true);
            if (isVideoPlaying) {
                video.play().catch(err => console.error("Failed to resume after PiP:", err));
            }
        };

        const handleEnded = () => {
            setIsVideoPlaying(false);
            setIsMvModalOpen(false);
            setIsInPictureInPicture(false);
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture().catch(err => console.error("Failed to exit PiP:", err));
            }
        };

        const handlePlay = () => {
            setIsVideoPlaying(true);
        };

        const handlePause = () => {
            setIsVideoPlaying(false);
        };

        const handleSeeking = () => {
            video.dataset.wasPlaying = isVideoPlaying ? "true" : "false";
        };

        const handleSeeked = () => {
            if (video.dataset.wasPlaying === "true") {
                video.play().catch(err => console.error("Failed to resume after seeking:", err));
            }
        };

        const handleWaiting = () => {
            if (video.dataset.wasPlaying === "true") {
                video.play().catch(err => console.error("Failed to resume after buffering:", err));
            }
        };

        const handleError = (e) => {
            console.error("Video error:", e);
            toast.error("Video playback failed!", {
                position: "bottom-right",
                autoClose: 3000,
            });
        };

        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);
        video.addEventListener("seeking", handleSeeking);
        video.addEventListener("seeked", handleSeeked);
        video.addEventListener("waiting", handleWaiting);
        video.addEventListener("error", handleError);
        video.addEventListener("ended", handleEnded);
        video.addEventListener("enterpictureinpicture", handleEnterPiP);
        video.addEventListener("leavepictureinpicture", handleLeavePiP);

        return () => {
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
            video.removeEventListener("seeking", handleSeeking);
            video.removeEventListener("seeked", handleSeeked);
            video.removeEventListener("waiting", handleWaiting);
            video.removeEventListener("error", handleError);
            video.removeEventListener("ended", handleEnded);
            video.removeEventListener("enterpictureinpicture", handleEnterPiP);
            video.removeEventListener("leavepictureinpicture", handleLeavePiP);
        };
    }, [isVideoPlaying]);

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
                icon: "🎵",
            });
            return;
        }

        setIsDownloading(true);
        const downloadUrl = `/media${currentTrack.file}`;

        try {
            const response = await fetch(downloadUrl);
            if (!response.ok) {
                throw new Error("File not found or inaccessible");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            const extension = currentTrack.file.split(".").pop() || "mp3";
            link.download = `${currentTrack.name || "track"}.${extension}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

            toast.success("Download started successfully!", {
                position: "top-left",
                autoClose: 3000,
                icon: "🎵",
            });
        } catch (error) {
            console.error("Download failed:", error);
            toast.error(`Failed to download the track: ${error.message}`, {
                position: "top-left",
                autoClose: 3000,
                icon: "🎵",
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async () => {
        const shareUrl = `/tracks/${currentTrack.id}`;
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
                    icon: "🎵",
                });
            }
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                toast.success("Link copied to clipboard!", {
                    position: "top-left",
                    autoClose: 3000,
                    icon: "🎵",
                });
            }).catch(err => {
                console.error("Failed to copy:", err);
                toast.error("Failed to copy the link!", {
                    position: "top-left",
                    autoClose: 3000,
                    icon: "🎵",
                });
            });
        }
    };

    const handleAddToPlaylist = async (playlistId) => {
        if (!currentTrack) {
            toast.error("No track selected to add to playlist!", {
                position: "top-left",
                autoClose: 3000,
                icon: "🎵",
            });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Authentication token not found!", {
                    position: "top-left",
                    autoClose: 3000,
                    icon: "🎵",
                });
                return;
            }

            const response = await fetch(`/api/playlists/${playlistId}/add_track/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify({ track_id: currentTrack.id }),
            });

            if (!response.ok) {
                let errorMessage = "Failed to add track to playlist";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                    if (errorMessage === "Track is already in the playlist") {
                        toast.error(errorMessage, {
                            position: "top-left",
                            autoClose: 3000,
                            icon: "🎵",
                        });
                        setShowPlaylistPopup(false);
                        return;
                    }
                } catch (jsonError) {
                    console.error("Non-JSON response:", await response.text());
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            toast.success("Track added to playlist successfully!", {
                position: "top-left",
                autoClose: 3000,
                icon: "🎵",
            });
        } catch (error) {
            console.error("Failed to add track to playlist:", error);
            toast.error(error.message || "Failed to add track to playlist!", {
                position: "top-left",
                autoClose: 3000,
                icon: "🎵",
            });
        } finally {
            setShowPlaylistPopup(false);
        }
    };

    const handleOpenMvModal = () => {
        if (!currentTrack) {
            toast.error("No track selected to view music video!", {
                position: "bottom-right",
                autoClose: 3000,
            });
            return;
        }

        const mv = findMVbyId(currentTrack.id);
        if (!mv) {
            toast.error("No music video available for this track!", {
                position: "bottom-right",
                autoClose: 3000,
            });
            return;
        }

        pause();
        setIsMvModalOpen(true);
        setIsVideoPlaying(true);
    };

    const handleCloseMvModal = () => {
        const video = videoRef.current;
        if (video && !video.paused) {
            video.pause();
            setIsVideoPlaying(false);
        }
        setIsMvModalOpen(false);
        setIsInPictureInPicture(false);
        if (video && document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(err => console.error("Failed to exit PiP:", err));
        }
    };

    const handlePictureInPicture = async () => {
        const video = videoRef.current;
        if (!video) return;

        try {
            if (!document.pictureInPictureEnabled) {
                toast.error("Picture-in-Picture is not supported in your browser!", {
                    position: "bottom-right",
                    autoClose: 3000,
                });
                return;
            }

            if (!document.pictureInPictureElement) {
                await video.requestPictureInPicture();
            } else {
                await document.exitPictureInPicture();
            }
        } catch (error) {
            console.error("Failed to toggle Picture-in-Picture:", error);
            toast.error("Failed to toggle Picture-in-Picture mode!", {
                position: "bottom-right",
                autoClose: 3000,
            });
        }
    };

    const handleFullscreen = () => {
        const video = videoRef.current;
        if (!video) return;

        try {
            if (!document.fullscreenElement) {
                video.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        } catch (err) {
            console.error("Failed to toggle fullscreen:", err);
            toast.error("Failed to toggle fullscreen mode!", {
                position: "bottom-right",
                autoClose: 3000,
            });
        }
    };

    const stopPropagation = (e) => {
        e.stopPropagation();
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
                        src={`/media${currentTrack.image}`}
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
                    <PlayerControls playNext={next} playPrevious={playPreviousTrack} />
                    <PlayerProgress currentTrack={currentTrack} isMvModalOpen={isMvModalOpen} />
                </div>

                <div className="hidden lg:flex items-center gap-3 opacity-90 w-1/4 max-w-[200px] justify-end relative">
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

                    <div className="relative group">
                        <i
                            onClick={handleOpenMvModal}
                            className="fas fa-video w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-100 transition-opacity duration-200"
                        ></i>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                            Music Video
                        </span>
                    </div>

                    <div className="relative group">
                        <i
                            onClick={() => setShowPlaylistPopup(true)}
                            className="fas fa-plus w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-100 transition-opacity duration-200"
                        ></i>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                            Add to Playlist
                        </span>
                    </div>

                    <div className="relative group">
                        <i
                            onClick={handleDownload}
                            className="fas fa-download w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-100 transition-opacity duration-200"
                        ></i>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                            Download
                        </span>
                    </div>

                    <div className="relative group">
                        <i
                            onClick={handleShare}
                            className="fas fa-share w-5 h-5 flex items-center justify-center cursor-pointer hover:opacity-100 transition-opacity duration-200"
                        ></i>
                        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                            Share
                        </span>
                    </div>

                    {showPlaylistPopup && (
                        <div className="absolute bottom-full right-0 mb-2 bg-gray-800 p-4 rounded shadow-lg w-48 z-20">
                            <h3 className="text-white text-sm font-semibold mb-2">Add to Playlist</h3>
                            {playlists.length > 0 ? (
                                <ul className="text-gray-400 text-sm max-h-40 overflow-y-auto">
                                    {playlists.map(playlist => (
                                        <li
                                            key={playlist.id}
                                            className="py-1 hover:text-white cursor-pointer"
                                            onClick={() => handleAddToPlaylist(playlist.id)}
                                        >
                                            {playlist.name}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400 text-sm">No playlists available</p>
                            )}
                            <button
                                onClick={() => setShowPlaylistPopup(false)}
                                className="mt-2 text-gray-400 hover:text-white text-sm"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>

                <Modal
                    isOpen={isMvModalOpen}
                    onRequestClose={handleCloseMvModal}
                    shouldFocusAfterRender={false}
                    shouldCloseOnOverlayClick={true}
                    className="bg-gradient-to-br from-green-950 to-black rounded-xl p-6 shadow-2xl border border-gray-700 transition-all duration-300 w-[calc(70vh*16/9)] h-[70vh] mx-auto mt-10"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center"
                >
                    <div className="flex flex-col items-center h-full">
                        <div className="flex justify-between items-center w-full mb-4">
                            <h2 className="text-white text-xl font-bold">
                                Music Video: {currentTrack.name || "Unknown Track"}
                            </h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePictureInPicture}
                                    className="text-gray-300 hover:text-white transition-colors"
                                    title="Picture-in-Picture"
                                >
                                    <i className="fas fa-window-restore"></i>
                                </button>
                                <button
                                    onClick={handleFullscreen}
                                    className="text-gray-300 hover:text-white transition-colors"
                                    title="Fullscreen"
                                >
                                    <i className="fas fa-expand"></i>
                                </button>
                                <button
                                    onClick={handleCloseMvModal}
                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                    title="Close"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <div
                            className="flex-1 w-full max-h-[calc(100%-4rem)] flex items-center justify-center relative aspect-[16/9]"
                            onMouseDown={stopPropagation}
                            onTouchStart={stopPropagation}
                        >
                            {musicVideo?.video_url ? (
                                <video
                                    ref={videoRef}
                                    controls
                                    autoPlay
                                    playsInline
                                    preload="auto"
                                    className="w-full h-full p-2 rounded-lg shadow-lg"
                                    src={musicVideo.video_url}
                                >
                                    <source src={musicVideo.video_url} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <p className="text-gray-400 text-center">No music video available.</p>
                            )}
                        </div>
                    </div>
                </Modal>
            </div>
        </>
    );
};

export default React.memo(Player, (prevProps, nextProps) => {
    return prevProps.currentTrack?.id === nextProps.currentTrack?.id;
});