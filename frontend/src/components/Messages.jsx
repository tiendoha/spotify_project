import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchInbox = async () => {
      if (!token || !currentUserId) {
        setError("Vui lòng đăng nhập để xem tin nhắn.");
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:8000/api/inbox/${currentUserId}/`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        console.log("Dữ liệu từ API /inbox:", response.data);
        setConversations(response.data);
        setError("");
      } catch (err) {
        setError("Không thể tải danh sách tin nhắn.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, [currentUserId, token, navigate]);

  // Xử lý tìm kiếm người dùng
  const handleSearch = async () => {
    if (!token) {
      setError("Vui lòng đăng nhập để tìm kiếm.");
      navigate("/login");
      return;
    }

    if (!searchTerm.trim()) {
      setSearchResults([]);
      setError("");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8000/api/search/${searchTerm}/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setSearchResults(response.data);
      setError("");
    } catch (err) {
      setError("Không tìm thấy người dùng nào.");
      setSearchResults([]);
      console.error(err);
    }
  };

  // Điều hướng đến MessageDetail
  const handleUserSelect = (userId) => {
    setSearchTerm(""); // Xóa ô tìm kiếm
    setSearchResults([]); // Ẩn kết quả tìm kiếm
    navigate(`/messages/${userId}`); // Chuyển đến MessageDetail
  };

  const getOtherUser = (message) => {
    const senderId = typeof message.sender === "object" ? message.sender.id : message.sender;
    const receiverId = typeof message.receiver === "object" ? message.receiver.id : message.receiver;
    return senderId === parseInt(currentUserId) ? receiverId : senderId;
  };

  const getOtherProfile = (message) => {
    return message.sender.id === parseInt(currentUserId)
      ? message.receiver_profile
      : message.sender_profile;
  };

  const getOtherEmail = (message) => {
    return message.sender.id === parseInt(currentUserId)
      ? message.receiver.username
      : message.sender.username;
  };

  return (
    <div className="flex h-screen bg-gray-100 md:w-96 bg-white border-r border-gray-200 overflow-y-auto p-2.5">
      <h2 className="text-xl font-semibold text-gray-900 p-5 border-b border-gray-200">Tin nhắn</h2>
      {error && <p className="text-red-600 text-center p-2.5">{error}</p>}
      {loading && <p className="text-center text-gray-500 p-5">Đang tải...</p>}
      <div className="py-2.5 w-full">
        {/* Ô tìm kiếm người dùng */}
        <div className="px-5 pb-2.5">
          <div className="flex items-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch();
              }}
              placeholder="Tìm kiếm người dùng..."
              className="flex-1 border-0 bg-gray-100 rounded-full p-2.5 px-3.5 text-sm focus:outline-none focus:bg-gray-200"
            />
          </div>
          {/* Kết quả tìm kiếm */}
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-md">
              {searchResults.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center p-2.5 rounded-lg transition-colors hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleUserSelect(profile.user.id)}
                >
                  <img
                    src={
                      profile.profile_image
                        ? `http://localhost:8000/media${profile.profile_image}`
                        : "/default_image.jpg"
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover mr-2.5"
                  />
                  <span className="text-sm font-semibold text-gray-900">
                    {profile.user.username}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danh sách hội thoại */}
        <h3 className="text-base font-semibold text-gray-500 px-5 pb-2.5">Danh sách hội thoại</h3>
        <div className="conversation-list">
          {/* Thêm div cho chatbot */}
          <div
            className="flex items-center p-5 rounded-lg transition-colors hover:bg-gray-100 cursor-pointer"
            onClick={() => navigate("/messages/bot")}
          >
            <img
              src="/bot_avatar.jpg"
              alt="MusicBot"
              className="w-10 h-10 rounded-full object-cover mr-2.5"
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-gray-900">MusicBot</span>
              <p className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis mt-0.5">
                Hỏi tôi về nhạc nhé!
              </p>
            </div>
          </div>
          {/* Danh sách hội thoại người dùng thực */}
          {conversations.length === 0 && !loading && (
            <p className="text-center text-gray-500 p-5">Chưa có tin nhắn nào.</p>
          )}
          {conversations.map((message) => {
            const otherUserId = getOtherUser(message);
            const otherProfile = getOtherProfile(message);
            const otherEmail = getOtherEmail(message);
            return (
              <div
                key={message.id}
                className="flex items-center p-5 rounded-lg transition-colors hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  if (otherUserId) {
                    navigate(`/messages/${otherUserId}`);
                  } else {
                    console.error("otherUserId không hợp lệ:", message);
                  }
                }}
              >
                <img
                  src={
                    otherProfile.profile_image
                      ? `http://localhost:8000/media${otherProfile.profile_image}`
                      : "/default_image.jpg"
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover mr-2.5"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-gray-900">
                    {otherEmail || "Unknown"}
                  </span>
                  <p className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis mt-0.5">
                    {message.content}
                  </p>
                  <span className="text-xs text-gray-500">
                    {moment(message.sent_at).fromNow()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Messages;