import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axiosClient from "../api/axiosClient";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mpk: "",
    nama: "",
    departemen: "",
    unit_kerja: "",
    no_telp: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Password dan Konfirmasi Password tidak cocok!");
      return;
    }

    if (!formData.mpk || !formData.nama || !formData.email || !formData.password) {
      alert("Harap lengkapi data wajib: MPK, Nama, Email, Password!");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        mpk: formData.mpk,
        nama: formData.nama,
        unit_kerja: formData.departemen || formData.unit_kerja,
        no_telp: formData.no_telp,
        email: formData.email,
        password: formData.password,
      };

      const response = await axiosClient.post("/register", payload);

      const token = response.data?.data?.token || response.data?.token;
      if (token) {
        localStorage.setItem("token", token);
      }

      alert("Registrasi berhasil!");
      navigate("/dashboard");
    } catch (error) {
      const apiMessage = error.response?.data?.message;
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        const firstError = Object.values(apiErrors)[0]?.[0];
        alert(firstError || apiMessage || "Registrasi gagal, periksa data Anda.");
      } else {
        alert(apiMessage || "Registrasi gagal, periksa koneksi atau data Anda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
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
                <span className="text-lg">Daftar akun baru dengan mudah</span>
              </div>
              <div className="flex items-center space-x-3 text-white/90">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg">Akses penuh sistem reservasi</span>
              </div>
              <div className="flex items-center space-x-3 text-white/90">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg">Kelola reservasi fasilitas perusahaan</span>
              </div>
              <div className="flex items-center space-x-3 text-white/90">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg">Notifikasi real-time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="p-8 lg:p-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-3">Buat Akun Baru</h2>
                <p className="text-blue-200 text-lg">Daftarkan diri Anda untuk mengakses sistem</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="mpk" className="block text-sm font-semibold text-white mb-3">
                      MPK *
                    </label>
                    <div className="relative">
                      <input
                        id="mpk"
                        name="mpk"
                        type="text"
                        placeholder="Masukkan MPK"
                        value={formData.mpk}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                        required
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="departemen" className="block text-sm font-semibold text-white mb-3">
                      Departemen *
                    </label>
                    <div className="relative">
                      <select
                        id="departemen"
                        name="departemen"
                        value={formData.departemen}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm appearance-none"
                        required
                      >
                        <option value="" className="bg-slate-800">Pilih Departemen</option>
                        <option value="HRD" className="bg-slate-800">HRD</option>
                        <option value="Produksi" className="bg-slate-800">Produksi</option>
                        <option value="Pemasaran" className="bg-slate-800">Pemasaran</option>
                        <option value="Keuangan" className="bg-slate-800">Keuangan</option>
                        <option value="IT" className="bg-slate-800">IT</option>
                        <option value="Operasional" className="bg-slate-800">Operasional</option>
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="nama" className="block text-sm font-semibold text-white mb-3">
                      Nama Lengkap *
                  </label>
                  <div className="relative">
                    <input
                      id="nama"
                      name="nama"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={formData.nama}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-white mb-3">
                    Email Perusahaan *
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="nama@ptpupukkaltim.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-white mb-3">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Buat password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm pr-12"
                        required
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

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-3">
                      Konfirmasi Password *
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Konfirmasi password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                      >
                        {showConfirmPassword ? (
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

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="w-4 h-4 text-blue-500 bg-white/5 border-white/20 rounded focus:ring-blue-400" 
                    required 
                  />
                  <label htmlFor="terms" className="text-white/80 text-sm">
                    Saya menyetujui{" "}
                    <a href="#" className="text-blue-300 hover:text-blue-200 font-medium">
                      Syarat & Ketentuan
                    </a>{" "}
                    dan{" "}
                    <a href="#" className="text-blue-300 hover:text-blue-200 font-medium">
                      Kebijakan Privasi
                    </a>
                  </label>
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
                        <span>Mendaftarkan...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>Daftar Sekarang</span>
                      </>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-center text-white/60 text-sm">
                  Sudah punya akun?{" "}
                  <button 
                    onClick={handleLoginRedirect}
                    className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-200"
                  >
                    Masuk di sini
                  </button>
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