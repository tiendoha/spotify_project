import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/likes/`;

// Lấy danh sách likes
const getLikes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Thêm like
const addLike = async (likeData) => {
  const response = await axios.post(API_URL, likeData);
  return response.data;
};

// Xóa like
const deleteLike = async (id) => {
  await axios.delete(`${API_URL}${id}/`);
  return id;
};

export default { getLikes, addLike, deleteLike };
