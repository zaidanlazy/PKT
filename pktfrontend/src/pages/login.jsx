import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axiosClient from "../api/axiosClient";


export default function Login() {
  const navigate = useNavigate();
  const [mpk, setMpk] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();

  if (!mpk || !password) {
    alert("Isi MPK dan Password terlebih dahulu!");
    return;
  }

  setIsLoading(true);

  try {
    // Kirim request POST ke Laravel API
    const response = await axiosClient.post("/login", {
      mpk,
      password,
    });

    // Simpan token di localStorage
    const token = response.data.token;
    localStorage.setItem("token", token);

    // Redirect ke dashboard 1 2
    navigate("/dashboard");
  } catch (error) {
    console.error("Login gagal:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Login gagal! Periksa MPK dan Password.");
  } finally {
    setIsLoading(false);
  }
};

  const handleRegisterRedirect = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-8 relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center lg:justify-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="bg-white rounded-full p-3 shadow-2xl">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_pupuk_kaltim.svg/1076px-Logo_pupuk_kaltim.svg.png" 
                  alt="Pupuk Kaltim Logo" 
                  className="h-16 w-16 object-contain"
                />
              </div>
              <div className="text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">PUPUK KALTIM</h1>
                <p className="text-blue-200 text-lg font-medium">Sistem Reservasi Fasilitas</p>
              </div>
            </div>

            <div className="space-y-4 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center space-x-3 text-white/90">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg">Reservasi ruang meeting dengan mudah</span>
              </div>
              <div className="flex items-center space-x-3 text-white/90">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg">Pantau ketersediaan fasilitas real-time</span>
              </div>
              <div className="flex items-center space-x-3 text-white/90">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg">Kelola jadwal secara efisien</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-8 lg:p-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-3">Selamat Datang</h2>
                <p className="text-blue-200 text-lg">Silakan masuk ke akun Anda</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-5">
                  <div>
                    <label htmlFor="mpk" className="block text-sm font-semibold text-white mb-3">
                      NPK
                    </label>
                    <div className="relative">
                      <input
                        id="mpk"
                        type="text and number "
                        placeholder="Masukkan NPK Anda"
                        value={mpk}
                        onChange={(e) => setMpk(e.target.value)}
                        className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-white mb-3">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan password "
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 text-blue-500 bg-white/5 border-white/20 rounded focus:ring-blue-400" />
                    <span className="text-white/80 text-sm">Ingat saya</span>
                  </label>
                  <a href="#" className="text-blue-300 hover:text-blue-200 text-sm font-medium transition-colors duration-200">
                    Lupa password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <div className="relative z-10 flex items-center justify-center space-x-2">
                    {isLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Memproses...</span>
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
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>

                {/* Register Section - Below Form */}
                <div className="pt-4 border-t border-white/20">
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-3">
                      Belum memiliki akun?
                    </p>
                    <button
                      onClick={handleRegisterRedirect}
                      className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-semibold border border-white/20 hover:border-white/30 transition-all duration-300 flex items-center justify-center space-x-2 group"
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <span>Daftar Akun Baru</span>
                    </button>
                  </div>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-white/60 text-sm">
                  Butuh bantuan?{" "}
                  <a href="#" className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-200">
                    Hubungi Admin
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-white/40 text-sm">
              © 2025 Pupuk Kaltim. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}