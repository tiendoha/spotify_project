import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";
export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {

    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();

    const [tracks, setTracks] = useState([]);
    const [track, setTrack] = useState(null);
    const [playStatus, setPlayerStatus] = useState(false);
    const [time, setTime] = useState({
        currentTime: {
            second: 0,
            minute: 0
        },
        totalTime: {
            second: 0,
            minute: 0
        }
    })
    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const tracksRes = await axios.get('http://127.0.0.1:8000/api/tracks/');
                setTracks(tracksRes.data);
                setTrack(tracksRes.data[0]);
            } catch (error) {
                console.error('Error fetching tracks:', error);
            }
        };
        fetchTracks();
    }, []);
    const play = () => {
        audioRef.current.play();
        setPlayerStatus(true);
    }
    const pause = () => {
        audioRef.current.pause();
        setPlayerStatus(false);
    }
    const playWithID = async (id) => {
        const selectedTrack = tracks.find(t => t.id === id);
        if (selectedTrack) {
            await setTrack(selectedTrack);
            audioRef.current.src = `http://127.0.0.1:8000/media${selectedTrack.file}`;
            await audioRef.current.play();
            setPlayerStatus(true);
        }
    };
    const previous = async () => {
        const currentIndex = tracks.findIndex(t => t.id === track.id);
        if (currentIndex > 0) {
            const prevTrack = tracks[currentIndex - 1];
            await setTrack(prevTrack);
            audioRef.current.src = `http://127.0.0.1:8000/media${prevTrack.file}`;
            await audioRef.current.play();
            setPlayerStatus(true);
        }
    };
    const next = async () => {
        const currentIndex = tracks.findIndex(t => t.id === track.id);
        if (currentIndex < tracks.length - 1) {
            const nextTrack = tracks[currentIndex + 1];
            await setTrack(nextTrack);
            audioRef.current.src = `http://127.0.0.1:8000/media${nextTrack.file}`;
            await audioRef.current.play();
            setPlayerStatus(true);
        }
    };
    const seekSong = async (e) => {
        audioRef.current.currentTime = ((e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audioRef.current.duration)
    }
    useEffect(() => {
        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            seekBar.current.style.width = (Math.floor(audio.currentTime / audio.duration * 100)) + "%";
            setTime({
                currentTime: {
                    second: Math.floor(audio.currentTime % 60),
                    minute: Math.floor(audio.currentTime / 60),
                },
                totalTime: {
                    second: Math.floor(audio.duration % 60),
                    minute: Math.floor(audio.duration / 60),
                },
            });
        };


        audio.onloadedmetadata = () => {
            audio.ontimeupdate = handleTimeUpdate;
        };

        return () => {
            audio.ontimeupdate = null;
            audio.onloadedmetadata = null;
        };
    }, [audioRef, track]);

    const contextValue = {
        audioRef,
        seekBg,
        seekBar,
        track, setTrack,
        playStatus, setPlayerStatus,
        time, setTime,
        play, pause, playWithID, previous, next,
        seekSong, tracks
    }

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    )

}
export default PlayerContextProvider;