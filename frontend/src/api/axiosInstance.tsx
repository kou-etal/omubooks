import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: "https://mysns.test",
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
})