import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

// Komponen Modal untuk menampilkan rapat hari ini
function TodayMeetingsModal({ isOpen, onClose }) {
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format tanggal untuk hari ini
  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Simulasi data rapat hari ini
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulasi fetching data
      setTimeout(() => {
        const mockMeetings = [
          {
            id: 1,
            title: "Rapat Tim Marketing",
            time: "09:00 - 10:30",
            room: "Ruang Meeting A",
            organizer: "Budi Santoso"
          },
          {
            id: 2,
            title: "Briefing Proyek Baru",
            time: "11:00 - 12:00",
            room: "Ruang Meeting B",
            organizer: "Siti Rahayu"
          },
          {
            id: 3,
            title: "Review Kinerja Triwulan",
            time: "14:00 - 16:00",
            room: "Ruang Rapat Utama",
            organizer: "Ahmad Wijaya"
          }
        ];
        setTodayMeetings(mockMeetings);
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">Rapat Hari Ini</h2>
              <p className="text-blue-100">{formattedDate}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : todayMeetings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Tidak ada rapat hari ini</h3>
              <p className="text-gray-500">Tidak ada jadwal rapat untuk hari ini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="border border-gray-200 rounded-2xl p-4 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800 text-lg">{meeting.title}</h3>
                    <span className="bg-blue-100 text-blue-600 text-sm font-medium px-3 py-1 rounded-full">
                      {meeting.time}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{meeting.room}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Dipimpin oleh: {meeting.organizer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, token } = useAuth();
  const [mpk, setMpk] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [showTodayMeetings, setShowTodayMeetings] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  const showNotification = (message, type = "error") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!mpk || !password) {
      showNotification("Isi NPK dan Password terlebih dahulu!", "warning");
      return;
    }

    // Basic validation - remove strict NPK format validation
    if (mpk.length < 3) {
      showNotification("NPK minimal 3 karakter", "warning");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(mpk, password);

      if (result.success) {
        showNotification("Login berhasil!", "success");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        // Show specific error message from API
        const errorMessage = result.error?.message || "NPK atau password salah";
        showNotification(errorMessage, "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showNotification("Terjadi kesalahan saat login", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTodayMeetingsClick = () => {
    setShowTodayMeetings(true);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Modal Lihat Rapat Hari Ini */}
      <TodayMeetingsModal 
        isOpen={showTodayMeetings} 
        onClose={() => setShowTodayMeetings(false)} 
      />

      {/* Modern Notification Container */}
      <div className="fixed top-6 right-6 z-50 space-y-4 max-w-sm w-full">
        {notification.show && (
          <div className={`relative p-6 rounded-2xl shadow-2xl border backdrop-blur-lg transform transition-all duration-500 animate-in slide-in-from-right-full ${
            notification.type === "success"
              ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 text-green-800 shadow-green-200/50"
              : notification.type === "warning"
              ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800 shadow-yellow-200/50"
              : "bg-gradient-to-br from-red-50 to-rose-50 border-red-200 text-red-800 shadow-red-200/50"
          }`}>
            {/* Header dengan Icon */}
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                notification.type === "success"
                  ? "bg-gradient-to-br from-green-500 to-emerald-500"
                  : notification.type === "warning"
                  ? "bg-gradient-to-br from-yellow-500 to-amber-500"
                  : "bg-gradient-to-br from-red-500 to-rose-500"
              }`}>
                {notification.type === "success" ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : notification.type === "warning" ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-lg mb-1 ${
                  notification.type === "success"
                    ? "text-green-900"
                    : notification.type === "warning"
                    ? "text-yellow-900"
                    : "text-red-900"
                }`}>
                  {notification.type === "success"
                    ? "Berhasil!"
                    : notification.type === "warning"
                    ? "Peringatan"
                    : "Terjadi Kesalahan"}
                </h3>
                <p className="text-sm leading-relaxed">{notification.message}</p>
              </div>

              <button
                onClick={() => setNotification({ show: false, message: "", type: "" })}
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  notification.type === "success"
                    ? "text-green-600 hover:bg-green-100"
                    : notification.type === "warning"
                    ? "text-yellow-600 hover:bg-yellow-100"
                    : "text-red-600 hover:bg-red-100"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Progress Bar dengan animasi */}
            <div className="mt-4 w-full bg-gray-200/50 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-5000 ease-linear ${
                  notification.type === "success"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : notification.type === "warning"
                    ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                    : "bg-gradient-to-r from-red-500 to-rose-500"
                }`}
                style={{
                  width: '100%',
                  animation: 'shrink 5s linear forwards'
                }}
              ></div>
            </div>

            {/* Background Pattern */}
            <div className={`absolute top-0 right-0 w-20 h-20 opacity-5 ${
              notification.type === "success"
                ? "text-green-500"
                : notification.type === "warning"
                ? "text-yellow-500"
                : "text-red-500"
            }`}>
              {notification.type === "success" ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : notification.type === "warning" ? (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-8 relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center lg:justify-start space-x-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg">
              <div className="bg-white rounded-full p-3 shadow-xl">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_pupuk_kaltim.svg/1076px-Logo_pupuk_kaltim.svg.png"
                  alt="Pupuk Kaltim Logo"
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div className="text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-2">PUPUK KALTIM</h1>
                <p className="text-blue-600 text-lg font-medium">Sistem Reservasi Fasilitas</p>
              </div>
            </div>

            <div className="space-y-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg">Reservasi ruang meeting dengan mudah</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg">Pantau ketersediaan fasilitas real-time</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg">Kelola jadwal secara efisien</span>
              </div>
              
              {/* Tombol Lihat Rapat Hari Ini yang Lebih Menarik */}
              <button
                onClick={handleTodayMeetingsClick}
                className="w-full group relative overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 border border-cyan-200 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <div className="flex items-center space-x-4">
                  {/* Icon dengan efek khusus */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-cyan-200/50 group-hover:scale-110 transition-all duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    {/* Ping animation */}
                    <div className="absolute inset-0 rounded-xl bg-cyan-400 animate-ping opacity-20 group-hover:opacity-30"></div>
                  </div>
                  
                  {/* Text Content */}
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-800 text-lg group-hover:text-cyan-700 transition-colors duration-300">
                      Lihat Rapat Hari Ini
                    </h3>
                    <p className="text-sm text-gray-600 group-hover:text-cyan-600 transition-colors duration-300">
                      Cek jadwal rapat yang sudah dijadwalkan untuk hari ini
                    </p>
                  </div>
                  
                  {/* Arrow Icon */}
                  <div className="text-cyan-500 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                {/* Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="relative z-10">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl overflow-hidden">
            <div className="p-8 lg:p-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-gray-800 mb-3">Selamat Datang</h2>
                <p className="text-gray-600 text-lg">Silakan masuk ke akun Anda</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-5">
                  <div>
                    <label htmlFor="mpk" className="block text-sm font-semibold text-gray-700 mb-3">
                      NPK
                    </label>
                    <div className="relative">
                      <input
                        id="mpk"
                        type="text"
                        placeholder="Masukkan NPK Anda"
                        value={mpk}
                        onChange={(e) => setMpk(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-300 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>Masuk</span>
                      </>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              © 2025 Pupuk Kaltim. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }

        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-in {
          animation: slideInFromRight 0.5s ease-out;
        }

        .slide-in-from-right-full {
          animation: slideInFromRight 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}