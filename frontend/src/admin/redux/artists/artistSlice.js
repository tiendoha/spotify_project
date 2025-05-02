import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import artistService from "./artistService";

// Lấy danh sách nghệ sĩ
export const fetchArtists = createAsyncThunk(
  "artists/fetchArtists",
  async () => {
    return await artistService.getArtists();
  }
);

// Thêm nghệ sĩ mới
export const addArtist = createAsyncThunk(
  "artists/addArtist",
  async (artistData) => {
    return await artistService.createArtist(artistData);
  }
);

// Cập nhật nghệ sĩ
export const updateArtist = createAsyncThunk(
  "artists/updateArtist",
  async ({ id, artistData }) => {
    return await artistService.updateArtist(id, artistData);
  }
);

// Xóa nghệ sĩ
export const deleteArtist = createAsyncThunk(
  "artists/deleteArtist",
  async (id) => {
    await artistService.deleteArtist(id);
    return id;
  }
);

const artistSlice = createSlice({
  name: "artists",
  initialState: { artists: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchArtists.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchArtists.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.artists = action.payload;
      })
      .addCase(fetchArtists.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addArtist.fulfilled, (state, action) => {
        state.artists.push(action.payload);
      })
      .addCase(updateArtist.fulfilled, (state, action) => {
        const index = state.artists.findIndex(
          (artist) => artist.id === action.payload.id
        );
        if (index !== -1) {
          state.artists[index] = action.payload;
        }
      })
      .addCase(deleteArtist.fulfilled, (state, action) => {
        state.artists = state.artists.filter(
          (artist) => artist.id !== action.payload
        );
      });
  },
});

export default artistSlice.reducer;
