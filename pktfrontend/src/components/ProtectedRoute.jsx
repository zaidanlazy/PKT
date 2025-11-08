import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          {/* Cat and Laptop Container */}
          <div className="relative inline-block mb-8">
            <svg width="220" height="200" viewBox="0 0 220 200" className="animate-float">
              {/* Cat Body */}
              <g>
                {/* Main body */}
                <ellipse cx="80" cy="100" rx="55" ry="60" fill="#7C6FBF" />

                {/* Ears */}
                <ellipse cx="60" cy="50" rx="12" ry="18" fill="#6554A8" />
                <ellipse cx="100" cy="50" rx="12" ry="18" fill="#6554A8" />

                {/* Eyes (concentrating with glasses) */}
                <ellipse cx="65" cy="75" rx="8" ry="6" fill="white" />
                <ellipse cx="95" cy="75" rx="8" ry="6" fill="white" />
                <ellipse cx="65" cy="75" rx="4" ry="4" fill="#4A3D7F" />
                <ellipse cx="95" cy="75" rx="4" ry="4" fill="#4A3D7F" />

                {/* Glasses */}
                <ellipse cx="65" cy="75" rx="10" ry="8" fill="none" stroke="#4A3D7F" strokeWidth="1.5" />
                <ellipse cx="95" cy="75" rx="10" ry="8" fill="none" stroke="#4A3D7F" strokeWidth="1.5" />
                <path d="M 75 75 L 85 75" stroke="#4A3D7F" strokeWidth="1.5" />

                {/* Nose */}
                <polygon points="80,85 77,88 83,88" fill="#FF8FB3" />

                {/* Mouth - determined expression */}
                <path d="M 75 92 Q 80 95 85 92" stroke="#4A3D7F" strokeWidth="1.5" fill="none" />

                {/* Belly spots */}
                <ellipse cx="80" cy="115" rx="12" ry="15" fill="white" />
                <ellipse cx="80" cy="140" rx="10" ry="12" fill="white" />

                {/* Left Arm - typing animation */}
                <g className="animate-type-left">
                  <ellipse cx="40" cy="130" rx="14" ry="28" fill="#6554A8" />
                  <ellipse cx="35" cy="125" rx="3" ry="5" fill="#7C6FBF" />
                </g>

                {/* Right Arm - typing animation */}
                <g className="animate-type-right">
                  <ellipse cx="120" cy="130" rx="14" ry="28" fill="#6554A8" />
                  <ellipse cx="125" cy="125" rx="3" ry="5" fill="#7C6FBF" />
                </g>

                {/* Tail */}
                <ellipse cx="20" cy="120" rx="20" ry="12" fill="#4A3D7F" className="animate-wag" />
              </g>

              {/* Laptop */}
              <g transform="translate(60, 150)">
                {/* Laptop screen */}
                <rect x="0" y="-25" width="90" height="60" rx="3" fill="#2D1F3F" />
                <rect x="4" y="-21" width="82" height="52" rx="2" fill="#1a1a2e" />

                {/* Screen content - code typing effect */}
                <rect x="8" y="-17" width="30" height="2" fill="#6FCF97" className="animate-typing-line-1" />
                <rect x="8" y="-12" width="45" height="2" fill="#56CCF2" className="animate-typing-line-2" />
                <rect x="8" y="-7" width="25" height="2" fill="#BB6BD9" className="animate-typing-line-3" />
                <rect x="8" y="-2" width="38" height="2" fill="#F2994A" className="animate-typing-line-4" />

                {/* Cursor blink */}
                <rect x="48" y="-2" width="2" height="2" fill="#ffffff" className="animate-blink" />

                {/* Laptop base/keyboard */}
                <path d="M -5 35 L 95 35 L 100 40 L -10 40 Z" fill="#2D1F3F" />
                <rect x="0" y="35" width="90" height="5" rx="1" fill="#3d2f4f" />

                {/* Keyboard keys with typing animation */}
                <g>
                  <rect x="10" y="37" width="4" height="2" fill="#666" className="animate-key-press-1" />
                  <rect x="16" y="37" width="4" height="2" fill="#666" className="animate-key-press-2" />
                  <rect x="22" y="37" width="4" height="2" fill="#666" className="animate-key-press-3" />
                  <rect x="28" y="37" width="4" height="2" fill="#666" className="animate-key-press-4" />
                  <rect x="34" y="37" width="4" height="2" fill="#666" className="animate-key-press-5" />
                  <rect x="40" y="37" width="4" height="2" fill="#666" className="animate-key-press-6" />
                </g>
              </g>
            </svg>
          </div>

          {/* Loading Text */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Loading
            
          </h2>


          {/* Dots Animation */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-5px);
            }
          }

          @keyframes wag {
            0%, 100% {
              transform: rotate(-5deg);
            }
            50% {
              transform: rotate(5deg);
            }
          }

          @keyframes type-left {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            25% {
              transform: translateY(2px) rotate(-2deg);
            }
            50% {
              transform: translateY(4px) rotate(0deg);
            }
            75% {
              transform: translateY(2px) rotate(2deg);
            }
          }

          @keyframes type-right {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            25% {
              transform: translateY(2px) rotate(2deg);
            }
            50% {
              transform: translateY(4px) rotate(0deg);
            }
            75% {
              transform: translateY(2px) rotate(-2deg);
            }
          }

          @keyframes blink {
            0%, 49% {
              opacity: 1;
            }
            50%, 100% {
              opacity: 0;
            }
          }

          @keyframes typing-line-1 {
            0%, 20% { width: 0; opacity: 0; }
            21%, 100% { width: 30; opacity: 1; }
          }

          @keyframes typing-line-2 {
            0%, 40% { width: 0; opacity: 0; }
            41%, 100% { width: 45; opacity: 1; }
          }

          @keyframes typing-line-3 {
            0%, 60% { width: 0; opacity: 0; }
            61%, 100% { width: 25; opacity: 1; }
          }

          @keyframes typing-line-4 {
            0%, 80% { width: 0; opacity: 0; }
            81%, 100% { width: 38; opacity: 1; }
          }

          @keyframes key-press {
            0%, 100% { fill: #666; }
            50% { fill: #fff; }
          }

          @keyframes typing-dots {
            0% { opacity: 0; }
            33% { opacity: 1; }
            66% { opacity: 1; }
            100% { opacity: 1; }
          }

          .animate-float {
            animation: float 4s ease-in-out infinite;
          }

          .animate-wag {
            transform-origin: center right;
            animation: wag 2s ease-in-out infinite;
          }

          .animate-type-left {
            transform-origin: center bottom;
            animation: type-left 1.2s ease-in-out infinite;
          }

          .animate-type-right {
            transform-origin: center bottom;
            animation: type-right 1.2s ease-in-out infinite 0.6s;
          }

          .animate-blink {
            animation: blink 1s step-end infinite;
          }

          .animate-typing-line-1 {
            animation: typing-line-1 4s infinite;
          }

          .animate-typing-line-2 {
            animation: typing-line-2 4s infinite;
          }

          .animate-typing-line-3 {
            animation: typing-line-3 4s infinite;
          }

          .animate-typing-line-4 {
            animation: typing-line-4 4s infinite;
          }

          .animate-key-press-1 {
            animation: key-press 0.8s infinite 0.1s;
          }

          .animate-key-press-2 {
            animation: key-press 0.8s infinite 0.3s;
          }

          .animate-key-press-3 {
            animation: key-press 0.8s infinite 0.5s;
          }

          .animate-key-press-4 {
            animation: key-press 0.8s infinite 0.7s;
          }

          .animate-key-press-5 {
            animation: key-press 0.8s infinite 0.9s;
          }

          .animate-key-press-6 {
            animation: key-press 0.8s infinite 1.1s;
          }

          .animate-typing-dots {
            animation: typing-dots 1.5s infinite;
          }

          .animate-typing-dots::before {
            content: "...";
            animation: typing-dots 1.5s steps(3, end) infinite;
          }
        `}</style>
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
