import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axiosClient.get("/user")
        .then(({ data }) => {
          setUser(data);
          setIsLoading(false);
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem("token");
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (mpk, password) => {
    try {
      const { data } = await axiosClient.post("/login", { mpk, password });
      setToken(data.token);
      localStorage.setItem("token", data.token);
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axiosClient.post("/register", userData);
      // Handle nested token structure from register response
      const token = data?.data?.token || data?.token;
      if (token) {
        setToken(token);
        localStorage.setItem("token", token);
      }
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
