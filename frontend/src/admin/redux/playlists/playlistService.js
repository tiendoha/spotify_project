import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/playlists/`;

// Lấy danh sách playlist
const getPlaylists = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Tạo playlist mới
const createPlaylist = async (playlistData) => {
  const response = await axios.post(API_URL, playlistData, {
    headers: { "Content-Type": "multipart/form-data" }, // Dùng FormData để upload image
  });
  return response.data;
};

// Cập nhật playlist
const updatePlaylist = async (id, playlistData) => {
  const response = await axios.put(`${API_URL}${id}/`, playlistData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Xóa playlist
const deletePlaylist = async (id) => {
  await axios.delete(`${API_URL}${id}/`);
  return id;
};

export default { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist };
