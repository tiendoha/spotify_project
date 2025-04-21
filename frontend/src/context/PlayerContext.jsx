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

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                // Fetch tracks
                const tracksResponse = await axios.get("http://127.0.0.1:8000/api/tracks/");
                setTracks(tracksResponse.data);

                // Fetch artists
                const artistsResponse = await axios.get("http://127.0.0.1:8000/api/artists/");
                setArtists(artistsResponse.data);

                // Fetch t?t c? MV
                const mvResponse = await axios.get("http://127.0.0.1:8000/api/music-videos/");
                const mvs = mvResponse.data;
                const formattedMVs = Array.isArray(mvs) ? mvs.map(mv => ({
                    ...mv,
                    video_url: `http://127.0.0.1:8000/media${mv.video_file}`
                })) : [];
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

    const findMVbyId = useCallback((trackId) => {
        if (!trackId) return null;

        const mv = musicVideos.find(mv => mv.track === trackId || mv.track === Number(trackId)) || null;
        setMusicVideo(mv);
        return mv;
    }, [musicVideos]);

    const play = useCallback(() => {
        if (audioRef.current && currentTrack) {
            audioRef.current.play()
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

    const playTrackById = useCallback((id) => {
        const track = tracks.find(t => t.id === id);
        if (track && audioRef.current) {
            setCurrentTrack(track);
            audioRef.current.src = `http://127.0.0.1:8000/media${track.file}`;
            audioRef.current.load();
            audioRef.current.play()
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
    }, [tracks]);

    const previous = useCallback(() => {
        const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
        if (currentIndex > 0 && audioRef.current) {
            const prevTrack = tracks[currentIndex - 1];
            setCurrentTrack(prevTrack);
            audioRef.current.src = `http://127.0.0.1:8000/media${prevTrack.file}`;
            audioRef.current.load();
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch((error) => {
                    console.error("Error playing previous track:", error);
                    setIsPlaying(false);
                    toast.error("Failed to play the previous track!", {
                        position: "bottom-right",
                        autoClose: 3000,
                    });
                });
        }
    }, [tracks, currentTrack]);

    const next = useCallback(() => {
        const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
        let nextTrack;
        if (isShuffling) {
            const randomIndex = Math.floor(Math.random() * tracks.length);
            nextTrack = tracks[randomIndex];
        } else if (currentIndex < tracks.length - 1) {
            nextTrack = tracks[currentIndex + 1];
        } else {
            nextTrack = tracks[0];
        }
        if (nextTrack && audioRef.current) {
            setCurrentTrack(nextTrack);
            audioRef.current.src = `http://127.0.0.1:8000/media${nextTrack.file}`;
            audioRef.current.load();
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch((error) => {
                    console.error("Error playing next track:", error);
                    setIsPlaying(false);
                    toast.error("Failed to play the next track!", {
                        position: "bottom-right",
                        autoClose: 3000,
                    });
                });
        }
    }, [tracks, currentTrack, isShuffling]);

    useEffect(() => {
        const handleEnded = () => {
            if (isLooping) {
                audioRef.current.currentTime = 0;
                audioRef.current.play()
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

    const trackContextValue = useMemo(() => ({
        tracks,
        currentTrack,
        playTrackById,
        getArtistName,
        musicVideo,
        findMVbyId,
    }), [tracks, currentTrack, playTrackById, artists, findMVbyId, musicVideo]);

    const playbackContextValue = useMemo(() => ({
        audioRef,
        isPlaying,
        play,
        pause,
        previous,
        next,
        isLooping,
        toggleLoop,
        isShuffling,
        toggleShuffle
    }), [audioRef, isPlaying, play, pause, previous, next, isLooping, toggleLoop, isShuffling, toggleShuffle]);

    return (
        <TrackContext.Provider value={trackContextValue}>
            <PlaybackContext.Provider value={playbackContextValue}>
                {children}
                <AudioComponent />
            </PlaybackContext.Provider>
        </TrackContext.Provider>
    );
};