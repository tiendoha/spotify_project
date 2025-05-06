import axios from 'axios';

const useAxios = () => {
  const token = localStorage.getItem('token');
  const instance = axios.create({
    baseURL: '/api/',
    headers: {
      'Authorization': `Token ${token}`,
    },
  });
  return instance;
};

export default useAxios;