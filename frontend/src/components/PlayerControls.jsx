import React, { useContext } from "react";
import { PlaybackContext } from "../context/PlayerContext";

const PlayerControls = ({ playPrevious, playNext }) => {
    const {
        isPlaying,
        play,
        pause,
        isLooping,
        toggleLoop,
        isShuffling,
        toggleShuffle,
        queue,
        playPreviousTrack,
        next,
    } = useContext(PlaybackContext);

    const handlePrevious = () => {
        if (queue && queue.length > 0 && typeof playPrevious === "function") {
            playPrevious();
        } else {
            playPreviousTrack();
        }
    };

    const handleNext = () => {
        if (queue && queue.length > 0 && typeof playNext === "function") {
            playNext();
        } else {
            next();
        }
    };

    return (
        <div className="flex gap-6 items-center">
            {/* Shuffle */}
            <div className="relative group">
                <i
                    onClick={toggleShuffle}
                    className={`fas fa-shuffle w-5 h-5 flex items-center justify-center cursor-pointer transition-all duration-200 ${isShuffling ? "text-green-400 opacity-100" : "text-white opacity-70 hover:opacity-100"
                        }`}
                ></i>
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                    Shuffle
                </span>
            </div>

            {/* Previous */}
            <div className="relative group">
                <i
                    onClick={handlePrevious}
                    className="fas fa-step-backward w-5 h-5 flex items-center justify-center cursor-pointer text-white opacity-70 hover:opacity-100 transition-opacity duration-200"
                ></i>
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                    Previous
                </span>
            </div>

            {/* Play/Pause */}
            <div className="relative group">
                {isPlaying ? (
                    <i
                        onClick={pause}
                        className="fas fa-pause w-5 h-5 flex items-center justify-center cursor-pointer rounded-full text-white hover:scale-110 transition-transform duration-200"
                    ></i>
                ) : (
                    <i
                        onClick={play}
                        className="fas fa-play w-5 h-5 flex items-center justify-center cursor-pointer rounded-full text-white hover:scale-110 transition-transform duration-200"
                    ></i>
                )}
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                    {isPlaying ? "Pause" : "Play"}
                </span>
            </div>

            {/* Next */}
            <div className="relative group">
                <i
                    onClick={handleNext}
                    className="fas fa-step-forward w-5 h-5 flex items-center justify-center cursor-pointer text-white opacity-70 hover:opacity-100 transition-opacity duration-200"
                ></i>
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                    Next
                </span>
            </div>

            {/* Loop */}
            <div className="relative group">
                <i
                    onClick={toggleLoop}
                    className={`fas fa-repeat w-5 h-5 flex items-center justify-center cursor-pointer transition-all duration-200 ${isLooping ? "text-green-400 opacity-100" : "text-white opacity-70 hover:opacity-100"
                        }`}
                ></i>
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2">
                    Loop
                </span>
            </div>
        </div>
    );
};

export default React.memo(PlayerControls);