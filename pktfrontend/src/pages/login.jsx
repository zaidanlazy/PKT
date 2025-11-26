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

  // Notification
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    if (token) navigate("/dashboard", { replace: true });
  }, [token, navigate]);

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
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

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div
          className={`fixed top-5 left-1/2 transform -translate-x-1/2 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-semibold transition-all duration-500 animate-slideDown
            ${toast.type === "success" ? "bg-green-600" : ""}
            ${toast.type === "warning" ? "bg-yellow-600" : ""}
            ${toast.type === "error" ? "bg-red-600" : ""}
          `}
        >
          {toast.message}
        </div>
      )}

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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukan password"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-all"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition transform hover:scale-[1.02] disabled:opacity-50"
            >
              {isLoading ? "Loading..." : "Masuk"}
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
              "url('https://foto.kontan.co.id/q2Jh1KiGbwOme8Yi8DdSIABcvX4=/smart/2022/07/30/2106760463.jpg')",
          }}
        ></div>

        {/* Overlay gelap halus */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>
    </div>
  );
}
