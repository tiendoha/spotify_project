import React, {useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios'

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/login/', {
                username,
                password,
            });

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user_id', response.data.user_id); // Lưu user_id
            const token = localStorage.getItem('token');
            console.log('Token hiện tại:', token);
            const userRole = response.data.role;

            setMessage('Dang nhap thanh cong');
            
            if (userRole === 'admin') {
                navigate('/admin');
            } else {
                navigate('/home');
            }
        } catch (error) {
            setMessage('Dang nhap that bai. Kiem tra tai khoan hoac mat khau.');
            console.log(error.response.data); // In lỗi từ server
        }
    };
    
    return (
        <div className="auth-container">
            <h1>Spotify</h1>
            <form onSubmit={handleLogin} className="auth-form">
                <h2>Đăng nhập</h2>
                {message && <p className={message.includes('thành công') ? 'success' : 'error'}>{message}</p>}
                <div className="form-group">
                    <input 
                        type="text"
                        placeholder="Tên đăng nhập"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="password"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="auth-button">Đăng nhập</button>
                <p>
                    Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;