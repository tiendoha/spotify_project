import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./users/userSlice";
import profileReducer from "./profiles/profileSlice";
import artistReducer from "./artists/artistSlice";
import albumReducer from "./albums/albumSlice";
import trackReducer from "./tracks/trackSlice";
import playlistReducer from "./playlists/playlistSlice";
import playlistTrackReducer from "./playlist-tracks/playlistTrackSlice";
import followerReducer from "./followers/followerSlice";
import likeReducer from "./likes/likeSlice";
import authReducer from "./auth/authSlice";

const store = configureStore({
  reducer: {
    users: userReducer,
    profiles: profileReducer,
    artists: artistReducer,
    albums: albumReducer,
    tracks: trackReducer,
    playlists: playlistReducer,
    playlistTracks: playlistTrackReducer,
    followers: followerReducer,
    likes: likeReducer,
    auth: authReducer,
  },
});

export default store;
