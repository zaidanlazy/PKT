import { useEffect, useState } from "react";
import axios from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [data, setData] = useState({
    total_ruangan: 2,
    total_rapat: 1,
    total_online: 1,
    total_offline: 0,
  });
  
  const [rapatList, setRapatList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add or edit
  const [selectedRapat, setSelectedRapat] = useState(null);
  const [formData, setFormData] = useState({
    nama_rapat: "",
    jenis: "online", // online or offline
    tanggal: "", // YYYY-MM-DD
    waktu_mulai: "",
    waktu_selesai: "",
    ruangan_id: "",
  });

  useEffect(() => {
    fetchDashboardData();
    fetchRapatList();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Gagal memuat data dashboard");
    }
  };

  const fetchRapatList = async () => {
    try {
      const res = await axios.get("/rapat");
      setRapatList(res.data);
    } catch (err) {
      console.error("Gagal memuat data rapat");
    }
  };

  const handleOpenModal = (mode, rapat = null) => {
    setModalMode(mode);
    if (mode === "edit" && rapat) {
      setSelectedRapat(rapat);
      setFormData({
        nama_rapat: rapat.nama_rapat,
        jenis: rapat.jenis,
        tanggal: rapat.tanggal,
        waktu_mulai: rapat.waktu_mulai,
        waktu_selesai: rapat.waktu_selesai,
        ruangan_id: rapat.ruangan_id || "",
      });
    } else {
      setFormData({
        nama_rapat: "",
        jenis: "online",
        tanggal: "",
        waktu_mulai: "",
        waktu_selesai: "",
        ruangan_id: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRapat(null);
    setFormData({
      nama_rapat: "",
      jenis: "online",
      tanggal: "",
      waktu_mulai: "",
      waktu_selesai: "",
      ruangan_id: "",
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "add") {
        await axios.post("/rapat", formData);
        alert("Rapat berhasil ditambahkan");
      } else {
        await axios.put(`/rapat/${selectedRapat.id}`, formData);
        alert("Rapat berhasil diupdate");
      }
      handleCloseModal();
      fetchDashboardData();
      fetchRapatList();
    } catch (err) {
      alert("Gagal menyimpan data rapat");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus rapat ini?")) {
      try {
        await axios.delete(`/rapat/${id}`);
        alert("Rapat berhasil dihapus");
        fetchDashboardData();
        fetchRapatList();
      } catch (err) {
        alert("Gagal menghapus rapat");
        console.error(err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full blur-3xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-full p-2 shadow-2xl">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_pupuk_kaltim.svg/1076px-Logo_pupuk_kaltim.svg.png" 
                alt="Pupuk Kaltim Logo" 
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard Reservasi</h1>
              <p className="text-blue-200">Sistem Manajemen Rapat Pupuk Kaltim</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white font-semibold">{user?.nama || user?.mpk || "User"}</p>
              <p className="text-blue-200 text-sm">Selamat datang!</p>
            </div>
            <button
              onClick={logout}
              className="bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-xl border border-red-400/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10">
        <StatCard 
          title="Total Ruangan" 
          value={data.total_ruangan} 
          icon="building"
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard 
          title="Total Rapat" 
          value={data.total_rapat} 
          icon="calendar"
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard 
          title="Rapat Online" 
          value={data.total_online} 
          icon="video"
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard 
          title="Rapat Offline" 
          value={data.total_offline} 
          icon="users"
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Rapat List Section */}
      <div className="relative z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Daftar Rapat</h2>
                <p className="text-blue-200">Kelola jadwal rapat Anda</p>
              </div>
              <button
                onClick={() => handleOpenModal("add")}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 group"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Tambah Rapat</span>
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="px-6 py-4 text-left text-white font-semibold">Agenda Rapat </th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Jenis</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Tanggal</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Waktu</th>
                    <th className="px-6 py-4 text-center text-white font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {rapatList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12">
                        <div className="text-white/60 flex flex-col items-center space-y-3">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p>Belum ada data rapat</p>
                          <button
                            onClick={() => handleOpenModal("add")}
                            className="text-blue-300 hover:text-blue-200 font-medium transition-colors duration-200"
                          >
                            Tambah rapat pertama Anda
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rapatList.map((rapat, index) => (
                      <tr 
                        key={rapat.id} 
                        className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="px-6 py-4 text-white font-medium">{rapat.nama_rapat}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border ${
                              rapat.jenis === "online"
                                ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                                : "bg-green-500/20 text-green-300 border-green-400/30"
                            }`}
                          >
                            {rapat.jenis === "online" ? "Online" : "Offline"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/90">{rapat.tanggal}</td>
                        <td className="px-6 py-4 text-white/90">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{rapat.waktu_mulai} - {rapat.waktu_selesai}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center space-x-3">
                            <button
                              onClick={() => handleOpenModal("edit", rapat)}
                              className="text-blue-300 hover:text-blue-200 transition-colors duration-200 p-2 hover:bg-blue-500/20 rounded-lg"
                              title="Edit"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(rapat.id)}
                              className="text-red-300 hover:text-red-200 transition-colors duration-200 p-2 hover:bg-red-500/20 rounded-lg"
                              title="Hapus"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl w-full max-w-md">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {modalMode === "add" ? "Tambah Rapat" : "Edit Rapat"}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="text-white/60 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-3">Nama Rapat</label>
                  <input
                    type="text"
                    name="nama_rapat"
                    value={formData.nama_rapat}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    placeholder="Masukkan nama rapat"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-3">Jenis Rapat</label>
                  <div className="flex gap-6">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="jenis"
                        value="online"
                        checked={formData.jenis === "online"}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-500 bg-white/5 border-white/20 focus:ring-blue-400"
                      />
                      <span className="text-white">Online</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="jenis"
                        value="offline"
                        checked={formData.jenis === "offline"}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-500 bg-white/5 border-white/20 focus:ring-blue-400"
                      />
                      <span className="text-white">Offline</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-3">Tanggal</label>
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-semibold mb-3">Waktu Mulai</label>
                    <input
                      type="time"
                      name="waktu_mulai"
                      value={formData.waktu_mulai}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-3">Waktu Selesai</label>
                    <input
                      type="time"
                      name="waktu_selesai"
                      value={formData.waktu_selesai}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>

                {formData.jenis === "offline" && (
                  <div>
                    <label className="block text-white font-semibold mb-3">RUANG RAPAT</label>
                    <input
                      type="text"
                      name="ruangan_id"
                      value={formData.ruangan_id}
                      onChange={handleInputChange}
                      className="w-full px-5 py-4 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                      placeholder="Masukkan nama ruangan"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border border-white/20 text-white rounded-2xl hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    {modalMode === "add" ? "Tambah" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// StatCard Component
const StatCard = ({ title, value, icon, gradient }) => {
  const renderIcon = () => {
    const iconClass = "w-8 h-8";
    switch (icon) {
      case "building":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case "calendar":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "video":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case "users":
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 hover:transform hover:scale-105 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/70 text-sm font-medium mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
          {renderIcon()}
        </div>
      </div>
    </div>
  );
};