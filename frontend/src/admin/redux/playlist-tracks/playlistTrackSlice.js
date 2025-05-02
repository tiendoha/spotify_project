import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import playlistTrackService from "./playlistTrackService";

// Lấy danh sách playlist tracks
export const fetchPlaylistTracks = createAsyncThunk(
  "playlistTracks/fetchPlaylistTracks",
  async (_, thunkAPI) => {
    try {
      return await playlistTrackService.getPlaylistTracks();
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Thêm track vào playlist
export const addPlaylistTrack = createAsyncThunk(
  "playlistTracks/addPlaylistTrack",
  async (playlistTrackData, thunkAPI) => {
    try {
      return await playlistTrackService.addPlaylistTrack(playlistTrackData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Xóa track khỏi playlist
export const deletePlaylistTrack = createAsyncThunk(
  "playlistTracks/deletePlaylistTrack",
  async (id, thunkAPI) => {
    try {
      await playlistTrackService.deletePlaylistTrack(id);
      return id;
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  playlistTracks: [],
  status: "idle",
  error: null,
};

const playlistTrackSlice = createSlice({
  name: "playlistTracks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Playlist Tracks
      .addCase(fetchPlaylistTracks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPlaylistTracks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.playlistTracks = action.payload;
      })
      .addCase(fetchPlaylistTracks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add Playlist Track
      .addCase(addPlaylistTrack.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addPlaylistTrack.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.playlistTracks.push(action.payload);
      })
      .addCase(addPlaylistTrack.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete Playlist Track
      .addCase(deletePlaylistTrack.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deletePlaylistTrack.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.playlistTracks = state.playlistTracks.filter(
          (pt) => pt.id !== action.payload
        );
      })
      .addCase(deletePlaylistTrack.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { reset } = playlistTrackSlice.actions;
export default playlistTrackSlice.reducer;
