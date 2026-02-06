import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL/api ||'http://localhost:4000/api', // Ensure this matches your backend port
});

api.interceptors.request.use((config) => {
  try {
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      const userInfo = JSON.parse(userInfoString);
      if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    }
  } catch (e) {
    console.error("Error parsing userInfo from localStorage", e);
    // Optionally clear corrupted data: localStorage.removeItem('userInfo');
  }
  return config;
});

export default api;
