import axios, { AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  // baseURL: 'http://localhost:8000/api',
  baseURL: 'http://api.zunguka.africa/api/',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': `*`,
    // Add other headers as necessary
  }
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');

    // Check if the request URL is not login or register
    if (token && config.url && !config.url.endsWith('loginUser') && !config.url.endsWith('register')) {
      //
      // Initialize headers if undefined
      if (!config.headers) {
        config.headers = {} as AxiosRequestHeaders;
      }
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
