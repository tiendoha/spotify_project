import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/tracks/`;

// Lấy danh sách bài hát
const getTracks = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Tạo bài hát mới
const createTrack = async (trackData) => {
  const response = await axios.post(API_URL, trackData);
  return response.data;
};

// Cập nhật bài hát
const updateTrack = async (id, trackData) => {
  const response = await axios.put(`${API_URL}${id}/`, trackData);
  return response.data;
};

// Xóa bài hát
const deleteTrack = async (id) => {
  await axios.delete(`${API_URL}${id}/`);
  return id;
};

export default { getTracks, createTrack, updateTrack, deleteTrack };
