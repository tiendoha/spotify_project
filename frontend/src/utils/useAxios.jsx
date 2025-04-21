import axios from 'axios';

const useAxios = () => {
  const token = localStorage.getItem('token');
  const instance = axios.create({
    baseURL: 'http://localhost:8000/api/',
    headers: {
      'Authorization': `Token ${token}`,
    },
  });
  return instance;
};

export default useAxios;