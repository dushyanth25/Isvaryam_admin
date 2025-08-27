import axios from 'axios';

const instance = axios.create({
  //baseURL: 'https://isvaryam-backend.onrender.com', // or your backend URL
  baseURL: 'https://isvaryamweb-final.onrender.com', // or your backend URL

});

instance.interceptors.request.use(config => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default instance;
