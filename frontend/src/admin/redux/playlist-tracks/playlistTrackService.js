import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/playlist-tracks/`;

// Lấy danh sách playlist tracks
const getPlaylistTracks = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Thêm track vào playlist
const addPlaylistTrack = async (playlistTrackData) => {
  const response = await axios.post(API_URL, playlistTrackData);
  return response.data;
};

// Xóa track khỏi playlist
const deletePlaylistTrack = async (id) => {
  await axios.delete(`${API_URL}${id}/`);
  return id;
};

export default { getPlaylistTracks, addPlaylistTrack, deletePlaylistTrack };
