import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SearchUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Xử lý tìm kiếm
  const handleSearch = async () => {
    if (!token) {
      setError("Vui lòng đăng nhập để tìm kiếm.");
      navigate("/login");
      return;
    }

    if (!searchTerm.trim()) {
      setError("Vui lòng nhập tên người dùng để tìm kiếm.");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8000/api/search/${searchTerm}/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setResults(response.data);
      setError("");
    } catch (err) {
      setError("Không tìm thấy người dùng nào.");
      setResults([]);
      console.error(err);
    }
  };

  return (
    <div className="search-users-container">
      <h3>Tìm kiếm người dùng</h3>
      <div className="search-input">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Nhập tên người dùng..."
        />
        <button onClick={handleSearch}>Tìm kiếm</button>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && <p className="error">{error}</p>}

      {/* Danh sách người dùng */}
      <div className="search-results">
        {results.map((profile) => (
          <div
            key={profile.id}
            className="user-item"
            onClick={() => navigate(`/messages/${profile.user.id}`)}
            style={{ cursor: "pointer" }}
          >
            <img
              src={profile.profile_image || "/default_image.jpg"}
              alt="Profile"
              className="profile-image"
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
            <span className="username">{profile.user.username}</span>
            <span className="message-icon">✉️</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchUsers;