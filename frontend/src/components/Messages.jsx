import React, { useState } from "react";
import axios from "axios";
import MessageDetail from "./MessageDetail";

const Messages = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const token = localStorage.getItem("token");
  const currentUserId = parseInt(localStorage.getItem("user_id"));

  // Tìm kiếm người dùng
  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/search/${term}/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // Chọn người dùng để hiển thị hội thoại
  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4">
      {/* Cột trái: Ô tìm kiếm + danh sách người dùng */}
      <div className="w-full lg:w-3/10 bg-gray-900 p-4 rounded">
        <h2 className="text-xl font-bold mb-4">Conversations</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search for users..."
          className="w-full p-2 mb-4 bg-gray-800 text-white rounded"
        />
        {searchResults.length > 0 ? (
          <ul className="space-y-2 max-h-[60vh] overflow-auto">
            {searchResults.map((result) => (
              <li
                key={result.user.id}
                onClick={() => handleUserSelect(result.user.id)}
                className={`p-2 rounded cursor-pointer ${
                  selectedUserId === result.user.id
                    ? "bg-green-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                {result.user.username}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">Search to start a conversation</p>
        )}
      </div>
      {/* Cột phải: MessageDetail */}
      <div className="w-full lg:w-7/10">
        {currentUserId && selectedUserId ? (
          <MessageDetail
            currentUserId={currentUserId}
            otherUserId={selectedUserId}
            token={token}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;