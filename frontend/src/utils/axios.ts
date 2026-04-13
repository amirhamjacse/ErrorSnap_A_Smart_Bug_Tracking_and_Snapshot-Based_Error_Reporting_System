/* eslint-disable @typescript-eslint/ban-ts-comment */
import axios from "axios";
import Cookies from "js-cookie";

export const apiClient = axios.create({
  // // @ts-expect-error
  // baseURL: import.meta.env.VITE_API_URL,
  baseURL: "http://127.0.0.1:3000/",
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
