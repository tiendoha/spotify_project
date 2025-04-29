import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import followerService from "./followerService";

// Lấy danh sách followers
export const fetchFollowers = createAsyncThunk(
  "followers/fetchFollowers",
  async (_, thunkAPI) => {
    try {
      return await followerService.getFollowers();
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

// Thêm follower
export const addFollower = createAsyncThunk(
  "followers/addFollower",
  async (followerData, thunkAPI) => {
    try {
      return await followerService.addFollower(followerData);
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

// Xóa follower
export const deleteFollower = createAsyncThunk(
  "followers/deleteFollower",
  async (id, thunkAPI) => {
    try {
      await followerService.deleteFollower(id);
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
  followers: [],
  status: "idle",
  error: null,
};

const followerSlice = createSlice({
  name: "followers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Followers
      .addCase(fetchFollowers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.followers = action.payload;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Add Follower
      .addCase(addFollower.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addFollower.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.followers.push(action.payload);
      })
      .addCase(addFollower.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Delete Follower
      .addCase(deleteFollower.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteFollower.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.followers = state.followers.filter(
          (f) => f.id !== action.payload
        );
      })
      .addCase(deleteFollower.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { reset } = followerSlice.actions;
export default followerSlice.reducer;
