import axios from 'axios';

export const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'https://nlmcieko.onrender.com';
const API_BASE_URL = `${SERVER_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getBook = () => api.get('/book');
export const downloadBook = (email) => api.post('/book/download', { email });
export const submitContact = (data) => api.post('/contact/submit', data);
export const saveBelief = (data) => api.post('/belief', data);

// Admin routes
export const getAdminSongs = () => api.get('/admin/songs');
export const getAdminAnalytics = () => api.get('/admin/analytics');
export const getAdminOrders = () => api.get('/admin/orders');
export const getAdminBeliefs = () => api.get('/admin/beliefs');
export const getAdminContacts = () => api.get('/admin/contacts');

export default api;
