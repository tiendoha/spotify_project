import React, { useState, useEffect } from "react";
import axios from "axios";
import MessageDetail from "./MessageDetail";

const Messages = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [conversationPartners, setConversationPartners] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const token = localStorage.getItem("token");
  const currentUserId = parseInt(localStorage.getItem("user_id"));
  const MEDIA_URL = "http://127.0.0.1:8000/media/";

  // Lấy danh sách lịch sử trò chuyện (polling mỗi 1 giây)
  useEffect(() => {
    const fetchConversationPartners = async () => {
      if (!token || !currentUserId) return;
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/inbox/${currentUserId}/`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        const partners = response.data
          .filter((msg) => msg.sender.id !== 27 && msg.receiver.id !== 27)
          .map((msg) => {
            const partner =
              msg.sender.id === currentUserId ? msg.receiver : msg.sender;
            const partnerProfile =
              msg.sender.id === currentUserId
                ? msg.receiver_profile
                : msg.sender_profile;
            const rawImage = partnerProfile.profile_image || "";
            const profileImage = rawImage
              ? `${MEDIA_URL}${rawImage.slice(1)}`
              : "/default_image.jpg";
            console.log(`Raw image for ${partner.username}:`, rawImage);
            console.log(`Processed image for ${partner.username}:`, profileImage);
            return {
              user: partner,
              profile_image: profileImage,
              sent_at: msg.sent_at,
              latest_message: msg.content,
            };
          });
        const uniquePartners = Array.from(
          new Map(partners.map((p) => [p.user.id, p])).values()
        ).sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
        const botProfile = {
          user: { id: 27, username: "Bot" },
          profile_image: `${MEDIA_URL}profiles/bot.png`,
          sent_at: "9999-12-31T23:59:59Z",
          latest_message: "Ask me for song recommendations!",
        };
        console.log("Bot profile image:", botProfile.profile_image);
        setConversationPartners([botProfile, ...uniquePartners]);
      } catch (error) {
        console.error("Error fetching conversation partners:", error);
      }
    };

    fetchConversationPartners();
    const interval = setInterval(fetchConversationPartners, 1000);
    return () => clearInterval(interval);
  }, [token, currentUserId]);

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
      setSearchResults(
        response.data
          .map((profile) => {
            const rawImage = profile.profile_image || "";
            const profileImage = rawImage
              ? `${MEDIA_URL}${rawImage.slice(1)}`
              : "/default_image.jpg";
            console.log(`Raw search image for ${profile.user.username}:`, rawImage);
            console.log(`Processed search image for ${profile.user.username}:`, profileImage);
            return {
              user: { id: profile.user.id, username: profile.user.username },
              profile_image: profileImage,
              sent_at: null,
              latest_message: null,
            };
          })
          .filter((result) => result.user.username.toLowerCase().includes(term.toLowerCase()))
      );
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // Chọn người dùng để hiển thị hội thoại
  const handleUserSelect = (userId) => {
    setSelectedUserId(userId);
  };

  // Hiển thị danh sách dựa trên searchTerm
  const displayedUsers = searchTerm.trim() ? searchResults : conversationPartners;

  // Rút gọn tin nhắn (giới hạn 50 ký tự)
  const truncateMessage = (message) => {
    if (!message) return "";
    return message.length > 50 ? message.slice(0, 47) + "..." : message;
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen gap-6 p-6 bg-gray-700 overflow-hidden">
      <div className="w-full lg:w-1/3 bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col">
        <h2 className="text-2xl font-semibold text-white mb-4">Conversations</h2>
        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search for users..."
            className="w-full p-3 pl-10 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <svg
            className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {displayedUsers.length > 0 ? (
          <ul className="space-y-3 h-[calc(100%-8rem)] overflow-y-auto">
            {displayedUsers.map((result) => (
              <li
                key={result.user.id}
                onClick={() => handleUserSelect(result.user.id)}
                className={`p-4 rounded-lg cursor-pointer flex items-center transition-colors duration-200 ${
                  selectedUserId === result.user.id
                    ? "bg-green-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <img
                  src={result.profile_image}
                  alt="Profile"
                  className="w-12 h-12 rounded-full mr-4 border-2 border-gray-500 object-cover"
                  onError={(e) => {
                    console.log(`Failed to load image: ${result.profile_image}`);
                    e.target.src = "/default_image.jpg";
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-white">
                      {result.user.username}
                    </span>
                    {result.user.id === 27 && (
                      <span className="ml-2 text-sm text-gray-300">
                        (MusicBot)
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {truncateMessage(result.latest_message)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-center h-[calc(100%-8rem)] flex items-center justify-center">
            No conversations yet
          </p>
        )}
      </div>
      <div className="w-full lg:w-2/3 h-full flex flex-col overflow-y-auto">
        {currentUserId && selectedUserId ? (
          <MessageDetail
            currentUserId={currentUserId}
            otherUserId={selectedUserId}
            token={token}
            className="h-full"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 bg-gray-800 rounded-xl shadow-lg">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;