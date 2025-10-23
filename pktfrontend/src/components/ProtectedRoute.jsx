import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-400 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-8 shadow-2xl">
          {/* Cat Meme Loading */}
          <div className="text-6xl mb-4 animate-bounce">🙈</div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-pulse">
            loading
          </h2>



          {/* Running Dots Animation */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
