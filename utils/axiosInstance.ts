import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_TRACER_APP_API_URL || '',
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('CSTracerUserJWT');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
