import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Ẩn/hiện mật khẩu
  const [errors, setErrors] = useState({}); // Lưu thông báo lỗi
  const navigate = useNavigate();

  // Kiểm tra định dạng password
  const validatePassword = (pwd) => {
    const errors = {};
    if (pwd.length <= 6) errors.length = 'Mật khẩu phải dài hơn 6 ký tự';
    if (!/[A-Z]/.test(pwd)) errors.uppercase = 'Mật khẩu phải chứa ít nhất một chữ cái in hoa';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) errors.special = 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt';
    if (!/\d/.test(pwd)) errors.number = 'Mật khẩu phải chứa ít nhất một số';
    return errors;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Kiểm tra username
    if (username.length < 6 || username.length > 32) {
      newErrors.username = 'Tên người dùng phải từ 6 đến 32 ký tự';
    }

    // Kiểm tra password
    const passwordErrors = validatePassword(password);
    if (Object.keys(passwordErrors).length > 0) {
      newErrors.password = passwordErrors;
    }

    // Kiểm tra confirmPassword
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu nhập lại không khớp';
    }

    // Nếu có lỗi, hiển thị và dừng
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Gửi request nếu không có lỗi
    try {
      const response = await axios.post('/api/register/', {
        email,
        username,
        password,
      });
      setErrors({}); // Xóa lỗi khi thành công
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errData = error.response?.data;
      const errMsg = errData?.error || errData?.detail || "Lỗi không xác định";
      console.error("Lỗi đăng ký:", errData);
      setErrors({ server: errMsg });
    }
  };

  // Xử lý thay đổi password để kiểm tra realtime
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const passwordErrors = validatePassword(newPassword);
    setErrors((prev) => ({
      ...prev,
      password: Object.keys(passwordErrors).length > 0 ? passwordErrors : undefined,
      confirmPassword: newPassword !== confirmPassword ? 'Mật khẩu nhập lại không khớp' : undefined,
    }));
  };

  // Xử lý thay đổi confirmPassword
  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: password !== newConfirmPassword ? 'Mật khẩu nhập lại không khớp' : undefined,
    }));
  };

  return (
    <div className="auth-container">
      <h1>Spotify</h1>
      <form onSubmit={handleSignup} className="auth-form">
        <h2>Đăng ký miễn phí</h2>
        {errors.server && <p className="error">{errors.server}</p>}

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
          {errors.username && <p className="error">{errors.username}</p>}
        </div>

        <div className="form-group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Tạo mật khẩu"
            value={password}
            onChange={handlePasswordChange}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
          >
            {showPassword ? "Ẩn" : "Hiện"}
          </button>
          {errors.password && (
            <div className="error">
              {errors.password.length && <p>{errors.password.length}</p>}
              {errors.password.uppercase && <p>{errors.password.uppercase}</p>}
              {errors.password.special && <p>{errors.password.special}</p>}
              {errors.password.number && <p>{errors.password.number}</p>}
            </div>
          )}
        </div>

        <div className="form-group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            required
          />
          {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
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