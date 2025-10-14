import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8000/api", // ganti sesuai URL backend Laravel kamu
  headers: {
    "Content-Type": "application/json",
  },
});

// Tambahkan interceptor untuk token login
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
