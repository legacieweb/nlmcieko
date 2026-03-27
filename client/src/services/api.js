import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getBook = () => api.get('/book');
export const downloadBook = (email) => api.post('/book/download', { email });
export const submitContact = (data) => api.post('/contact/submit', data);

export default api;
