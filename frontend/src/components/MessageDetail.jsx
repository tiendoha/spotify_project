import React, { useState, useEffect } from "react";
import axios from "axios";

const MessageDetail = ({ currentUserId, otherUserId, token }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUserId || !otherUserId) return;
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/messages/${currentUserId}/${otherUserId}/`
        );
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [currentUserId, otherUserId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/send-message/`,
        {
          sender: currentUserId,
          receiver: otherUserId,
          content: newMessage,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setMessages([...messages, { sender: currentUserId, content: newMessage }]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="h-full bg-gray-900 p-4 rounded flex flex-col">
      <h2 className="text-xl font-bold mb-4">Conversation</h2>
      <div className="flex-1 overflow-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.sender === currentUserId ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-2 rounded ${
                msg.sender === currentUserId ? "bg-green-600" : "bg-gray-700"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
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