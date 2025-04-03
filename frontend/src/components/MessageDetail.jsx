import React, { useState, useEffect } from 'react';
import './style/Message.css';
import useAxios from '../utils/useAxios';
import jwtDecode from 'jwt-decode';
import { Link, useParams, useNavigate } from 'react-router-dom'; // Thay useHistory bằng useNavigate
import moment from 'moment';

function MessageDetail() {
  const baseURL = 'http://127.0.0.1:8000/api';
  const [messages, setMessages] = useState([]); // Danh sách tin nhắn trong inbox
  const [conversation, setConversation] = useState([]); // Tin nhắn trong cuộc hội thoại cụ thể
  const [profile, setProfile] = useState(null); // Profile của người nhận/gửi
  const [newMessage, setNewMessage] = useState({ content: '' }); // Thay message thành content để khớp models.py
  const [newSearch, setNewSearch] = useState({ search: '' }); // Tìm kiếm người dùng

  const axios = useAxios();
  const { id } = useParams(); // Lấy ID từ URL (người nhận/gửi)
  const token = localStorage.getItem('authTokens');
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;
  const navigate = useNavigate(); // Thay useHistory bằng useNavigate

  // Lấy danh sách tin nhắn trong inbox
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${baseURL}/inbox/${user_id}/`);
        setMessages(res.data);
      } catch (error) {
        console.error('Error fetching inbox:', error);
      }
    };
    fetchMessages();
  }, [axios, user_id]);

  // Lấy tin nhắn trong cuộc hội thoại với user cụ thể
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${baseURL}/get-messages/${user_id}/${id}/`);
        setConversation(res.data);
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [axios, user_id, id]);

  // Lấy thông tin profile của người nhận/gửi
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${baseURL}/profile/${id}/`);
        setProfile(res.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [axios, id]);

  // Xử lý thay đổi input tin nhắn
  const handleChange = (event) => {
    setNewMessage({
      ...newMessage,
      [event.target.name]: event.target.value,
    });
  };

  // Gửi tin nhắn
  const sendMessage = async () => {
    const formData = new FormData();
    formData.append('sender', user_id);
    formData.append('receiver', id); // Sửa reciever thành receiver
    formData.append('content', newMessage.content); // Thay message thành content
    formData.append('is_read', false);

    try {
      await axios.post(`${baseURL}/send-messages/`, formData);
      setNewMessage({ content: '' }); // Reset input sau khi gửi
      document.getElementById('text-input').value = '';
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

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
                        name="search" // Thay username thành search để đồng bộ với Messages.jsx
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
                {messages.map((msg) => (
                  <Link
                    key={msg.id}
                    to={`/inbox/${msg.sender === user_id ? msg.receiver : msg.sender}/`}
                    className="list-group-item list-group-item-action border-0"
                  >
                    <small>
                      <div className="badge bg-success float-right text-white">
                        {moment.utc(msg.sent_at).local().fromNow()}
                      </div>
                    </small>
                    <div className="d-flex align-items-start">
                      {msg.sender !== user_id && (
                        <img
                          src={
                            msg.sender_profile?.profile_image ||
                            'https://bootdey.com/img/Content/avatar/avatar3.png'
                          }
                          className="rounded-circle mr-1"
                          alt={msg.sender_username || 'Unknown'}
                          width={40}
                          height={40}
                        />
                      )}
                      {msg.sender === user_id && (
                        <img
                          src={
                            msg.receiver_profile?.profile_image ||
                            'https://bootdey.com/img/Content/avatar/avatar1.png'
                          }
                          className="rounded-circle mr-1"
                          alt={msg.receiver_username || 'Unknown'}
                          width={40}
                          height={40}
                        />
                      )}
                      <div className="flex-grow-1 ml-3">
                        {msg.sender === user_id
                          ? msg.receiver_username || 'Unknown'
                          : msg.sender_username || 'Unknown'}
                        <div className="small">
                          <small>{msg.content}</small>
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
                        src={
                          profile?.profile_image ||
                          'https://bootdey.com/img/Content/avatar/avatar3.png'
                        }
                        className="rounded-circle mr-1"
                        alt={profile?.user?.username || 'Unknown'}
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="flex-grow-1 pl-3">
                      <strong>{profile?.user?.username || 'Unknown'}</strong>
                      <div className="text-muted small">
                        <em>@{profile?.user?.username || 'Unknown'}</em>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="position-relative">
                  <div className="chat-messages p-4">
                    {conversation.map((msg) => (
                      <React.Fragment key={msg.id}>
                        {msg.sender !== user_id && (
                          <div className="chat-message-left pb-4">
                            <div>
                              <img
                                src={
                                  msg.sender_profile?.profile_image ||
                                  'https://bootdey.com/img/Content/avatar/avatar3.png'
                                }
                                className="rounded-circle mr-1"
                                alt={msg.sender_username || 'Unknown'}
                                style={{ objectFit: 'cover' }}
                                width={40}
                                height={40}
                              />
                            </div>
                            <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                              <div className="font-weight-bold mb-1">
                                {msg.sender_username || 'Unknown'}
                              </div>
                              {msg.content}
                              <br />
                              <span className="mt-3">
                                {moment.utc(msg.sent_at).local().fromNow()}
                              </span>
                            </div>
                          </div>
                        )}
                        {msg.sender === user_id && (
                          <div className="chat-message-right pb-4">
                            <div>
                              <img
                                src={
                                  msg.sender_profile?.profile_image ||
                                  'https://bootdey.com/img/Content/avatar/avatar1.png'
                                }
                                className="rounded-circle mr-1"
                                alt={msg.receiver_username || 'Unknown'}
                                style={{ objectFit: 'cover' }}
                                width={40}
                                height={40}
                              />
                              <div className="text-muted small text-nowrap mt-2">
                                {moment.utc(msg.sent_at).local().fromNow()}
                              </div>
                            </div>
                            <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                              <div className="font-weight-bold mb-1">You</div>
                              {msg.content}
                            </div>
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="flex-grow-0 py-3 px-4 border-top">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your message"
                      value={newMessage.content}
                      name="content" // Thay message thành content để khớp models.py
                      id="text-input"
                      onChange={handleChange}
                    />
                    <button onClick={sendMessage} className="btn btn-primary">
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

export default MessageDetail;