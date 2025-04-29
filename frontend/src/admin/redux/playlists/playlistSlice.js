import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import playlistService from "./playlistService";

// Action bất đồng bộ để lấy danh sách playlist
export const fetchPlaylists = createAsyncThunk(
  "playlists/fetchPlaylists",
  async (_, thunkAPI) => {
    try {
      return await playlistService.getPlaylists();
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

// Action bất đồng bộ để thêm playlist
export const addPlaylist = createAsyncThunk(
  "playlists/addPlaylist",
  async (playlistData, thunkAPI) => {
    try {
      return await playlistService.createPlaylist(playlistData);
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

// Action bất đồng bộ để cập nhật playlist
export const updatePlaylist = createAsyncThunk(
  "playlists/updatePlaylist",
  async ({ id, playlistData }, thunkAPI) => {
    try {
      return await playlistService.updatePlaylist(id, playlistData);
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

// Action bất đồng bộ để xóa playlist
export const deletePlaylist = createAsyncThunk(
  "playlists/deletePlaylist",
  async (id, thunkAPI) => {
    try {
      await playlistService.deletePlaylist(id);
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
  playlists: [],
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const playlistSlice = createSlice({
  name: "playlists",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Playlists
      .addCase(fetchPlaylists.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.playlists = action.payload;
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add Playlist
      .addCase(addPlaylist.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addPlaylist.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.playlists.push(action.payload);
      })
      .addCase(addPlaylist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Update Playlist
      .addCase(updatePlaylist.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updatePlaylist.fulfilled, (state, action) => {
        state.status = "succeeded";
        const index = state.playlists.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.playlists[index] = action.payload;
        }
      })
      .addCase(updatePlaylist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete Playlist
      .addCase(deletePlaylist.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deletePlaylist.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.playlists = state.playlists.filter(
          (p) => p.id !== action.payload
        );
      })
      .addCase(deletePlaylist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { reset } = playlistSlice.actions;
export default playlistSlice.reducer;
