import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const MessageDetail = ({ currentUserId, otherUserId, token, className }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const messagesEndRef = useRef(null); // Ref để cuộn xuống dưới cùng
  const MEDIA_URL = "http://127.0.0.1:8000/media/";

  // Hàm cuộn xuống dưới cùng
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Lấy thông tin profile của otherUserId
  useEffect(() => {
    const fetchOtherUserProfile = async () => {
      if (!otherUserId || !token) return;
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/profiles/${otherUserId}/`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        const profileImage = response.data.profile_image
          ? `${MEDIA_URL}${response.data.profile_image.slice(1)}`
          : "/default_image.jpg";
        setOtherUserProfile({
          username: response.data.user.username,
          profile_image: profileImage,
        });

      } catch (error) {
        console.error(`Error fetching profile for user ${otherUserId}:`, error);
        setOtherUserProfile({ username: "Unknown", profile_image: "/default_image.jpg" });
      }
    };

    fetchOtherUserProfile();
  }, [otherUserId, token]);

  // Lấy tin nhắn (polling mỗi 1 giây)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUserId || !otherUserId) return;

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/messages/${currentUserId}/${otherUserId}/`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );

        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, [currentUserId, otherUserId, token]);

  // Tự động cuộn xuống dưới cùng khi mở cuộc trò chuyện (otherUserId thay đổi)
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [otherUserId]);

  // Gửi tin nhắn
  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      if (otherUserId === 27) {
        // Gửi tới bot
        await axios.post(
          `http://127.0.0.1:8000/api/chat-with-bot/`,
          {
            sender: currentUserId,
            content: newMessage,
          },
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
      } else {
        // Gửi tới người dùng khác
        await axios.post(
          `http://127.0.0.1:8000/api/send-message/`,
          {
            receiver: otherUserId,
            content: newMessage,
          },
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
      }
      setNewMessage("");
      // Lấy lại tin nhắn sau khi gửi
      const response = await axios.get(
        `http://127.0.0.1:8000/api/messages/${currentUserId}/${otherUserId}/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setMessages(response.data);
      scrollToBottom(); // Cuộn xuống dưới sau khi gửi tin nhắn
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className={`h-full bg-gray-900 p-4 rounded flex flex-col ${className}`}>
      <div className="flex items-center mb-4">
        <img
          src={otherUserProfile?.profile_image || "/default_image.jpg"}
          alt="Profile"
          className="w-10 h-10 rounded-full mr-3 border-2 border-gray-500 object-cover"
          onError={(e) => {
            console.log(`Failed to load profile image: ${otherUserProfile?.profile_image}`);
            e.target.src = "/default_image.jpg";
          }}
        />
        <span className="text-xl font-bold text-white">
          {otherUserProfile?.username || "Unknown"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 ${msg.sender.id === currentUserId ? "text-right" : "text-left"
              }`}
          >
            <span
              className={`inline-block p-2 rounded ${msg.sender.id === currentUserId ? "bg-green-600" : "bg-gray-700"
                }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 bg-gray-800 text-white rounded"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-green-600 rounded hover:bg-green-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageDetail;