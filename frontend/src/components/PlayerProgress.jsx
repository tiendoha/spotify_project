import React, { useContext, useEffect, useState } from "react";
import { PlaybackContext } from "../context/PlayerContext";
import { ToastContainer, toast } from "react-toastify";

const PlayerProgress = ({ currentTrack }) => {
    const { audioRef, isPlaying } = useContext(PlaybackContext);
    const [time, setTime] = useState({
        currentTime: { second: 0, minute: 0 },
        totalTime: { second: 0, minute: 0 },
    });
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        // Reset trạng thái khi bài hát thay đổi
        setIsLoading(true);
        setTime({
            currentTime: { second: 0, minute: 0 },
            totalTime: { second: 0, minute: 0 },
        });
        setProgress(0);
        setDuration(0);

        const updateTime = () => {
            if (audio.duration) {
                const current = audio.currentTime;
                const duration = audio.duration;
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

        const updateDuration = () => {
            const duration = audio.duration || 0;
            setDuration(duration);
            setTime((prev) => ({
                ...prev,
                totalTime: {
                    second: Math.floor(duration % 60),
                    minute: Math.floor(duration / 60),
                },
            }));
            setIsLoading(false);
        };

        const handleCanPlay = () => {
            updateDuration();
        };

        const handleError = () => {
            toast.error("Failed to load the track!", {
                position: "bottom-right",
                autoClose: 3000,
            });
            setIsLoading(false);
        };

        if (audio.duration) {
            updateDuration();
        }

        audio.addEventListener("timeupdate", updateTime);
        audio.addEventListener("loadedmetadata", updateDuration);
        audio.addEventListener("canplay", handleCanPlay);
        audio.addEventListener("error", handleError);
        audio.addEventListener("ended", () => {
            setTime({
                currentTime: { second: 0, minute: 0 },
                totalTime: { second: 0, minute: 0 },
            });
            setProgress(0);
            setDuration(0);
            setIsLoading(false);
        });

        return () => {
            audio.removeEventListener("timeupdate", updateTime);
            audio.removeEventListener("loadedmetadata", updateDuration);
            audio.removeEventListener("canplay", handleCanPlay);
            audio.removeEventListener("error", handleError);
            audio.removeEventListener("ended", () => { });
        };
    }, [audioRef, currentTrack]);

    const handleSeek = (e) => {
        if (!audioRef.current || isLoading) {
            toast.warn("Please wait for the track to load before seeking!", {
                position: "bottom-right",
                autoClose: 3000,
            });
            return;
        }

        const audio = audioRef.current;
        const progressBar = e.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const clickPosition = e.clientX - rect.left;
        const progressBarWidth = rect.width;
        const seekPercentage = clickPosition / progressBarWidth;
        const seekTime = seekPercentage * audio.duration;

        audio.currentTime = seekTime;

        setTime((prev) => ({
            ...prev,
            currentTime: {
                second: Math.floor(seekTime % 60),
                minute: Math.floor(seekTime / 60),
            },
        }));
        setProgress(seekPercentage * 100);
    };

    return (
        <div className="flex items-center gap-4 w-full">
            <p className="min-w-[40px] text-center text-sm text-gray-300 font-mono">
                {time.currentTime.minute}:{String(time.currentTime.second).padStart(2, "0")}
            </p>
            <div
                className={`flex-1 h-2 bg-gray-700 rounded-full relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:bg-gray-600 ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                style={{ minWidth: "200px", maxWidth: "500px" }}
                onClick={handleSeek}
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