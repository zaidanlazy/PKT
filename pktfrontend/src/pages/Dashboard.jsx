import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axiosClient";
import Toast from "../components/Toast";
import StatCard from "../components/StatCard";
import SidebarLayout from "../components/SidebarLayout";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState({
    total_ruangan: 0,
    total_rapat: 0,
    total_online: 0,
    total_offline: 0,
    total_rapat_hari_ini: 0,
    ruangan_tidak_tersedia: 0,
  });

  const [rapatList, setRapatList] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    fetchDashboardData();
    fetchRapatList();
  }, []);

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      fetchDashboardData();
      fetchRapatList();
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleFocus = () => {
      fetchDashboardData();
      fetchRapatList();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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
      const res = await axios.get("/rapat-today-all");
      const payload = res.data?.data || res.data || [];
      setRapatList(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error("Gagal memuat data rapat:", err);
      addToast("Gagal memuat data rapat", "error");
      setRapatList([]);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatRealTime = (date) =>
    date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  const formatRealDate = (date) =>
    date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleShowDetail = (rapat) => navigate(`/rapat/detail/${rapat.id}`);

  const renderContent = () => {
    const pad2 = (n) => String(n).padStart(2, "0");
    const toLocalKey = (d) =>
      `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    const getDateKey = (value) => {
      if (typeof value === "string") {
        const key = value.slice(0, 10);
        if (/^\d{4}-\d{2}-\d{2}$/.test(key)) return key;
      }
      const dt = new Date(value);
      return toLocalKey(dt);
    };
    const todayKey = toLocalKey(new Date());
    const nowHHmm = new Date().toTimeString().slice(0, 5);
    const rapatHariIni = Array.isArray(rapatList)
      ? rapatList.filter((r) => getDateKey(r.tanggal) === todayKey)
      : [];

    return (
      <>
        {/* Header & Clock Widget */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm md:text-base max-w-xl">
              Pantau ketersediaan ruangan dan jadwal rapat harian di lingkungan Pupuk Kaltim.
            </p>
          </div>

          {/* Time Widget */}
          <div className="w-full lg:w-auto bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between lg:justify-end gap-6">
            <div className="text-right">
              <div className="text-2xl font-semibold tracking-tight text-blue-600 font-mono leading-none">
                {formatRealTime(currentTime)}
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                {formatRealDate(currentTime)}
              </div>
            </div>
            <div className="h-10 w-px bg-gray-100"></div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-xs font-medium text-gray-900">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Bontang
              </div>
              <div className="text-xs text-gray-400 mt-0.5">Kalimantan Timur</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Ruangan */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21h18M5 21V7l8-4 8 4v14" />
                </svg>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-600">Total</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 tracking-tight">{data.total_ruangan}</div>
              <p className="text-xs text-gray-500 mt-1">Total Ruangan Meeting</p>
            </div>
          </div>

            {/* Total Rapat Hari Ini */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-600/10">Total</span>
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-900 tracking-tight">{data.total_rapat_hari_ini}</div>
                <p className="text-xs text-gray-500 mt-1">Total Rapat Hari Ini</p>
            </div>
            </div>

          {/* Rapat Online */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect width="15" height="14" x="1" y="5" rx="2" ry="2" />
                </svg>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-50 text-purple-600 ring-1 ring-inset ring-purple-600/10">online</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 tracking-tight">{data.total_online}</div>
              <p className="text-xs text-gray-500 mt-1">Rapat Online Hari Ini</p>
            </div>
          </div>

          {/* Rapat Offline */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-50 text-orange-600 ring-1 ring-inset ring-orange-600/10">Offline</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 tracking-tight">{data.total_offline}</div>
              <p className="text-xs text-gray-500 mt-1">Rapat Offline Hari Ini</p>
            </div>
          </div>
        </div>

        {/* Main Table Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Agenda Rapat Hari Ini</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {rapatHariIni.length > 0 ? `${rapatHariIni.length} Rapat terjadwal untuk hari ini` : "Belum ada rapat terjadwal"}
              </p>
            </div>
            <div className="flex gap-2">
            </div>
          </div>

          {rapatHariIni.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="bg-gray-50 p-4 rounded-full mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-gray-900">Tidak ada rapat</h3>
              <p className="text-xs text-gray-500 mt-1">Belum ada agenda rapat untuk hari ini.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-3">Nama Rapat</th>
                      <th className="px-6 py-3 w-32">Jenis</th>
                      <th className="px-6 py-3 w-40">Tanggal</th>
                      <th className="px-6 py-3 w-48">Waktu</th>
                      <th className="px-6 py-3 w-32 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rapatHariIni.map((rapat) => {
                      const isActive = getDateKey(rapat.tanggal) === todayKey && nowHHmm >= rapat.waktu_mulai && nowHHmm <= rapat.waktu_selesai;

                      return (
                        <tr key={rapat.id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse' : 'bg-gray-300'}`}></div>
                              <div>
                                <div className="font-medium text-gray-900">{rapat.nama_rapat}</div>
                                <div className="text-xs text-gray-500 mt-0.5">
                                  {rapat.ruangan?.nama_ruangan || rapat.link_meeting || "-"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {rapat.jenis === "online" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <polygon points="23 7 16 12 23 17 23 7" />
                                  <rect width="15" height="14" x="1" y="5" rx="2" ry="2" />
                                </svg>
                                Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                                Offline
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-medium text-xs">
                            {formatDate(rapat.tanggal)}
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                            {rapat.waktu_mulai} - {rapat.waktu_selesai}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {rapat.jenis === "offline" && !(getDateKey(rapat.tanggal) === todayKey && nowHHmm > rapat.waktu_selesai) && (
                              <button
                                onClick={() => handleShowDetail(rapat)}
                                className="text-blue-600 hover:text-blue-700 text-xs font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                              >
                                Detail
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Menampilkan <span className="font-medium text-gray-900">1</span> sampai{" "}
                  <span className="font-medium text-gray-900">{rapatHariIni.length}</span> dari{" "}
                  <span className="font-medium text-gray-900">{rapatHariIni.length}</span> data
                </p>
                <div className="flex gap-2">
                  <button className="px-2 py-1 border border-gray-200 rounded text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50" disabled>
                    Previous
                  </button>
                  <button className="px-2 py-1 border border-gray-200 rounded text-xs font-medium text-gray-700 hover:bg-gray-50" disabled>
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  return (
    <SidebarLayout title="">
      {/* Toast notification */}
      <div className="fixed top-6 right-6 z-50 space-y-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {renderContent()}
    </SidebarLayout>
  );
}
