import { createContext, useState, useEffect } from 'react';
import jwtDecode from 'jwt-decode'; // Thay jwt_decode thành jwtDecode
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Thay require('sweetalert2') bằng import ES Module

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem('authTokens')
      ? JSON.parse(localStorage.getItem('authTokens'))
      : null
  );

  const [user, setUser] = useState(() =>
    localStorage.getItem('authTokens')
      ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access)
      : null
  );

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // Thay useHistory thành useNavigate

  const loginUser = async (email, password) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.status === 200) {
        setAuthTokens(data);
        setUser(jwtDecode(data.access));
        localStorage.setItem('authTokens', JSON.stringify(data));
        navigate('/'); // Thay history.push bằng navigate
        Swal.fire({
          title: 'Login Successful',
          icon: 'success',
          toast: true,
          timer: 6000,
          position: 'top-right',
          timerProgressBar: true,
          showConfirmButton: false,
          showCancelButton: true,
        });
      } else {
        Swal.fire({
          title: 'Username or password does not exist',
          icon: 'error',
          toast: true,
          timer: 6000,
          position: 'top-right',
          timerProgressBar: true,
          showConfirmButton: false,
          showCancelButton: true,
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      Swal.fire({
        title: 'An error occurred during login',
        icon: 'error',
        toast: true,
        timer: 6000,
        position: 'top-right',
        timerProgressBar: true,
        showConfirmButton: false,
        showCancelButton: true,
      });
    }
  };

  const registerUser = async (email, username, password, password2) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password, password2 }),
      });

      if (response.status === 201) {
        navigate('/login'); // Thay history.push bằng navigate
        Swal.fire({
          title: 'Registration Successful, Login Now',
          icon: 'success',
          toast: true,
          timer: 6000,
          position: 'top-right',
          timerProgressBar: true,
          showConfirmButton: false,
          showCancelButton: true,
        });
      } else {
        const errorData = await response.json();
        Swal.fire({
          title: `An Error Occurred: ${response.status} - ${errorData.detail || 'Unknown error'}`,
          icon: 'error',
          toast: true,
          timer: 6000,
          position: 'top-right',
          timerProgressBar: true,
          showConfirmButton: false,
          showCancelButton: true,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      Swal.fire({
        title: 'An error occurred during registration',
        icon: 'error',
        toast: true,
        timer: 6000,
        position: 'top-right',
        timerProgressBar: true,
        showConfirmButton: false,
        showCancelButton: true,
      });
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    navigate('/login'); // Thay history.push bằng navigate
    Swal.fire({
      title: 'You have been logged out',
      icon: 'success',
      toast: true,
      timer: 6000,
      position: 'top-right',
      timerProgressBar: true,
      showConfirmButton: false,
      showCancelButton: true,
    });
  };

  const contextData = {
    user,
    setUser,
    authTokens,
    setAuthTokens,
    registerUser,
    loginUser,
    logoutUser,
  };

  useEffect(() => {
    if (authTokens) {
      try {
        setUser(jwtDecode(authTokens.access));
      } catch (error) {
        console.error('Invalid token:', error);
        logoutUser(); // Đăng xuất nếu token không hợp lệ
      }
    }
    setLoading(false);
  }, [authTokens]);

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};