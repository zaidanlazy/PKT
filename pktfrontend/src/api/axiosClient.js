import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8000/api", // ganti sesuai URL backend Laravel kamu
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
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

// Tambahkan interceptor untuk response error
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Optionally redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
