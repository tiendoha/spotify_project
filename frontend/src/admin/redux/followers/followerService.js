import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/followers/`;

// Lấy danh sách followers
const getFollowers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Thêm follower
const addFollower = async (followerData) => {
  const response = await axios.post(API_URL, followerData);
  return response.data;
};

// Xóa follower
const deleteFollower = async (id) => {
  await axios.delete(`${API_URL}${id}/`);
  return id;
};

export default { getFollowers, addFollower, deleteFollower };
