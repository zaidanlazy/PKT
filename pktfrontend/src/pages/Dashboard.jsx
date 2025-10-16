import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState({
    total_ruangan: 0,
    total_rapat: 0,
    total_online: 0,
    total_offline: 0,
  });
  
  const [rapatList, setRapatList] = useState([]);
  const [ruanganList, setRuanganList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRuanganModal, setShowRuanganModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedRapat, setSelectedRapat] = useState(null);
  const [selectedRuangan, setSelectedRuangan] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default tutup
  const [activeMenu, setActiveMenu] = useState("");
  const [sidebarHover, setSidebarHover] = useState(false); // State untuk hover
  const [formData, setFormData] = useState({
    nama_rapat: "",
    jenis: "offline",
    tanggal: "",
    waktu_mulai: "",
    waktu_selesai: "",
    ruangan_id: "",
  });
  const [ruanganForm, setRuanganForm] = useState({
    nama_ruangan: "",
    kapasitas: "",
    lokasi: "",
    fasilitas: "",
    status: "tersedia"
  });
  
  const [userForm, setUserForm] = useState({
    nama: "",
    email: "",
    role: "user",
    departemen: "",
    status: "active"
  });

  useEffect(() => {
    fetchDashboardData();
    fetchRapatList();
    fetchRuanganList();
    fetchUserList();
  }, []);

  // Auto open/close sidebar berdasarkan hover
  useEffect(() => {
    let hoverTimer;
    
    if (sidebarHover) {
      setSidebarOpen(true);
    } else {
      // Delay sebelum menutup sidebar untuk mencegah flickering
      hoverTimer = setTimeout(() => {
        setSidebarOpen(false);
      }, 300); // Delay 300ms
    }

    return () => {
      clearTimeout(hoverTimer);
    };
  }, [sidebarHover]);

  const handleSidebarMouseEnter = () => {
    setSidebarHover(true);
  };

  const handleSidebarMouseLeave = () => {
    setSidebarHover(false);
  };

  // Handler untuk mobile/tablet (toggle manual)
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

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
      const data = res.data?.data || res.data || [];
      setRapatList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat data rapat:", err);
      setRapatList([]);
    }
  };

  const fetchRuanganList = async () => {
    try {
      const res = await axios.get("/ruangan");
      const data = res.data?.data || res.data || [];
      setRuanganList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat data ruangan:", err);
      setRuanganList([]);
    }
  };

  const fetchUserList = async () => {
    try {
      const res = await axios.get("/users");
      const data = res.data?.data || res.data || [];
      setUserList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat data user:", err);
      setUserList([]);
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

  const handleOpenRuanganModal = (mode, ruangan = null) => {
    setModalMode(mode);
    if (mode === "edit" && ruangan) {
      setSelectedRuangan(ruangan);
      setRuanganForm({
        nama_ruangan: ruangan.nama_ruangan,
        kapasitas: ruangan.kapasitas,
        lokasi: ruangan.lokasi,
        fasilitas: ruangan.fasilitas,
        status: ruangan.status
      });
    } else {
      setRuanganForm({
        nama_ruangan: "",
        kapasitas: "",
        lokasi: "",
        fasilitas: "",
        status: "tersedia"
      });
    }
    setShowRuanganModal(true);
  };

  const handleOpenUserModal = (mode, userData = null) => {
    setModalMode(mode);
    if (mode === "edit" && userData) {
      setSelectedUser(userData);
      setUserForm({
        nama: userData.nama || "",
        email: userData.email || "",
        role: userData.role || "user",
        departemen: userData.departemen || "",
        status: userData.status || "active"
      });
    } else {
      setUserForm({
        nama: "",
        email: "",
        role: "user",
        departemen: "",
        status: "active"
      });
    }
    setShowUserModal(true);
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

  const handleCloseRuanganModal = () => {
    setShowRuanganModal(false);
    setSelectedRuangan(null);
    setRuanganForm({
      nama_ruangan: "",
      kapasitas: "",
      lokasi: "",
      fasilitas: "",
      status: "tersedia"
    });
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
    setUserForm({
      nama: "",
      email: "",
      role: "user",
      departemen: "",
      status: "active"
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRuanganInputChange = (e) => {
    setRuanganForm({
      ...ruanganForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUserInputChange = (e) => {
    setUserForm({
      ...userForm,
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

  const handleRuanganSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "add") {
        await axios.post("/ruangan", ruanganForm);
        alert("Ruangan berhasil ditambahkan");
      } else {
        await axios.put(`/ruangan/${selectedRuangan.id}`, ruanganForm);
        alert("Ruangan berhasil diupdate");
      }
      handleCloseRuanganModal();
      fetchDashboardData();
      fetchRuanganList();
    } catch (err) {
      alert("Gagal menyimpan data ruangan");
      console.error(err);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "add") {
        await axios.post("/users", userForm);
        alert("User berhasil ditambahkan");
      } else {
        await axios.put(`/users/${selectedUser.id}`, userForm);
        alert("User berhasil diupdate");
      }
      handleCloseUserModal();
      fetchUserList();
    } catch (err) {
      alert("Gagal menyimpan data user");
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

  const handleDeleteRuangan = async (id) => {
    if (window.confirm("Yakin ingin menghapus ruangan ini?")) {
      try {
        await axios.delete(`/ruangan/${id}`);
        alert("Ruangan berhasil dihapus");
        fetchDashboardData();
        fetchRuanganList();
      } catch (err) {
        alert("Gagal menghapus ruangan");
        console.error(err);
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Yakin ingin menghapus user ini?")) {
      try {
        await axios.delete(`/users/${id}`);
        alert("User berhasil dihapus");
        fetchUserList();
      } catch (err) {
        alert("Gagal menghapus user");
        console.error(err);
      }
    }
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === "tambah-rapat") {
      handleOpenModal("add");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Render konten berdasarkan menu aktif
  const renderContent = () => {
    switch (activeMenu) {
      case "data-ruangan":
        return (
          <div className="relative z-10">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Ruangan</h2>
                    <p className="text-gray-600">Kelola data ruangan meeting</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleOpenRuanganModal("add")}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl border border-blue-500 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Tambah Ruangan</span>
                    </button>
                  </div>
                </div>

                {/* Table Ruangan */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Nama Ruangan</th>
                        <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Kapasitas</th>
                        <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Lokasi</th>
                        <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Fasilitas</th>
                        <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Status</th>
                        <th className="px-4 py-3 text-center text-gray-800 font-semibold text-sm">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!ruanganList || ruanganList.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8">
                            <div className="text-gray-500 flex flex-col items-center space-y-2">
                              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <p className="text-sm">Belum ada data ruangan</p>
                              <button
                                onClick={() => handleOpenRuanganModal("add")}
                                className="text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors duration-200"
                              >
                                Klik untuk tambah ruangan pertama
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        ruanganList.map((ruangan) => (
                          <tr 
                            key={ruangan.id} 
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="px-4 py-3 text-gray-800 font-medium text-sm">{ruangan.nama_ruangan}</td>
                            <td className="px-4 py-3 text-gray-600 text-sm">{ruangan.kapasitas} orang</td>
                            <td className="px-4 py-3 text-gray-600 text-sm">{ruangan.lokasi}</td>
                            <td className="px-4 py-3 text-gray-600 text-sm">
                              <div className="max-w-xs truncate" title={ruangan.fasilitas}>
                                {ruangan.fasilitas}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                  ruangan.status === "tersedia"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-red-100 text-red-800 border-red-200"
                                }`}
                              >
                                {ruangan.status === "tersedia" ? "Tersedia" : "Tidak Tersedia"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => handleOpenRuanganModal("edit", ruangan)}
                                  className="text-blue-500 hover:text-blue-600 transition-colors duration-200 p-1.5 hover:bg-blue-50 rounded-lg"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteRuangan(ruangan.id)}
                                  className="text-red-500 hover:text-red-600 transition-colors duration-200 p-1.5 hover:bg-red-50 rounded-lg"
                                  title="Hapus"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        );

      case "data-peserta":
        return (
          <div className="relative z-10">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Data User</h2>
                    <p className="text-gray-600">Kelola data user sistem</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleOpenUserModal("add")}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl border border-blue-500 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Tambah User</span>
                    </button>
                  </div>
                </div>

                {/* Table User */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Nama</th>
                        <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Email</th>
                        <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Role</th>
                        <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Unit kerja </th>
                        <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Status</th>
                        <th className="px-4 py-3 text-center text-gray-800 font-semibold text-sm">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!userList || userList.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-8">
                            <div className="text-gray-500 flex flex-col items-center space-y-2">
                              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <p className="text-sm">Belum ada data user</p>
                              <button
                                onClick={() => handleOpenUserModal("add")}
                                className="text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors duration-200"
                              >
                                Klik untuk tambah user pertama
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        userList.map((userData) => (
                          <tr 
                            key={userData.id} 
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <td className="px-4 py-3 text-gray-800 font-medium text-sm">{userData.nama}</td>
                            <td className="px-4 py-3 text-gray-600 text-sm">{userData.email}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                  userData.role === "admin"
                                    ? "bg-purple-100 text-purple-800 border-purple-200"
                                    : "bg-blue-100 text-blue-800 border-blue-200"
                                }`}
                              >
                                {userData.role === "admin" ? "Admin" : "User"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-sm">{userData.departemen}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                  userData.status === "active"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : "bg-red-100 text-red-800 border-red-200"
                                }`}
                              >
                                {userData.status === "active" ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => handleOpenUserModal("edit", userData)}
                                  className="text-blue-500 hover:text-blue-600 transition-colors duration-200 p-1.5 hover:bg-blue-50 rounded-lg"
                                  title="Edit"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(userData.id)}
                                  className="text-red-500 hover:text-red-600 transition-colors duration-200 p-1.5 hover:bg-red-50 rounded-lg"
                                  title="Hapus"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        );

      default:
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
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
              <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">Daftar Rapat Terkini</h2>
                      <p className="text-gray-600">Jadwal rapat hari ini</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleOpenModal("add")}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl border border-blue-500 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Tambah Rapat</span>
                      </button>
                    </div>
                  </div>

                  {/* Table Rapat */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Nama Rapat</th>
                          <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Jenis</th>
                          <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Tanggal</th>
                          <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Waktu</th>
                          <th className="px-4 py-3 text-center text-gray-800 font-semibold text-sm">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!rapatList || rapatList.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-8">
                              <div className="text-gray-500 flex flex-col items-center space-y-2">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <p className="text-sm">Belum ada data rapat</p>
                                <button
                                  onClick={() => handleOpenModal("add")}
                                  className="text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors duration-200"
                                >
                                  Klik untuk tambah rapat pertama
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          rapatList.map((rapat) => (
                            <tr 
                              key={rapat.id} 
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                            >
                              <td className="px-4 py-3 text-gray-800 font-medium text-sm">{rapat.nama_rapat}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                    rapat.jenis === "online"
                                      ? "bg-blue-100 text-blue-800 border-blue-200"
                                      : "bg-green-100 text-green-800 border-green-200"
                                  }`}
                                >
                                  {rapat.jenis === "online" ? "Online" : "Offline"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-600 text-sm">{rapat.tanggal}</td>
                              <td className="px-4 py-3 text-gray-600 text-sm">
                                <div className="flex items-center space-x-1">
                                  <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>{rapat.waktu_mulai} - {rapat.waktu_selesai}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center space-x-2">
                                  <button
                                    onClick={() => handleOpenModal("edit", rapat)}
                                    className="text-blue-500 hover:text-blue-600 transition-colors duration-200 p-1.5 hover:bg-blue-50 rounded-lg"
                                    title="Edit"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(rapat.id)}
                                    className="text-red-500 hover:text-red-600 transition-colors duration-200 p-1.5 hover:bg-red-50 rounded-lg"
                                    title="Hapus"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 relative overflow-hidden">
      {/* Background Elements - Diubah menjadi lebih subtle */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-50 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar dengan auto-hover */}
        <div 
          className={`bg-white backdrop-blur-md rounded-3xl border border-gray-200 shadow-xl h-[calc(100vh-3rem)] sticky top-6 transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-20'
          }`}
          onMouseEnter={handleSidebarMouseEnter}
          onMouseLeave={handleSidebarMouseLeave}
        >
          <div className="p-4 h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-white rounded-full p-2 shadow-lg flex-shrink-0">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_pupuk_kaltim.svg/1076px-Logo_pupuk_kaltim.svg.png" 
                  alt="Pupuk Kaltim Logo" 
                  className="h-8 w-8 object-contain"
                />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-gray-800 truncate">Menu Utama</h2>
                  <p className="text-gray-600 text-xs truncate">Sistem Reservasi</p>
                </div>
              )}
              {/* Tombol toggle untuk mobile */}
              <button
                onClick={toggleSidebar}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0 md:hidden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1">
              <div className="space-y-2">
                {/* Tambah Rapat Menu */}
                <button
                  onClick={() => handleMenuClick("tambah-rapat")}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                    activeMenu === "tambah-rapat" 
                      ? "bg-blue-50 text-blue-600 border border-blue-200" 
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  {sidebarOpen && (
                    <div className="text-left flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">Tambah Rapat</p>
                      <p className="text-xs text-gray-500 truncate">Buat jadwal rapat baru</p>
                    </div>
                  )}
                </button>

                {/* Master Data Section - Only visible for admin */}
                {user?.role === 'admin' && (
                  <div className="pt-4">
                  {sidebarOpen && (
                    <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider px-3 mb-3">Master Data</h3>
                  )}
                  
                  <button
                    onClick={() => handleMenuClick("data-ruangan")}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                      activeMenu === "data-ruangan" 
                        ? "bg-green-50 text-green-600 border border-green-200" 
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    {sidebarOpen && (
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">Data Ruangan</p>
                        <p className="text-xs text-gray-500 truncate">Kelola data ruangan</p>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => handleMenuClick("data-peserta")}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                      activeMenu === "data-peserta" 
                        ? "bg-purple-50 text-purple-600 border border-purple-200" 
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                  >
                    <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    {sidebarOpen && (
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">Data User</p>
                        <p className="text-xs text-gray-500 truncate">Kelola data user</p>
                      </div>
                    )}
                  </button>

                  
                </div>
                )}
              </div>
            </nav>

            {/* User Info & Logout */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-4">
                {sidebarOpen ? (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-semibold text-sm truncate">
                        {user?.nama || user?.mpk || user?.email || "User"}
                      </p>
                      <p className="text-gray-600 text-xs truncate">
                        {user?.role ? `Role: ${user.role}` : "Selamat datang!"}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-red-500 hover:text-red-600 transition-colors duration-200 p-2 hover:bg-red-50 rounded-lg flex-shrink-0"
                      title="Logout"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="w-full flex justify-center">
                    <button
                      onClick={handleLogout}
                      className="text-red-500 hover:text-red-600 transition-colors duration-200 p-2 hover:bg-red-50 rounded-lg"
                      title="Logout"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <div className="text-center">
                  <p className="text-gray-400 text-xs">
                    © 2025 Pupuk Kaltim
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Sistem Reservasi
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-0' : 'ml-0'}`}>
          {/* Header */}
          <div className="relative z-10 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard </h1>
                <p className="text-gray-600">Sistem Manajemen Rapat Pupuk Kaltim</p>
              </div>
              {/* Tombol toggle sidebar untuk mobile */}
              <button
                onClick={toggleSidebar}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl border border-blue-500 transition-all duration-300 hover:scale-105 flex items-center space-x-2 md:hidden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Menu</span>
              </button>
            </div>
          </div>

          {/* Render Content Berdasarkan Menu Aktif */}
          {renderContent()}
        </div>
      </div>

      {/* Modal Tambah/Edit Rapat */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {modalMode === "add" ? "Tambah Rapat" : "Edit Rapat"}
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Masukan link</label>
                  <input
                    type="text"
                    name="nama_rapat"
                    value={formData.nama_rapat}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="Masukkan link rapat"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Jenis Rapat</label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jenis"
                        value="online"
                        checked={formData.jenis === "online"}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-500 bg-gray-50 border-gray-200 focus:ring-blue-400"
                      />
                      <span className="text-gray-800 text-sm">Online</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jenis"
                        value="offline"
                        checked={formData.jenis === "offline"}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-500 bg-gray-50 border-gray-200 focus:ring-blue-400"
                      />
                      <span className="text-gray-800 text-sm">Offline</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Tanggal</label>
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2 text-sm">Waktu Mulai</label>
                    <input
                      type="time"
                      name="waktu_mulai"
                      value={formData.waktu_mulai}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2 text-sm">Waktu Selesai</label>
                    <input
                      type="time"
                      name="waktu_selesai"
                      value={formData.waktu_selesai}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                      required
                    />
                  </div>
                </div>

                {formData.jenis === "offline" && (
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2 text-sm">Ruangan</label>
                    <select
                      name="ruangan_id"
                      value={formData.ruangan_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    >
                      <option value="">Pilih Ruangan</option>
                      {ruanganList.filter(r => r.status === "tersedia").map(ruangan => (
                        <option key={ruangan.id} value={ruangan.id}>
                          {ruangan.nama_ruangan} - {ruangan.lokasi}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 text-sm"
                  >
                    {modalMode === "add" ? "Tambah" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Ruangan */}
      {showRuanganModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {modalMode === "add" ? "Tambah Ruangan" : "Edit Ruangan"}
                </h3>
                <button 
                  onClick={handleCloseRuanganModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleRuanganSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Nama Ruangan</label>
                  <input
                    type="text"
                    name="nama_ruangan"
                    value={ruanganForm.nama_ruangan}
                    onChange={handleRuanganInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="Masukkan nama ruangan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Kapasitas</label>
                  <input
                    type="number"
                    name="kapasitas"
                    value={ruanganForm.kapasitas}
                    onChange={handleRuanganInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="Masukkan kapasitas ruangan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Lokasi</label>
                  <input
                    type="text"
                    name="lokasi"
                    value={ruanganForm.lokasi}
                    onChange={handleRuanganInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="Masukkan lokasi ruangan"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Fasilitas</label>
                  <textarea
                    name="fasilitas"
                    value={ruanganForm.fasilitas}
                    onChange={handleRuanganInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm resize-none"
                    placeholder="Masukkan fasilitas ruangan (AC, Proyektor, Whiteboard, dll)"
                    rows="3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="tersedia"
                        checked={ruanganForm.status === "tersedia"}
                        onChange={handleRuanganInputChange}
                        className="w-4 h-4 text-blue-500 bg-gray-50 border-gray-200 focus:ring-blue-400"
                      />
                      <span className="text-gray-800 text-sm">Tersedia</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="tidak_tersedia"
                        checked={ruanganForm.status === "tidak_tersedia"}
                        onChange={handleRuanganInputChange}
                        className="w-4 h-4 text-blue-500 bg-gray-50 border-gray-200 focus:ring-blue-400"
                      />
                      <span className="text-gray-800 text-sm">Tidak Tersedia</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={handleCloseRuanganModal}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 text-sm"
                  >
                    {modalMode === "add" ? "Tambah" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit User */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {modalMode === "add" ? "Tambah User" : "Edit User"}
                </h3>
                <button 
                  onClick={handleCloseUserModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Nama</label>
                  <input
                    type="text"
                    name="nama"
                    value={userForm.nama}
                    onChange={handleUserInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="Masukkan nama user"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={userForm.email}
                    onChange={handleUserInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="Masukkan email user"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Role</label>
                  <select
                    name="role"
                    value={userForm.role}
                    onChange={handleUserInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Departemen</label>
                  <input
                    type="text"
                    name="departemen"
                    value={userForm.departemen}
                    onChange={handleUserInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="Masukkan departemen"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Status</label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={userForm.status === "active"}
                        onChange={handleUserInputChange}
                        className="w-4 h-4 text-blue-500 bg-gray-50 border-gray-200 focus:ring-blue-400"
                      />
                      <span className="text-gray-800 text-sm">Active</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="inactive"
                        checked={userForm.status === "inactive"}
                        onChange={handleUserInputChange}
                        className="w-4 h-4 text-blue-500 bg-gray-50 border-gray-200 focus:ring-blue-400"
                      />
                      <span className="text-gray-800 text-sm">Inactive</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={handleCloseUserModal}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 text-sm"
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

// StatCard Component (diperbarui untuk background putih)
const StatCard = ({ title, value, icon, gradient }) => {
  const renderIcon = () => {
    const iconClass = "w-6 h-6";
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
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:transform hover:scale-105 transition-all duration-300 group shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-xs font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg bg-gradient-to-r ${gradient} text-white group-hover:scale-110 transition-transform duration-300`}>
          {renderIcon()}
        </div>
      </div>
    </div>
  );
};