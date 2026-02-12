import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  console.log(`[Axios] Request to: ${config.url}`);
  return config;
});

export default api;