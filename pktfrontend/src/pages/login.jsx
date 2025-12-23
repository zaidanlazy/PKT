import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import TodayMeetingsModal from "./TodayMeetingsModal";
import { Eye, EyeOff, Calendar, ArrowRight, User, Lock, CheckCircle, AlertTriangle, AlertCircle, X } from "lucide-react";

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
    <div className="relative h-screen flex items-center justify-center bg-slate-50 overflow-hidden">

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 min-w-[320px] max-w-sm">
          <div
            className={`bg-white rounded-xl shadow-2xl border overflow-hidden transition-all duration-300 ease-out ${
              toast.type === "success" ? "border-green-200" : ""
            } ${toast.type === "warning" ? "border-yellow-200" : ""} ${
              toast.type === "error" ? "border-red-200" : ""
            }`}
            style={{
              animation: 'slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            }}
          >
            <div className="p-4 flex items-start gap-3">
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                toast.type === "success" ? "bg-green-100 text-green-600" : ""
              } ${toast.type === "warning" ? "bg-yellow-100 text-yellow-600" : ""} ${
                toast.type === "error" ? "bg-red-100 text-red-600" : ""
              }`}>
                {toast.type === "success" && <CheckCircle className="w-5 h-5" />}
                {toast.type === "warning" && <AlertTriangle className="w-5 h-5" />}
                {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
              </div>

              <div className="flex-1 pt-0.5">
                <p className={`text-sm font-semibold mb-0.5 ${
                  toast.type === "success" ? "text-green-900" : ""
                } ${toast.type === "warning" ? "text-yellow-900" : ""} ${
                  toast.type === "error" ? "text-red-900" : ""
                }`}>
                  {toast.type === "success" && "Berhasil!"}
                  {toast.type === "warning" && "Perhatian!"}
                  {toast.type === "error" && "Salah!"}
                </p>
                <p className={`text-sm ${
                  toast.type === "success" ? "text-green-700" : ""
                } ${toast.type === "warning" ? "text-yellow-700" : ""} ${
                  toast.type === "error" ? "text-red-700" : ""
                }`}>
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => setToast({ show: false, message: "", type: "" })}
                className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`h-1 ${
              toast.type === "success" ? "bg-green-200" : ""
            } ${toast.type === "warning" ? "bg-yellow-200" : ""} ${
              toast.type === "error" ? "bg-red-200" : ""
            }`}>
              <div
                className={`h-full ${
                  toast.type === "success" ? "bg-green-500" : ""
                } ${toast.type === "warning" ? "bg-yellow-500" : ""} ${
                  toast.type === "error" ? "bg-red-500" : ""
                }`}
                style={{
                  animation: 'progressBar 3s linear',
                  width: '100%',
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

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Modal */}
      <TodayMeetingsModal
        isOpen={showTodayMeetings}
        onClose={() => setShowTodayMeetings(false)}
      />

      {/* Main Card - Full Screen */}
      <div className="relative w-full h-full z-10">
        <div className="bg-white/90 backdrop-blur-xl overflow-hidden flex flex-col lg:flex-row-reverse h-full shadow-2xl" style={{ animation: 'fadeIn 0.8s ease-out' }}>

          {/* RIGHT SECTION - FORM */}
          <div className="lg:w-1/2 px-8 py-6 sm:px-12 sm:py-8 lg:px-16 lg:py-12 flex flex-col justify-center z-20 w-full relative max-w-2xl mx-auto h-full overflow-y-auto">

            {/* Logo */}
            <div className="mb-6 lg:mb-8 text-center">
              <div className="flex justify-center mb-2">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_pupuk_kaltim.svg/1837px-Logo_pupuk_kaltim.svg.png"
              alt="Logo PKT"
              className="w-40 drop-shadow-md transition-transform duration-500 hover:scale-105"
            />
          </div>
              <h1 className="text-xl lg:text-2xl font-semibold text-slate-900 tracking-tight">
                SELAMAT DATANG
              </h1>
              <p class="text-slate-500 text-sm" > Silahkan reservasi rapat anda </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-4">

              {/* NPK */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700 ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={npk}
                    onChange={(e) => setNpk(e.target.value)}
                    placeholder="Masukan Username Anda"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-sm"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-700 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukan password"
                    className="w-full pl-11 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <>
                      <span>Masuk</span>
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowTodayMeetings(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-600 hover:text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 shadow-sm"
                >
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Lihat Jadwal Rapat
                </button>
              </div>
            </form>

            {/* Footer */}
            <p className="text-xs text-slate-400 text-center mt-4 lg:mt-6">
              © 2025 PT Pupuk Kalimantan Timur Versi 1.0
            </p>
          </div>

          {/* LEFT SIDE - IMAGE */}
          <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 flex-col justify-end p-12">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=1920,fit=crop/YBg7wZNXDPUV4j8n/home-esg-AE0Pn1jLkWty1XaL.jpg"
                alt="Background"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/50 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 space-y-6" style={{ animation: 'fadeIn 0.8s ease-out 0.2s backwards' }}>
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h2 className="text-3xl font-light text-white tracking-tight leading-tight">
                Reservasi Ruang Meeting
              </h2>

              <p className="text-sm text-blue-100 max-w-sm leading-relaxed">
                Sistem manajemen reservasi Ruang Meeting yang efisien dan terintegrasi.
              </p>
            </div>
          </div>
        </div>

        {/* Glow effect behind card - Removed for full screen */}
      </div>
    </div>
  );
}
