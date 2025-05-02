import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "./userService";

// Lấy danh sách người dùng từ API
export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  return await userService.getUsers();
});

// Thêm người dùng mới
export const addUser = createAsyncThunk("users/addUser", async (userData) => {
  return await userService.createUser(userData);
});

// Cập nhật người dùng
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, userData }) => {
    return await userService.updateUser(id, userData);
  }
);

// Xóa người dùng
export const deleteUser = createAsyncThunk("users/deleteUser", async (id) => {
  await userService.deleteUser(id);
  return id;
});

const userSlice = createSlice({
  name: "users",
  initialState: { users: [], status: "idle", error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
      });
  },
});

export default userSlice.reducer;
