import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";

export default function SidebarLayout({ title, subtitle = "", children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "delete",
    confirmText: "Hapus",
    cancelText: "Batal",
  });

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

  const routeToKey = (path) => {
    if (path.startsWith("/dashboard")) return "dashboard";
    if (path.startsWith("/rapat")) return "tambah-rapat";
    if (path.startsWith("/ruangan")) return "data-ruangan";
    if (path.startsWith("/user")) return "data-peserta";
    return "";
  };

  const activeKey = routeToKey(location.pathname);

  const handleMenuClick = (menu) => {
    switch (menu) {
      case "dashboard":
        navigate("/dashboard");
        break;
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
        break;
    }
    setSidebarOpen(false);
  };

  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10" />
      ),
    },
    {
      key: "tambah-rapat",
      label: "Rapat",
      icon: (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
        </>
      ),
    },
  ];

  const adminMenuItems = [
    {
      key: "data-ruangan",
      label: "Data Ruangan",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      ),
    },
    {
      key: "data-peserta",
      label: "Data User",
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 relative overflow-hidden">
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

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="flex gap-4 relative z-10">
        {/* Sidebar */}
        <aside
          className={`bg-white/80 backdrop-blur-lg rounded-2xl border border-gray-200/60 shadow-sm h-[calc(100vh-2rem)] sticky top-4 transition-all duration-300 flex flex-col justify-between ${
            sidebarOpen ? "w-64" : "w-20"
          } overflow-hidden`}
          onMouseEnter={handleSidebarMouseEnter}
          onMouseLeave={handleSidebarMouseLeave}
        >
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Header */}
            <div className="p-4 flex-1">
              <div className="flex items-center space-x-3 mb-8">
                <div className="bg-white rounded-xl p-2 shadow-sm flex-shrink-0 border border-gray-100">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_pupuk_kaltim.svg/1076px-Logo_pupuk_kaltim.svg.png"
                    alt="Pupuk Kaltim Logo"
                    className="h-7 w-7 object-contain"
                  />
                </div>

                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base font-semibold text-gray-800 truncate">Menu</h2>
                    <p className="text-gray-500 text-xs truncate">Reservasi Tempat</p>
                  </div>
                )}

                <button
                  onClick={toggleSidebar}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0 md:hidden"
                  title="Toggle sidebar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                  </svg>
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1">
                <div className="flex flex-col items-center md:items-stretch space-y-1">
                  {menuItems.map((mi) => {
                    const active = activeKey === mi.key;
                    return (
                      <button
                        key={mi.key}
                        onClick={() => handleMenuClick(mi.key)}
                        className={`flex items-center gap-3 transition-all duration-200 focus:outline-none ${
                          sidebarOpen ? "w-full px-3 py-2.5 rounded-xl" : "w-full flex justify-center py-2.5"
                        } ${
                          active
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                        title={mi.label}
                      >
                        <div
                          className={`h-9 w-9 flex items-center justify-center rounded-xl transition-colors ${
                            active
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mi.icon}
                          </svg>
                        </div>

                        {sidebarOpen && (
                          <div className="text-left">
                            <div className={`text-sm font-medium ${active ? "text-blue-700" : "text-gray-700"}`}>
                              {mi.label}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Admin Menu */}
                  {user?.role === "admin" && (
                    <>
                      <div className="w-full border-t border-gray-100 my-3" />
                      {adminMenuItems.map((mi) => {
                        const active = activeKey === mi.key;
                        return (
                          <button
                            key={mi.key}
                            onClick={() => handleMenuClick(mi.key)}
                            className={`flex items-center gap-3 transition-all duration-200 ${
                              sidebarOpen ? "w-full px-3 py-2.5 rounded-xl" : "w-full flex justify-center py-2.5"
                            } ${
                              active
                                ? "bg-blue-50 text-blue-700 border border-blue-100"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                            title={mi.label}
                          >
                            <div
                              className={`h-9 w-9 flex items-center justify-center rounded-xl transition-colors ${
                                active
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {mi.icon}
                              </svg>
                            </div>
                            {sidebarOpen && (
                              <div className="text-sm font-medium text-gray-700">
                                {mi.label}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100/60 mt-auto">
              <div className="flex items-center justify-between mb-4">
                {sidebarOpen ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {user?.nama?.[0] || user?.npk?.[0] || "U"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium text-sm truncate">
                          {user?.nama || user?.npk || user?.email || "User"}
                        </p>
                        <p className="text-gray-500 text-xs truncate capitalize">
                          {user?.role || "User"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 hover:bg-red-50 rounded-lg flex-shrink-0"
                      title="Logout"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="w-full flex justify-center">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.nama?.[0] || user?.npk?.[0] || "U"}
                        </span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 hover:bg-red-50 rounded-lg"
                        title="Logout"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <div className="text-center">
                  <p className="text-gray-400 text-xs">© 2025 Pupuk Kaltim</p>
                  <p className="text-gray-400 text-xs mt-0.5">Sistem Reservasi</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 transition-all duration-300 min-w-0">
          <div className="relative z-10 mb-6">
            <div className="flex justify-between items-center">
              <div>
                {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                {subtitle && <p className="text-gray-600 text-sm mt-1">{subtitle}</p>}
              </div>
              <button
                onClick={toggleSidebar}
                className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-sm md:hidden flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="text-sm">Menu</span>
              </button>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
