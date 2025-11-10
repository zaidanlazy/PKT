import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GuestRoute = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return token ? <Navigate to="/dashboard" replace /> : children;
};

export default GuestRoute;



