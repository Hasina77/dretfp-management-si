import axios from 'axios';

const API = axios.create({
  baseURL: 'https://purplish-smother-germicide.ngrok-free.dev/api',  
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('dretfp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  config.headers['ngrok-skip-browser-warning'] = 'true';
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default API;

