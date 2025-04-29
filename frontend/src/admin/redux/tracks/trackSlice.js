import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import trackService from "./trackService";

// Lấy danh sách bài hát
export const fetchTracks = createAsyncThunk("tracks/fetchTracks", async () => {
  return await trackService.getTracks();
});

// Thêm bài hát mới
export const addTrack = createAsyncThunk(
  "tracks/addTrack",
  async (trackData) => {
    return await trackService.createTrack(trackData);
  }
);

// Cập nhật bài hát
export const updateTrack = createAsyncThunk(
  "tracks/updateTrack",
  async ({ id, trackData }) => {
    return await trackService.updateTrack(id, trackData);
  }
);

// Xóa bài hát
export const deleteTrack = createAsyncThunk(
  "tracks/deleteTrack",
  async (id) => {
    await trackService.deleteTrack(id);
    return id;
  }
);

const trackSlice = createSlice({
  name: "tracks",
  initialState: { tracks: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTracks.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTracks.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.tracks = action.payload;
      })
      .addCase(fetchTracks.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addTrack.fulfilled, (state, action) => {
        state.tracks.push(action.payload);
      })
      .addCase(updateTrack.fulfilled, (state, action) => {
        const index = state.tracks.findIndex(
          (track) => track.id === action.payload.id
        );
        if (index !== -1) {
          state.tracks[index] = action.payload;
        }
      })
      .addCase(deleteTrack.fulfilled, (state, action) => {
        state.tracks = state.tracks.filter(
          (track) => track.id !== action.payload
        );
      });
  },
});

export default trackSlice.reducer;
