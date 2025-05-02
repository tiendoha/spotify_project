import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/artists/`;

// Lấy danh sách nghệ sĩ
const getArtists = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Tạo nghệ sĩ mới
const createArtist = async (artistData) => {
  const response = await axios.post(API_URL, artistData);
  return response.data;
};

// Cập nhật thông tin nghệ sĩ
const updateArtist = async (id, artistData) => {
  const response = await axios.put(`${API_URL}${id}/`, artistData);
  return response.data;
};

// Xóa nghệ sĩ
const deleteArtist = async (id) => {
  const response = await axios.delete(`${API_URL}${id}/`);
  return response.data;
};

export default { getArtists, createArtist, updateArtist, deleteArtist };
