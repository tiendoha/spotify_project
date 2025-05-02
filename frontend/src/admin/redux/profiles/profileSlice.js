import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import profileService from "./profileService";

// Lấy danh sách hồ sơ từ API
export const fetchProfiles = createAsyncThunk(
  "profiles/fetchProfiles",
  async () => {
    return await profileService.getProfiles();
  }
);

// Thêm hồ sơ mới
export const addProfile = createAsyncThunk(
  "profiles/addProfile",
  async (profileData) => {
    return await profileService.createProfile(profileData);
  }
);

// Cập nhật hồ sơ
export const updateProfile = createAsyncThunk(
  "profiles/updateProfile",
  async ({ id, profileData }) => {
    return await profileService.updateProfile(id, profileData);
  }
);

// Xóa hồ sơ
export const deleteProfile = createAsyncThunk(
  "profiles/deleteProfile",
  async (id) => {
    await profileService.deleteProfile(id);
    return id;
  }
);

const profileSlice = createSlice({
  name: "profiles",
  initialState: { profiles: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profiles = action.payload;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addProfile.fulfilled, (state, action) => {
        state.profiles.push(action.payload);
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        const index = state.profiles.findIndex(
          (profile) => profile.user === action.payload.user
        );
        if (index !== -1) {
          state.profiles[index] = action.payload;
        }
      })
      .addCase(deleteProfile.fulfilled, (state, action) => {
        state.profiles = state.profiles.filter(
          (profile) => profile.user !== action.payload
        );
      });
  },
});

export default profileSlice.reducer;
