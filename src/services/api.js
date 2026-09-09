import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api', // Adresse de ton serveur FastAPI
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
