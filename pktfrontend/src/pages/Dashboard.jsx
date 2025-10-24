import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // --- Data state ---
  const [data, setData] = useState({
    total_ruangan: 0,
    total_rapat: 0,
    total_online: 0,
    total_offline: 0,
    ruangan_tersedia: 0,
    ruangan_tidak_tersedia: 0,
  });

  const [rapatList, setRapatList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [toasts, setToasts] = useState([]);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "delete",
    confirmText: "Hapus",
    cancelText: "Batal",
  });

  // --- Toast helpers ---
  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Confirm modal helpers ---
  const showConfirmModal = (options) => {
    setConfirmModal({
      isOpen: true,
      title: options.title || "Konfirmasi",
      message: options.message || "Apakah Anda yakin?",
      onConfirm: options.onConfirm,
      type: options.type || "delete",
      confirmText: options.confirmText || "Hapus",
      cancelText: options.cancelText || "Batal",
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null,
      type: "delete",
      confirmText: "Hapus",
      cancelText: "Batal",
    });
  };

  // --- Data fetching ---
  useEffect(() => {
    fetchDashboardData();
    fetchRapatList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Gagal memuat data dashboard", err);
      addToast("Gagal memuat data dashboard", "error");
    }
  };

  const fetchRapatList = async () => {
    try {
      const res = await axios.get("/rapat");
      const payload = res.data?.data || res.data || [];
      setRapatList(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error("Gagal memuat data rapat:", err);
      setRapatList([]);
      addToast("Gagal memuat data rapat", "error");
    }
  };

  // --- Sidebar hover open logic ---
  useEffect(() => {
    let timer;
    if (sidebarHover) {
      setSidebarOpen(true);
    } else {
      timer = setTimeout(() => setSidebarOpen(false), 220);
    }
    return () => clearTimeout(timer);
  }, [sidebarHover]);

  const handleSidebarMouseEnter = () => setSidebarHover(true);
  const handleSidebarMouseLeave = () => setSidebarHover(false);
  const toggleSidebar = () => setSidebarOpen((s) => !s);

  // --- Logout with confirm ---
  const handleLogout = () => {
    showConfirmModal({
      title: "Konfirmasi Logout",
      message: "Apakah Anda yakin ingin keluar dari sistem?",
      onConfirm: () => {
        logout();
        navigate("/login");
        closeConfirmModal();
      },
      type: "warning",
      confirmText: "Logout",
      cancelText: "Batal",
    });
  };

  // --- Navigation handlers ---
  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    
    // Navigate to different pages based on menu
    switch (menu) {
      case "tambah-rapat":
        navigate("/rapat");
        break;
      case "undangan":
        navigate("/undangan");
        break;
      case "data-ruangan":
        navigate("/ruangan/list");
        break;
      case "data-peserta":
        navigate("/user");
        break;
      default:
        // Stay on dashboard
        break;
    }
  };

  // --- Detail Rapat Handler - Navigate to detail page ---
  const handleShowDetail = (rapat) => {
    navigate(`/rapat/detail/${rapat.id}`);
  };

  // --- Menu items ---
  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      gradientFrom: "from-blue-50",
      gradientTo: "to-blue-100",
      stroke: "#2563eb",
      svgPath: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10" />
      ),
    },
    {
      key: "tambah-rapat",
      label: "Tambah Rapat",
      gradientFrom: "from-green-50",
      gradientTo: "to-emerald-100",
      stroke: "#059669",
      svgPath: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    },
    {
      key: "undangan",
      label: "Undangan Rapat",
      gradientFrom: "from-indigo-50",
      gradientTo: "to-indigo-100",
      stroke: "#4f46e5",
      svgPath: (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
        </>
      ),
    },
  ];

  // --- Format date and time helpers ---
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // --- Render content ---
  const renderContent = () => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
          <StatCard
            title="Total Ruangan"
            value={data.total_ruangan}
            icon="building"
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Ruangan Tersedia"
            value={data.ruangan_tersedia}
            icon="check"
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            title="Rapat Online"
            value={data.total_online}
            icon="video"
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            title="Rapat Offline"
            value={data.total_offline}
            icon="users"
            gradient="from-orange-500 to-red-500"
          />
        </div>

        <div id="rapat-list" className="relative z-10">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Daftar Rapat Terkini</h2>
                  <p className="text-gray-600">Jadwal rapat hari ini</p>
                </div>
                <button
                  onClick={() => navigate("/rapat")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl border border-blue-500 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Tambah Rapat</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">Nama kegiatan Rapat</th>
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
                              onClick={() => navigate("/rapat")}
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
                          <td className="px-4 py-3 text-gray-600 text-sm">
                            {formatDate(rapat.tanggal)}
                          </td>
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
                                onClick={() => handleShowDetail(rapat)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                                title="Lihat Detail"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>Detail</span>
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
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 relative overflow-hidden">
      {/* Toast container */}
      <div className="fixed top-6 right-6 z-50 space-y-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      {/* Confirm modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
      />

      {/* Background decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="flex gap-6 relative z-10">
        {/* Sidebar */}
        <aside
          className={`bg-white rounded-3xl border border-gray-200 shadow-xl h-[calc(100vh-3rem)] sticky top-6 transition-all duration-300 flex flex-col justify-between ${sidebarOpen ? "w-64" : "w-20"} overflow-hidden`}
          onMouseEnter={handleSidebarMouseEnter}
          onMouseLeave={handleSidebarMouseLeave}
        >
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="p-4 flex-1">
              {/* Header logo */}
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

                <button
                  onClick={toggleSidebar}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0 md:hidden"
                  title="Toggle sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                </button>
              </div>

              {/* Menu */}
              <nav className="flex-1">
                <div className="flex flex-col items-center md:items-stretch space-y-2">
                  {menuItems.map((mi) => {
                    const active = activeMenu === mi.key;
                    return (
                      <button
                        key={mi.key}
                        onClick={() => handleMenuClick(mi.key)}
                        className={`flex items-center gap-3 transition-all duration-200 focus:outline-none ${sidebarOpen ? "w-full px-3 py-3 rounded-xl" : "w-full flex justify-center py-2"} ${active ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-50"}`}
                        title={mi.label}
                      >
                        <div
                          className={`h-11 w-11 flex items-center justify-center rounded-2xl shadow-md transition-transform duration-200 ${active ? "from-blue-100 to-blue-200" : `${mi.gradientFrom} ${mi.gradientTo}`}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke={active ? "#2563eb" : mi.stroke} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            {mi.svgPath}
                          </svg>
                        </div>

                        {sidebarOpen && (
                          <div className={`${active ? "text-blue-700 font-semibold" : "text-gray-700"}`}>
                            <div className="text-sm">{mi.label}</div>
                            <div className={`text-xs ${active ? "text-blue-500" : "text-gray-400"}`}>
                              {mi.key === "dashboard" ? "Overview sistem" : mi.label === "Tambah Rapat" ? "Buat jadwal rapat baru" : "Kelola undangan"}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Admin-only group */}
                  {user?.role === "admin" && (
                    <>
                      <div className="w-full border-t border-gray-100 my-3" />

                      <button
                        onClick={() => handleMenuClick("data-ruangan")}
                        className={`flex items-center gap-3 transition-all duration-200 ${sidebarOpen ? "w-full px-3 py-3 rounded-xl" : "w-full flex justify-center py-2"} ${activeMenu === "data-ruangan" ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-50"}`}
                        title="Data Ruangan"
                      >
                        <div className={`h-11 w-11 flex items-center justify-center rounded-2xl shadow-md ${activeMenu === "data-ruangan" ? "from-blue-100 to-blue-200" : "bg-purple-50"}`}>
                          <svg className="w-5 h-5" fill="none" stroke={activeMenu === "data-ruangan" ? "#2563eb" : "#6d28d9"} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        {sidebarOpen && (
                          <div className={`${activeMenu === "data-ruangan" ? "text-blue-700 font-semibold" : "text-gray-700"}`}>
                            Data Ruangan
                            <div className={`text-xs ${activeMenu === "data-ruangan" ? "text-blue-500" : "text-gray-400"}`}>Kelola data ruangan</div>
                          </div>
                        )}
                      </button>

                      <button
                        onClick={() => handleMenuClick("data-peserta")}
                        className={`flex items-center gap-3 transition-all duration-200 ${sidebarOpen ? "w-full px-3 py-3 rounded-xl" : "w-full flex justify-center py-2"} ${activeMenu === "data-peserta" ? "bg-blue-50 border border-blue-100" : "hover:bg-gray-50"}`}
                        title="Data User"
                      >
                        <div className={`h-11 w-11 flex items-center justify-center rounded-2xl shadow-md ${activeMenu === "data-peserta" ? "from-blue-100 to-blue-200" : "bg-orange-50"}`}>
                          <svg className="w-5 h-5" fill="none" stroke={activeMenu === "data-peserta" ? "#2563eb" : "#ea580c"} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        {sidebarOpen && (
                          <div className={`${activeMenu === "data-peserta" ? "text-blue-700 font-semibold" : "text-gray-700"}`}>
                            Data User
                            <div className={`text-xs ${activeMenu === "data-peserta" ? "text-blue-500" : "text-gray-400"}`}>Kelola data user</div>
                          </div>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </nav>
            </div>

            {/* Footer area inside sidebar */}
            <div className="p-4 border-t border-gray-100 mt-auto">
              <div className="flex items-center justify-between mb-4">
                {sidebarOpen ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-semibold text-sm truncate">
                          {user?.nama || user?.mpk || user?.email || "User"}
                        </p>
                        <p className="text-gray-600 text-xs truncate">
                          {user?.role ? `Role: ${user.role}` : "Selamat datang!"}
                        </p>
                      </div>
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
                    <div className="flex flex-col items-center space-y-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
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
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <div className="text-center">
                  <p className="text-gray-400 text-xs">© 2025 Pupuk Kaltim</p>
                  <p className="text-gray-400 text-xs mt-1">Sistem Reservasi</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 transition-all duration-300">
          <div className="relative z-10 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Sistem Manajemen Rapat Pupuk Kaltim</p>
              </div>
              <button
                onClick={toggleSidebar}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl border border-blue-500 transition-all duration-300 hover:scale-105 md:hidden"
              >
                <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Menu</span>
              </button>
            </div>
          </div>

          {renderContent()}
        </div>
      </div>
    </div>
  );
}