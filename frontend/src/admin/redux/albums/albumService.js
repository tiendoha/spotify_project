import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/albums/`;

// Lấy danh sách album
const getAlbums = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Tạo album mới
const createAlbum = async (albumData) => {
  const response = await axios.post(API_URL, albumData);
  return response.data;
};

// Cập nhật thông tin album
const updateAlbum = async (id, albumData) => {
  const response = await axios.put(`${API_URL}${id}/`, albumData);
  return response.data;
};

// Xóa album
const deleteAlbum = async (id) => {
  await axios.delete(`${API_URL}${id}/`);
  return id;
};

export default { getAlbums, createAlbum, updateAlbum, deleteAlbum };
