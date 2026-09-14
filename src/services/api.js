import axios from 'axios';

const API = axios.create({
  // 🔗 Magique : plus d'adresse en double ! Le navigateur reste sur le même domaine.
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour injecter automatiquement le Token JWT stocké lors du Login
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('dretfp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
