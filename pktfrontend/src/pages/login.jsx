import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import TodayMeetingsModal from "./TodayMeetingsModal";

export default function Login() {
  const navigate = useNavigate();
  const { login, token } = useAuth();
  const [npk, setNpk] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTodayMeetings, setShowTodayMeetings] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Notification
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!npk || !password) {
      showToast("Isi NPK dan password terlebih dahulu", "warning");
      return;
    }

    try {
      setIsLoading(true);
      const result = await login(npk, password);

      if (result.success) {
        showToast("Login berhasil!", "success");
        setTimeout(() => navigate("/dashboard"), 900);
      } else {
        showToast(result.error?.message || "NPK atau password salah", "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan saat login", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden">

      {/* TOAST NOTIFICATION - MODERN RIGHT SIDE */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 z-50 min-w-[320px] max-w-md rounded-xl shadow-2xl backdrop-blur-sm border transition-all duration-300 ease-out
            ${toast.type === "success" ? "bg-green-50 border-green-200" : ""}
            ${toast.type === "warning" ? "bg-yellow-50 border-yellow-200" : ""}
            ${toast.type === "error" ? "bg-red-50 border-red-200" : ""}
          `}
          style={{
            animation: 'slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          }}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon Container */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                ${toast.type === "success" ? "bg-green-100" : ""}
                ${toast.type === "warning" ? "bg-yellow-100" : ""}
                ${toast.type === "error" ? "bg-red-100" : ""}
              `}>
                {toast.type === "success" && (
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {toast.type === "warning" && (
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {toast.type === "error" && (
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-0.5">
                <p className={`text-sm font-semibold mb-0.5
                  ${toast.type === "success" ? "text-green-900" : ""}
                  ${toast.type === "warning" ? "text-yellow-900" : ""}
                  ${toast.type === "error" ? "text-red-900" : ""}
                `}>
                  {toast.type === "success" && "Berhasil!"}
                  {toast.type === "warning" && "Perhatian!"}
                  {toast.type === "error" && "Salah!"}
                </p>
                <p className={`text-sm
                  ${toast.type === "success" ? "text-green-700" : ""}
                  ${toast.type === "warning" ? "text-yellow-700" : ""}
                  ${toast.type === "error" ? "text-red-700" : ""}
                `}>
                  {toast.message}
                </p>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setToast({ show: false, message: "", type: "" })}
                className={`flex-shrink-0 rounded-lg p-1 hover:bg-opacity-20 transition-colors
                  ${toast.type === "success" ? "text-green-600 hover:bg-green-600" : ""}
                  ${toast.type === "warning" ? "text-yellow-600 hover:bg-yellow-600" : ""}
                  ${toast.type === "error" ? "text-red-600 hover:bg-red-600" : ""}
                `}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Progress Bar */}
            <div className={`mt-3 h-1 rounded-full overflow-hidden
              ${toast.type === "success" ? "bg-green-200" : ""}
              ${toast.type === "warning" ? "bg-yellow-200" : ""}
              ${toast.type === "error" ? "bg-red-200" : ""}
            `}>
              <div
                className={`h-full rounded-full
                  ${toast.type === "success" ? "bg-green-500" : ""}
                  ${toast.type === "warning" ? "bg-yellow-500" : ""}
                  ${toast.type === "error" ? "bg-red-500" : ""}
                `}
                style={{
                  animation: 'progressBar 3s linear',
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes progressBar {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>

      {/* Modal */}
      <TodayMeetingsModal
        isOpen={showTodayMeetings}
        onClose={() => setShowTodayMeetings(false)}
      />

      {/* LEFT SECTION */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-10 bg-white animate-fadeIn">
        <div className="w-full max-w-md animate-slideUp">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_pupuk_kaltim.svg/1837px-Logo_pupuk_kaltim.svg.png"
              alt="Logo PKT"
              className="w-24 drop-shadow-md transition-transform duration-500 hover:scale-105"
            />
          </div>

          <h2 className="text-3xl font-bold text-center mb-8 tracking-wide">
            SELAMAT DATANG
          </h2>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* NPK */}
            <div>
              <label className="block text-gray-700 mb-1 font-semibold">NPK</label>
              <input
                type="text"
                value={npk}
                onChange={(e) => setNpk(e.target.value)}
                placeholder="Masukan NPK"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-700 mb-1 font-semibold">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukan password"
                  className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                >
                  {showPassword ? (
                    // Eye Slash (Hide)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    // Eye (Show)
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? "Loading" : "Masuk"}
            </button>
          </form>

          {/* Jadwal */}
          <button
            onClick={() => setShowTodayMeetings(true)}
            className="w-full mt-5 border border-gray-300 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8h18M8 3v5m8-5v5M5 12h14v8H5z" />
            </svg>
            Lihat Jadwal Rapat
          </button>
        </div>
      </div>

      {/* RIGHT SIDE IMAGE (rapi + overlay + fade) */}
      <div className="hidden lg:block w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center animate-fadeIn"
          style={{
            backgroundImage:
              "url('https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1920,fit=crop/YBg7wZNXDPUV4j8n/home-esg-AE0Pn1jLkWty1XaL.jpg')",
          }}
        ></div>

        {/* Overlay gelap halus */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>
    </div>
  );
}
