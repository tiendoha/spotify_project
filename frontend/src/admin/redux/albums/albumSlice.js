import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import albumService from "./albumService";

// Lấy danh sách album
export const fetchAlbums = createAsyncThunk("albums/fetchAlbums", async () => {
  return await albumService.getAlbums();
});

// Thêm album mới
export const addAlbum = createAsyncThunk(
  "albums/addAlbum",
  async (albumData) => {
    return await albumService.createAlbum(albumData);
  }
);

// Cập nhật album
export const updateAlbum = createAsyncThunk(
  "albums/updateAlbum",
  async ({ id, albumData }) => {
    return await albumService.updateAlbum(id, albumData);
  }
);

// Xóa album
export const deleteAlbum = createAsyncThunk(
  "albums/deleteAlbum",
  async (id) => {
    await albumService.deleteAlbum(id);
    return id;
  }
);

const albumSlice = createSlice({
  name: "albums",
  initialState: { albums: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlbums.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAlbums.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.albums = action.payload;
      })
      .addCase(fetchAlbums.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addAlbum.fulfilled, (state, action) => {
        state.albums.push(action.payload);
      })
      .addCase(updateAlbum.fulfilled, (state, action) => {
        const index = state.albums.findIndex(
          (album) => album.id === action.payload.id
        );
        if (index !== -1) {
          state.albums[index] = action.payload;
        }
      })
      .addCase(deleteAlbum.fulfilled, (state, action) => {
        state.albums = state.albums.filter(
          (album) => album.id !== action.payload
        );
      });
  },
});

export default albumSlice.reducer;
