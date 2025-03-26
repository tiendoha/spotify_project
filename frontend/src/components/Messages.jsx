import React, { useState, useEffect } from 'react';
import './style/Message.css';
import useAxios from '../utils/useAxios';
import jwtDecode from 'jwt-decode';
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';

function Messages() { // Đổi tên function thành Messages để phù hợp với file
  const baseURL = 'http://127.0.0.1:8000/api';
  const [messages, setMessages] = useState([]);
  const [newSearch, setNewSearch] = useState({ search: '' }); // Sửa tên biến cho rõ ràng
  const axios = useAxios();
  const navigate = useNavigate(); // Thay useHistory bằng useNavigate

  // Lấy và giải mã token
  const token = localStorage.getItem('authTokens');
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;
  const username = decoded.username;

  // Lấy danh sách tin nhắn khi component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${baseURL}/inbox/${user_id}/`);
        setMessages(res.data);
        console.log(res.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  }, [axios, user_id]); // Thêm dependencies vào useEffect

  // Xử lý thay đổi input tìm kiếm
  const handleSearchChange = (event) => {
    setNewSearch({
      ...newSearch,
      [event.target.name]: event.target.value,
    });
  };

  // Tìm kiếm người dùng
  const searchUser = async () => {
    try {
      const res = await axios.get(`${baseURL}/search/${newSearch.search}/`);
      if (res.data.length === 0) {
        alert('User does not exist');
      } else {
        navigate(`/search/${newSearch.search}/`);
      }
    } catch (error) {
      alert('User does not exist');
      console.error('Search error:', error);
    }
  };

  return (
    <div>
      <main className="content" style={{ marginTop: '150px' }}>
        <div className="container p-0">
          <h1 className="h3 mb-3">Messages</h1>
          <div className="card">
            <div className="row g-0">
              <div className="col-12 col-lg-5 col-xl-3 border-right">
                <div className="px-4">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1 d-flex align-items-center mt-2">
                      <input
                        type="text"
                        className="form-control my-3"
                        placeholder="Search..."
                        onChange={handleSearchChange}
                        name="search" // Đổi name thành "search" để khớp với state
                      />
                      <button
                        className="ml-2"
                        onClick={searchUser}
                        style={{ border: 'none', borderRadius: '50%' }}
                      >
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                </div>
                {messages.map((message) => (
                  <Link
                    key={message.id}
                    to={`/inbox/${
                      message.sender === user_id
                        ? message.receiver
                        : message.sender
                    }/`}
                    className="list-group-item list-group-item-action border-0"
                  >
                    <small>
                      <div className="badge bg-success float-right text-white">
                        {moment.utc(message.sent_at).local().fromNow()}
                      </div>
                    </small>
                    <div className="d-flex align-items-start">
                      {message.sender !== user_id && (
                        <img
                          src={
                            message.sender_profile.profile_image ||
                            'https://bootdey.com/img/Content/avatar/avatar3.png'
                          }
                          className="rounded-circle mr-1"
                          alt={message.sender_profile.user}
                          width={40}
                          height={40}
                        />
                      )}
                      {message.sender === user_id && (
                        <img
                          src={
                            message.receiver_profile.profile_image ||
                            'https://bootdey.com/img/Content/avatar/avatar1.png'
                          }
                          className="rounded-circle mr-1"
                          alt={message.receiver_profile.user}
                          width={40}
                          height={40}
                        />
                      )}
                      <div className="flex-grow-1 ml-3">
                        {message.sender === user_id
                          ? message.receiver_profile.user // Hiển thị username của receiver
                          : message.sender_profile.user}  // Hiển thị username của sender
                        <div className="small">
                          <small>{message.content}</small>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                <hr className="d-block d-lg-none mt-1 mb-0" />
              </div>
              <div className="col-12 col-lg-7 col-xl-9">
                <div className="py-2 px-4 border-bottom d-none d-lg-block">
                  <div className="d-flex align-items-center py-1">
                    <div className="position-relative">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar3.png"
                        className="rounded-circle mr-1"
                        alt="Placeholder"
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="flex-grow-1 pl-3">
                      <strong>Select a conversation</strong>
                      <div className="text-muted small">
                        <em>No one selected</em>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="position-relative">
                  <div className="chat-messages p-4">
                    {/* Placeholder - Có thể thêm logic để hiển thị tin nhắn chi tiết sau */}
                    <p>Select a conversation to start chatting.</p>
                  </div>
                </div>
                <div className="flex-grow-0 py-3 px-4 border-top">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your message"
                      disabled // Tạm thời disable vì chưa có logic gửi
                    />
                    <button className="btn btn-primary" disabled>
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Messages;