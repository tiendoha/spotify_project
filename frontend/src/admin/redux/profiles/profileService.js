import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/profiles/`;

// Lấy danh sách hồ sơ
const getProfiles = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Tạo hồ sơ mới
const createProfile = async (profileData) => {
  const response = await axios.post(API_URL, profileData);
  return response.data;
};

// Cập nhật hồ sơ
const updateProfile = async (id, profileData) => {
  const response = await axios.put(`${API_URL}${id}/`, profileData);
  return response.data;
};

// Xóa hồ sơ
const deleteProfile = async (id) => {
  const response = await axios.delete(`${API_URL}${id}/`);
  return response.data;
};

export default { getProfiles, createProfile, updateProfile, deleteProfile };
