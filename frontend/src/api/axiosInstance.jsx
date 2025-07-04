import axios from 'axios';
import { APP_URL } from '../components/config';

export const axiosInstance = axios.create({
  baseURL: APP_URL,
  withCredentials: true,
  withXSRFToken: true,
})