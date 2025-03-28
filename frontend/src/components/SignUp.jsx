import { useState } from "react"
import { useNavigate, Link } from "react-router-dom";


const Signup = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/register/', {
        email,
        username,
        password,
      });
      setMessage('Đăng nhập thành công! Vui lòng đăng nhập');
      setTimeout(() => navigate('/'), 2000)
    } catch (error) {
      setMessage('Đăng ký thất bại. username hoặc email đã tồn tại!');

    };
  };
  return (
    <div className="auth-container">
      <h1>Spotify</h1>
      <form onSubmit={handleSignup} className="auth-form">
        <h2>Đăng ký miễn phí để bắt đầu nghe</h2>
        {message && <p className={message.includes('thành công') ? 'success' : 'error'}>{message}</p>}
        <div className="form-group">
          <input
            type="email"
            placeholder="Địa chỉ email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Tên người dùng"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Tạo mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="auth-button">Đăng ký</button>
        <p>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
};

export default Signup;