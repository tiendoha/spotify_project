import { createContext, useEffect, useRef, useState, useCallback, useMemo, useContext } from "react";
import axios from "axios";

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
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/tracks/");
        setTracks(response.data);
        const artistsResponse = await axios.get("http://127.0.0.1:8000/api/artists/");
        setArtists(artistsResponse.data);
        console.log("Tracks loaded:", response.data);
        console.log("Artists loaded:", artistsResponse.data);
      } catch (error) {
        console.error("Error fetching tracks or artists:", error);
      }
    };
    fetchTracks();
  }, []);

  const getArtistName = (artistId) => {
    const artist = artists.find((a) => a.id === artistId);
    return artist ? artist.name : "Unknown Artist";
  };

  const play = useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error("Play failed:", error);
          setIsPlaying(false);
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
      const track = tracks.find((t) => t.id === id);
      if (track && audioRef.current) {
        setCurrentTrack(track);
        audioRef.current.src = `http://127.0.0.1:8000/media${track.file}`;
        audioRef.current.load();
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.error("Play track failed:", error);
            setIsPlaying(false);
          });
      }
    },
    [tracks]
  );

  const previous = useCallback(() => {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
    if (currentIndex > 0 && audioRef.current) {
      const prevTrack = tracks[currentIndex - 1];
      setCurrentTrack(prevTrack);
      audioRef.current.src = `http://127.0.0.1:8000/media${prevTrack.file}`;
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error("Previous track failed:", error);
          setIsPlaying(false);
        });
    }
  }, [tracks, currentTrack]);

  const next = useCallback(() => {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack?.id);
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
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((error) => {
          console.error("Next track failed:", error);
          setIsPlaying(false);
        });
    }
  }, [tracks, currentTrack, isShuffling]);

  useEffect(() => {
    const handleEnded = () => {
      if (isLooping) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      } else {
        next();
      }
    };
    const audio = audioRef.current;
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, [isLooping, next]);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
    if (audioRef.current) {
      audioRef.current.loop = !isLooping;
    }
  }, [isLooping]);

  const toggleShuffle = useCallback(() => {
    setIsShuffling((prev) => !prev);
  }, []);

  const trackContextValue = useMemo(
    () => ({
      tracks,
      currentTrack,
      playTrackById,
      getArtistName,
    }),
    [tracks, currentTrack, playTrackById, artists]
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
    }),
    [audioRef, isPlaying, play, pause, previous, next, isLooping, toggleLoop, isShuffling]
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