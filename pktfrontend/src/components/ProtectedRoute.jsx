import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    // --- Geometric Loading Screen (Theme dari HTML) ---
    return (
      <div className="min-h-screen bg-[#F7F7F8] flex items-center justify-center p-6 relative">
        {/* Subtle Background Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            backgroundImage: 'radial-gradient(#E5E7EB 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Main Card */}
        <div className="relative bg-white w-full max-w-[340px] rounded-2xl shadow-[0_4px_20px_-12px_rgba(0,0,0,0.08)] border border-gray-200/80 p-10 flex flex-col items-center justify-center space-y-8 z-10">

          {/* Geometric Loader Container */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Decorative Backdrop Glow */}
            <div className="bg-blue-500/5 rounded-full absolute inset-0 blur-3xl scale-150" />

            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
              {/* Outer Shape: Square (Rotated) */}
              <g className="geo-shape-outer">
                <rect x="15" y="15" width="70" height="70" rx="12" fill="none" stroke="#E5E7EB" strokeWidth="1.5" />
                <rect x="15" y="15" width="70" height="70" rx="12" fill="none" stroke="#18181B" strokeWidth="1.5" className="geo-stroke-anim" />
              </g>

              {/* Middle Shape: Circle */}
              <g className="geo-shape-middle">
                <circle cx="50" cy="50" r="24" fill="none" stroke="#E5E7EB" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="24" fill="none" stroke="#52525B" strokeWidth="1.5" strokeDasharray="40 100" className="opacity-80" />
              </g>

              {/* Inner Shape: Logo (Static with breathe effect) */}
              <g className="geo-logo-inner">
                <image
                  href="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_pupuk_kaltim.svg/1837px-Logo_pupuk_kaltim.svg.png"
                  x="36"
                  y="36"
                  height="28"
                  width="28"
                />
              </g>
            </svg>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-1.5 max-w-[200px]">
            <h2 className="text-sm font-semibold text-gray-900 tracking-tight" />
            <p className="leading-relaxed text-xs font-normal text-gray-500">
              LOADING PUPUK KALTIM
            </p>
          </div>

          {/* Progress Indicator (Minimal) */}
          <div className="w-full max-w-[120px] h-0.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gray-900 w-1/3 rounded-full animate-shimmer" />
          </div>
        </div>

        {/* Footer / Action (Visual only) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        </div>

        {/* --- CSS Animations --- */}
        <style>{`
          /* Geometric Animations */
          @keyframes rotate-cw {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes rotate-ccw {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }

          @keyframes dash-draw {
            0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
            50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
            100% { stroke-dasharray: 90, 150; stroke-dashoffset: -125; }
          }

          @keyframes shimmer {
            0% { transform: translateX(-100%); width: 20%; }
            50% { width: 60%; }
            100% { transform: translateX(200%); width: 20%; }
          }

          @keyframes breathe {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(0.95); opacity: 0.9; }
          }

          .geo-shape-outer {
            transform-origin: center;
            animation: rotate-cw 12s linear infinite;
          }

          .geo-shape-middle {
            transform-origin: center;
            animation: rotate-ccw 8s linear infinite;
          }

          .geo-logo-inner {
            transform-origin: center;
            animation: breathe 3s ease-in-out infinite;
          }

          .geo-stroke-anim {
            stroke-linecap: round;
            animation: dash-draw 3s ease-in-out infinite;
          }

          .animate-shimmer {
            animation: shimmer 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
