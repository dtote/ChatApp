import axios from 'axios';
import { logger } from './logger.js';

// Create axios instance with default configuration
const api = axios.create({
  // Use relative URLs - Vite proxy will handle the routing
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = JSON.parse(localStorage.getItem("chat-user"))?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 404 errors for search requests silently (expected behavior)
    if (error.response?.status === 404 && error.config?.url?.includes('/api/conversation/search')) {
      return Promise.reject(error);
    }

    // Log other errors professionally
    if (error.response?.status === 404) {
      logger.warn('API endpoint not found', error.config?.url);
    } else if (error.response?.status >= 500) {
      logger.error('Server error', { status: error.response?.status, url: error.config?.url });
    } else if (error.response?.status >= 400) {
      logger.warn('Client error', { status: error.response?.status, url: error.config?.url });
    }

    return Promise.reject(error);
  }
);

export default api; 