import axios from 'axios';
import jwtDecode from 'jwt-decode'; // Thay jwt_decode thành jwtDecode
import dayjs from 'dayjs';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext'; // Đảm bảo file này tồn tại

const baseURL = 'http://127.0.0.1:8000/api';

const useAxios = () => {
  const { authTokens, setUser, setAuthTokens } = useContext(AuthContext);

  const axiosInstance = axios.create({
    baseURL,
    headers: { Authorization: `Bearer ${authTokens?.access}` },
  });

  axiosInstance.interceptors.request.use(async (req) => {
    if (!authTokens?.access) {
      return req; // Trả về yêu cầu nếu không có token
    }

    const user = jwtDecode(authTokens.access);
    const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

    if (!isExpired) return req;

    try {
      const response = await axios.post(`${baseURL}/token/refresh/`, {
        refresh: authTokens.refresh,
      });

      localStorage.setItem('authTokens', JSON.stringify(response.data));
      setAuthTokens(response.data);
      setUser(jwtDecode(response.data.access));

      req.headers.Authorization = `Bearer ${response.data.access}`;
      return req;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Có thể thêm logic đăng xuất nếu refresh thất bại
      return Promise.reject(error);
    }
  });

  return axiosInstance;
};

export default useAxios;