import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/users/`;

// Lấy danh sách người dùng
const getUsers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Tạo người dùng mới
const createUser = async (userData) => {
  const response = await axios.post(API_URL, userData);
  return response.data;
};

// Cập nhật người dùng
const updateUser = async (id, userData) => {
  const response = await axios.put(`${API_URL}${id}/`, userData);
  return response.data;
};

// Xóa người dùng
const deleteUser = async (id) => {
  const response = await axios.delete(`${API_URL}${id}/`);
  return response.data;
};

export default { getUsers, createUser, updateUser, deleteUser };
