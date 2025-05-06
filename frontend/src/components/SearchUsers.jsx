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

  // G chiamati mặc định khi load
  useEffect(() => {
    if (!token) return;
    fetchRecentConversations();
  }, [token]);

  // Nếu searchTerm thay đổi
  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm]);

  const fetchRecentConversations = async () => {
    try {
      const response = await axios.get("/api/search/", {
        headers: { Authorization: `Token ${token}` },
      });
      setRecentMessages(response.data);
      if (!searchTerm.trim()) {
        setFilteredResults(response.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách người nhắn tin gần đây", err);
      setError("Không thể tải danh sách người dùng");
    }
  };

  const handleSearch = async (term) => {
    try {
      const response = await axios.get(
        `/api/search/${term}/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setFilteredResults(response.data);
    } catch (err) {
      console.error("Lỗi khi tìm kiếm người dùng", err);
      setError("Không thể tìm kiếm người dùng");
    }
  };

  const displayedUsers = filteredResults;

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
        {displayedUsers.length > 0 ? (
          displayedUsers.map((profile) => (
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
              <span>
                {profile.user.username}
                {profile.user.id === 27 && " (MusicBot)"}
              </span>
              <span style={{ marginLeft: "auto" }}>✉️</span>
            </div>
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
};

export default SearchUsers;