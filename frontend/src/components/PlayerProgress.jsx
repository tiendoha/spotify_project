import React, { useContext, useEffect, useState } from "react";
import { PlaybackContext } from "../context/PlayerContext";

const PlayerProgress = () => {
    const { audioRef, isPlaying } = useContext(PlaybackContext);

    const [time, setTime] = useState({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 }
    });
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            if (audioRef.current) {
                const current = audioRef.current.currentTime;
                const duration = audioRef.current.duration || 0;
                setTime({
                    currentTime: {
                        second: Math.floor(current % 60),
                        minute: Math.floor(current / 60),
                    },
                    totalTime: {
                        second: Math.floor(duration % 60),
                        minute: Math.floor(duration / 60),
                    },
                });
                setProgress((current / duration) * 100 || 0);
            }
        };

        updateProgress();
        const interval = setInterval(updateProgress, 1000);
        return () => clearInterval(interval);
    }, [audioRef, isPlaying]);

    return (
        <div className="flex items-center gap-4 w-full">
            <p className="min-w-[40px] text-center text-sm text-gray-300 font-mono">
                {time.currentTime.minute}:{String(time.currentTime.second).padStart(2, "0")}
            </p>
            <div
                className="flex-1 h-2 bg-gray-700 rounded-full relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-gray-600"
                style={{ minWidth: "200px", maxWidth: "500px" }}
            >
                <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
                </div>
            </div>
            <p className="min-w-[40px] text-center text-sm text-gray-300 font-mono">
                {time.totalTime.minute}:{String(time.totalTime.second).padStart(2, "0")}
            </p>
        </div>
    );
};

export default PlayerProgress;