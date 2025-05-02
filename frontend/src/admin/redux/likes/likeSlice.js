import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import likeService from "./likeService";

// Lấy danh sách likes
export const fetchLikes = createAsyncThunk(
  "likes/fetchLikes",
  async (_, thunkAPI) => {
    try {
      return await likeService.getLikes();
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

// Thêm like
export const addLike = createAsyncThunk(
  "likes/addLike",
  async (likeData, thunkAPI) => {
    try {
      return await likeService.addLike(likeData);
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

// Xóa like
export const deleteLike = createAsyncThunk(
  "likes/deleteLike",
  async (id, thunkAPI) => {
    try {
      await likeService.deleteLike(id);
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
  likes: [],
  status: "idle",
  error: null,
};

const likeSlice = createSlice({
  name: "likes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Likes
      .addCase(fetchLikes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLikes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.likes = action.payload;
      })
      .addCase(fetchLikes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add Like
      .addCase(addLike.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addLike.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.likes.push(action.payload);
      })
      .addCase(addLike.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete Like
      .addCase(deleteLike.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteLike.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.likes = state.likes.filter((l) => l.id !== action.payload);
      })
      .addCase(deleteLike.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { reset } = likeSlice.actions;
export default likeSlice.reducer;
