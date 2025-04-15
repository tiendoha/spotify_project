import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";

const MessageDetail = () => {
  const { otherUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("user_id");

  useEffect(() => {
    const fetchMessages = async () => {
      if (!token || !currentUserId) {
        setError("Vui lòng đăng nhập để xem tin nhắn.");
        navigate("/login");
        return;
      }
      if (!otherUserId || otherUserId === "undefined") {
        setError("Không xác định được người dùng để xem tin nhắn.");
        navigate("/messages");
        return;
      }

      if (otherUserId !== "bot") {
        setLoading(true);
        try {
          const response = await axios.get(
            `http://localhost:8000/api/messages/${currentUserId}/${otherUserId}/`,
            {
              headers: { Authorization: `Token ${token}` },
            }
          );
          setMessages(response.data);
          setError("");
        } catch (err) {
          setError("Không thể tải tin nhắn.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [currentUserId, otherUserId, token, navigate]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    if (!otherUserId || (otherUserId !== "bot" && isNaN(parseInt(otherUserId)))) {
      setError("Không xác định được người nhận.");
      return;
    }
    if (!token) {
      setError("Token không hợp lệ, vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }

    console.log("Token gửi lên:", token);
    console.log("Dữ liệu gửi lên:", {
      receiver: otherUserId === "bot" ? "bot" : parseInt(otherUserId),
      content: newMessage,
    });

    try {
      if (otherUserId !== "bot") {
        await axios.post(
          "http://localhost:8000/api/send-message/",
          {
            receiver: parseInt(otherUserId),
            content: newMessage,
          },
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        const response = await axios.get(
          `http://localhost:8000/api/messages/${currentUserId}/${otherUserId}/`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        setMessages(response.data);
      } else {
        const userMessage = {
          sender: { id: Number(currentUserId), username: "You" },
          content: newMessage,
          sent_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);

        const botResponse = await axios.post(
          "http://localhost:8000/api/chatbot/",
          { message: newMessage },
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        const botReply = {
          sender: { id: "bot", username: "MusicBot" },
          content: botResponse.data.reply,
          sent_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, botReply]);
      }
      setNewMessage("");
    } catch (err) {
      setError("Không thể gửi tin nhắn.");
      console.error("Lỗi từ server:", err.response?.data || err);
    }
  };

  const otherUser =
    otherUserId === "bot"
      ? { username: "MusicBot" }
      : messages.length > 0
      ? messages[0].sender.id === parseInt(currentUserId)
        ? messages[0].receiver
        : messages[0].sender
      : null;

  const otherProfile =
    otherUserId === "bot"
      ? { profile_image: "/bot_avatar.jpg" }
      : messages.length > 0
      ? messages[0].sender.id === parseInt(currentUserId)
        ? messages[0].receiver_profile
        : messages[0].sender_profile
      : null;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {otherUser && (
        <div className="flex items-center p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
          <img
            src={
              otherProfile?.profile_image
                ? otherUserId === "bot"
                  ? otherProfile.profile_image
                  : `http://localhost:8000/media${otherProfile.profile_image}`
                : "/default_image.jpg"
            }
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover mr-3.5"
          />
          <h2 className="text-base font-semibold text-gray-900">{otherUser.username}</h2>
        </div>
      )}
      {error && <p className="text-red-600 text-center p-2.5">{error}</p>}
      {loading && <p className="text-center text-gray-500 p-5">Đang tải...</p>}
      <div className="flex-1 p-5 overflow-y-auto bg-gray-100">
        {messages.map((message) => (
          <div
            key={message.id || `${message.sent_at}-${message.content}`}
            className={`flex items-start mb-3.5 ${
              message.sender.id === parseInt(currentUserId) ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <img
              src={
                message.sender_profile?.profile_image
                  ? `http://localhost:8000/media${message.sender_profile.profile_image}`
                  : "/default_image.jpg"
              }
              alt="Profile"
              className="w-7 h-7 rounded-full object-cover mx-2.5"
            />
            <div
              className={`max-w-[60%] ${
                message.sender.id === parseInt(currentUserId)
                  ? "bg-blue-600 text-white rounded-2xl p-2.5 px-3.5"
                  : "bg-gray-200 rounded-2xl p-2.5 px-3.5"
              }`}
            >
              <span className="text-xs font-semibold mb-1.5">
                {message.sender.id === parseInt(currentUserId)
                  ? "You"
                  : message.sender.username}
              </span>
              <p className="text-sm break-words m-0">{message.content}</p>
              <span className="text-[11px] text-gray-400 mt-1.5 block text-right">
                {moment(message.sent_at).fromNow()}
              </span>
              {message.sender.id === parseInt(currentUserId) ? (
                <span className="text-[11px] text-gray-400 mt-1.5 block text-right">Đã gửi</span>
              ) : (
                message.is_read && (
                  <span className="text-[11px] text-gray-400 mt-1.5 block text-right">Đã xem</span>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="flex p-5 border-t border-gray-200 bg-white sticky bottom-0">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          className="flex-1 border-0 bg-gray-100 rounded-full p-2.5 px-3.5 text-sm mr-2.5 focus:outline-none focus:bg-gray-200"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white border-0 rounded-full p-2.5 px-5 text-sm cursor-pointer hover:bg-blue-700 transition-colors"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default MessageDetail;