import { createContext, useEffect, useRef, useState, useCallback, useMemo, useContext } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

export const TrackContext = createContext();
export const PlaybackContext = createContext();

const AudioComponent = () => {
    const { audioRef } = useContext(PlaybackContext);
    return <audio ref={audioRef} preload="auto" />;
};

export const PlayerContextProvider = ({ children }) => {
    const audioRef = useRef(new Audio());
    const [tracks, setTracks] = useState([]);
    const [artists, setArtists] = useState([]);
    const [musicVideos, setMusicVideos] = useState([]);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [musicVideo, setMusicVideo] = useState(null);
    const [playNext, setPlayNext] = useState(() => () => { });
    const [playPrevious, setPlayPrevious] = useState(() => () => { });
    const [queue, setQueue] = useState([]);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const tracksResponse = await axios.get("/api/tracks/");
                setTracks(tracksResponse.data);

                const artistsResponse = await axios.get("/api/artists/");
                setArtists(artistsResponse.data);

                const mvResponse = await axios.get("/api/music-videos/");
                const mvs = mvResponse.data;
                const formattedMVs = Array.isArray(mvs)
                    ? mvs.map(mv => ({
                        ...mv,
                        video_url: `/media${mv.video_file}`,
                    }))
                    : [];
                setMusicVideos(formattedMVs);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to fetch tracks or music videos!", {
                    position: "bottom-right",
                    autoClose: 3000,
                });
            }
        };
        fetchTracks();
    }, []);

    const getArtistName = (artistId) => {
        const artist = artists.find(a => a.id === artistId);
        return artist ? artist.name : "Unknown Artist";
    };

    const findMVbyId = useCallback(
        (trackId) => {
            if (!trackId) return null;

            const mv = musicVideos.find(mv => mv.track === trackId || mv.track === Number(trackId)) || null;
            setMusicVideo(mv);
            return mv;
        },
        [musicVideos]
    );

    const play = useCallback(() => {
        if (audioRef.current && currentTrack) {
            audioRef.current
                .play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch((error) => {
                    console.error("Error playing track:", error);
                    setIsPlaying(false);
                    toast.error("Failed to play the track!", {
                        position: "bottom-right",
                        autoClose: 3000,
                    });
                });
        }
    }, [currentTrack]);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    const playTrackById = useCallback(
        (id) => {
            const track = tracks.find(t => t.id === id);
            if (track && audioRef.current) {
                // Reset queue if track is not in current queue
                if (queue.length > 0 && !queue.find(t => t.id === id)) {
                    setQueue([]);
                    toast.info("Playing from global tracks, queue reset!", {
                        position: "bottom-right",
                        autoClose: 3000,
                    });
                }

                // Add current track to history before switching, unless it's the same track
                if (currentTrack && currentTrack.id !== track.id) {
                    setHistory(prev => [...prev, currentTrack]);
                }

                setCurrentTrack(track);
                audioRef.current.src = `/media${track.file}`;
                audioRef.current.load();
                audioRef.current
                    .play()
                    .then(() => setIsPlaying(true))
                    .catch((error) => {
                        console.error("Error playing track:", error);
                        setIsPlaying(false);
                        toast.error("Failed to play the track!", {
                            position: "bottom-right",
                            autoClose: 3000,
                        });
                    });
            } else {
                toast.error("Track not found!", {
                    position: "bottom-right",
                    autoClose: 3000,
                });
            }
        },
        [tracks, queue, currentTrack]
    );

    const playPreviousTrack = useCallback(() => {
        if (history.length > 0 && audioRef.current) {
            const prevTrack = history[history.length - 1];
            // Remove the track from history
            setHistory(prev => prev.slice(0, -1));
            setCurrentTrack(prevTrack);
            audioRef.current.src = `/media${prevTrack.file}`;
            audioRef.current.load();
            audioRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch((error) => {
                    console.error("Error playing previous track:", error);
                    setIsPlaying(false);
                    toast.error("Failed to play the previous track!", {
                        position: "bottom-right",
                        autoClose: 3000,
                    });
                });
        } else {
            toast.info("No previous track in history!", {
                position: "bottom-right",
                autoClose: 3000,
            });
        }
    }, [history]);

    const previous = useCallback(() => {
        playPreviousTrack();
    }, [playPreviousTrack]);

    const next = useCallback(() => {
        if (queue && queue.length > 0) {
            const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
            let nextTrack;

            if (isShuffling) {
                const availableTracks = queue.filter(t => t.id !== currentTrack?.id);
                if (availableTracks.length === 0) {
                    toast.info("Only one track in queue, cannot shuffle!", {
                        position: "bottom-right",
                        autoClose: 3000,
                    });
                    return;
                }
                const randomIndex = Math.floor(Math.random() * availableTracks.length);
                nextTrack = availableTracks[randomIndex];
            } else if (currentIndex >= 0 && currentIndex < queue.length - 1) {
                nextTrack = queue[currentIndex + 1];
            } else {
                nextTrack = queue[0];
            }

            if (nextTrack && audioRef.current) {
                // Add current track to history
                if (currentTrack && currentTrack.id !== nextTrack.id) {
                    setHistory(prev => [...prev, currentTrack]);
                }
                setCurrentTrack(nextTrack);
                audioRef.current.src = `/media${nextTrack.file}`;
                audioRef.current.load();
                audioRef.current
                    .play()
                    .then(() => setIsPlaying(true))
                    .catch((error) => {
                        console.error("Error playing next track from queue:", error);
                        setIsPlaying(false);
                        toast.error("Failed to play the next track!", {
                            position: "bottom-right",
                            autoClose: 3000,
                        });
                    });
            }
        } else {
            if (!tracks || tracks.length === 0) {
                toast.error("No tracks available to play!", {
                    position: "bottom-right",
                    autoClose: 3000,
                });
                return;
            }

            let currentIndex = -1;
            if (currentTrack) {
                currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
            }

            let nextTrack;
            if (isShuffling) {
                const availableTracks = tracks.filter(t => t.id !== currentTrack?.id);
                if (availableTracks.length === 0) {
                    toast.info("Only one track available, cannot shuffle!", {
                        position: "bottom-right",
                        autoClose: 3000,
                    });
                    return;
                }
                const randomIndex = Math.floor(Math.random() * availableTracks.length);
                nextTrack = availableTracks[randomIndex];
            } else {
                if (currentIndex === -1) {
                    nextTrack = tracks[0];
                } else if (currentIndex < tracks.length - 1) {
                    nextTrack = tracks[currentIndex + 1];
                } else {
                    nextTrack = tracks[0];
                }
            }

            if (nextTrack && audioRef.current) {
                // Add current track to history
                if (currentTrack && currentTrack.id !== nextTrack.id) {
                    setHistory(prev => [...prev, currentTrack]);
                }
                setCurrentTrack(nextTrack);
                audioRef.current.src = `/media${nextTrack.file}`;
                audioRef.current.load();
                audioRef.current
                    .play()
                    .then(() => setIsPlaying(true))
                    .catch((error) => {
                        console.error("Error playing next track from global tracks:", error);
                        setIsPlaying(false);
                        toast.error("Failed to play the next track!", {
                            position: "bottom-right",
                            autoClose: 3000,
                        });
                    });
            } else {
                toast.error("No next track available!", {
                    position: "bottom-right",
                    autoClose: 3000,
                });
            }
        }
    }, [tracks, currentTrack, isShuffling, queue]);

    useEffect(() => {
        const handleEnded = () => {
            if (isLooping) {
                audioRef.current.currentTime = 0;
                audioRef.current
                    .play()
                    .then(() => setIsPlaying(true))
                    .catch((error) => {
                        console.error("Error looping track:", error);
                        setIsPlaying(false);
                    });
            } else {
                next();
            }
        };
        const audio = audioRef.current;
        audio.addEventListener("ended", handleEnded);
        return () => audio.removeEventListener("ended", handleEnded);
    }, [isLooping, next]);

    const toggleLoop = useCallback(() => {
        setIsLooping(prev => !prev);
        if (audioRef.current) {
            audioRef.current.loop = !isLooping;
        }
    }, [isLooping]);

    const toggleShuffle = useCallback(() => {
        setIsShuffling(prev => !prev);
    }, []);

    const setContextQueue = useCallback((newQueue) => {
        setQueue(newQueue || []);
    }, []);

    const trackContextValue = useMemo(
        () => ({
            tracks,
            currentTrack,
            playTrackById,
            getArtistName,
            musicVideo,
            findMVbyId,
        }),
        [tracks, currentTrack, playTrackById, artists, findMVbyId, musicVideo]
    );

    const playbackContextValue = useMemo(
        () => ({
            audioRef,
            isPlaying,
            play,
            pause,
            previous,
            next,
            isLooping,
            toggleLoop,
            isShuffling,
            toggleShuffle,
            playNext,
            playPrevious,
            setPlayNext,
            setPlayPrevious,
            queue,
            setContextQueue,
            history,
            playPreviousTrack,
        }),
        [
            audioRef,
            isPlaying,
            play,
            pause,
            previous,
            next,
            isLooping,
            toggleLoop,
            isShuffling,
            toggleShuffle,
            playNext,
            playPrevious,
            queue,
            setContextQueue,
            history,
            playPreviousTrack,
        ]
    );

    return (
        <TrackContext.Provider value={trackContextValue}>
            <PlaybackContext.Provider value={playbackContextValue}>
                {children}
                <AudioComponent />
            </PlaybackContext.Provider>
        </TrackContext.Provider>
    );
};