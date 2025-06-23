import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://mysns.test',
  withCredentials: true
});

export default api;