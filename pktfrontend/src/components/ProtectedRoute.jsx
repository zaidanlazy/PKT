import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    // --- Minimalist Line Art Loading Screen ---
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg w-full max-w-sm">

          {/* SVG Container for Line Art Progress Bar */}
          <div className="relative w-full max-w-xs mx-auto mb-6">
            <svg viewBox="0 0 200 40" className="w-full h-auto">
              {/* Outer box (drawn line art style) */}
              <rect
                x="5" y="5" width="190" height="30" rx="10" ry="10"
                fill="none"
                stroke="#d1d5db" // Gray-300
                strokeWidth="2"
                className="stroke-drawing"
                strokeDasharray="200" // Panjang total path
                strokeDashoffset="0"
              />

              {/* Progress fill (drawn line art style with animation) */}
              <rect
                x="8" y="8"
                width="184" // Sedikit lebih kecil dari outer box untuk padding
                height="24"
                rx="8" ry="8"
                fill="#3b82f6" // Blue-500
                className="animate-progress-fill-line-art"
                style={{
                  // Nilai awal width akan diatur oleh animasi CSS
                  width: '0%',
                  transformOrigin: 'left center' // Pastikan scale dari kiri
                }}
              />

              {/* Static "loading..." text inside SVG to mimic hand-drawn */}
              <text
                x="100" y="25"
                fontFamily="system-ui, sans-serif" // Menggunakan font default sistem yang bersih
                fontSize="12"
                fill="#4b5563" // Gray-600
                textAnchor="middle"
                className="font-light"
              >
                loading...
              </text>
            </svg>

            {/* Percentage text outside SVG for easier styling/dynamic update */}
            <p className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2
                          text-xs font-semibold text-white animate-fade-in-out">
                {/* Kita akan mensimulasikan persentase jika perlu, tapi untuk ilustrasi, biarkan statis */}
                <span className="animate-wiggle-text">50%</span>
            </p>
          </div>

          {/* Additional Loading Message */}
          <p className="text-sm text-gray-500 mt-2">
            Mohon tunggu sebentar.
          </p>

        </div>

        {/* --- Minimalist Line Art CSS Animations --- */}
        <style>{`
          /* Animasi untuk Progress Bar Fill (menggunakan width/scaleX) */
          @keyframes progress-fill-line-art-anim {
              0% { width: 0%; }
              100% { width: 100%; }
          }
          .animate-progress-fill-line-art {
              animation: progress-fill-line-art-anim 2s ease-in-out infinite alternate;
              /* ease-in-out untuk gerakan yang lebih alami, infinite alternate untuk loop */
          }

          /* Animasi untuk teks persentase (opsional) */
          @keyframes fade-in-out {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
          }
          .animate-fade-in-out {
              animation: fade-in-out 2s ease-in-out infinite;
          }

          /* Animasi wiggle kecil untuk teks persentase (opsional, untuk menambah kesan "tulis tangan") */
          @keyframes wiggle-text {
              0%, 100% { transform: translateX(0) rotate(0deg); }
              25% { transform: translateX(1px) rotate(0.5deg); }
              75% { transform: translateX(-1px) rotate(-0.5deg); }
          }
          .animate-wiggle-text {
              animation: wiggle-text 1.5s ease-in-out infinite;
              display: inline-block; /* Penting untuk transform */
          }

          /* Menambahkan gaya untuk elemen SVG agar terlihat lebih "drawn" jika diperlukan */
          /* Misalnya, dengan filter CSS atau text-shadow yang tipis jika font tidak cukup "sketchy" */
          .stroke-drawing {
            /* Anda bisa menambahkan filter SVG di sini untuk efek sketsa */
            /* filter: url(#rough); */ // Membutuhkan definisi filter SVG
          }

          /* Contoh filter SVG jika ingin menambahkan kesan kasar */
          /* <defs>
            <filter id="rough">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" result="f1" />
              <feDisplacementMap in="SourceGraphic" in2="f1" scale="1.5" />
            </filter>
          </defs> */
          /* Ini bisa ditambahkan di dalam <svg> jika ingin diterapkan */

        `}</style>
      </div>
    );
  }

  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
