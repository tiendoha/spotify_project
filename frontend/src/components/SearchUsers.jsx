import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SearchUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [recentMessages, setRecentMessages] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Gọi mặc định khi load hoặc searchTerm rỗng
  useEffect(() => {
    if (!token) return;
    fetchRecentConversations();
  }, []);

  // Nếu searchTerm thay đổi
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredResults([]);
    } else {
      handleSearch(searchTerm);
    }
  }, [searchTerm]);

  const fetchRecentConversations = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/search/", {
        headers: { Authorization: `Token ${token}` },
      });
      setRecentMessages(response.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách người nhắn tin gần đây", err);
    }
  };

  const handleSearch = async (term) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/search/${term}/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setFilteredResults(response.data);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm người dùng", err);
    }
  };

  const displayedUsers =
    searchTerm.trim() === "" ? recentMessages : filteredResults;

  return (
    <div className="search-users-container">
      <h3>Conversations</h3>
      <div className="search-input">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for users..."
        />
      </div>

      {/* Danh sách kết quả */}
      <div className="search-results">
        {displayedUsers.map((profile) => (
          <div
            key={profile.user.id}
            className="user-item"
            onClick={() => navigate(`/messages/${profile.user.id}`)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", marginBottom: "10px" }}
          >
            <img
              src={profile.profile_image || "/default_image.jpg"}
              alt="Profile"
              style={{ width: "40px", height: "40px", borderRadius: "50%", marginRight: "10px" }}
            />
            <span>{profile.user.username}</span>
            <span style={{ marginLeft: "auto" }}>✉️</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchUsers;
