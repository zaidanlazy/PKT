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
    ruangan_tersedia: 0,
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

  // Refresh data when navigating to dashboard
  useEffect(() => {
    if (location.pathname === "/dashboard") {
      fetchDashboardData();
      fetchRapatList();
    }
  }, [location.pathname]);

  // Refresh data when window gains focus (user comes back to tab)
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
      month: "long",
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
        {/* === Header utama: Dashboard kiri, waktu kanan === */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          {/* Kiri: Judul dan subjudul */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">
              Sistem Manajemen Rapat Pupuk Kaltim
            </p>
          </div>
{/* Kanan: Jam, tanggal, lokasi */}
<div className="bg-white rounded-xl border border-gray-200 shadow-sm px-8 py-6 mt-5 lg:mt-0 text-right flex flex-col justify-center">
  {/* JAM */}
  <div className="flex items-center justify-end gap-2 text-blue-600 font-mono font-semibold text-2xl mb-1 leading-none">
    <svg
      className="w-4 h-4 text-blue-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    {formatRealTime(currentTime)}
  </div>

  {/* TANGGAL */}
  <div className="text-sm text-gray-600 font-medium leading-tight">
    {formatRealDate(currentTime)}
  </div>

  {/* LOKASI */}
  <div className="text-xs text-gray-500 flex justify-end items-center gap-1 mt-1 leading-tight">
    <svg
      className="w-3 h-3 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
        Bontang, Kalimantan imur
  </div>
</div>


        </div>

        {/* === Statistik === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Ruangan"
            value={data.total_ruangan}
            icon="building"
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            title="Ruangan Tersedia"
            value={data.ruangan_tersedia}
            icon={data.ruangan_tersedia === 0 ? "x" : "check"}
            gradient={data.ruangan_tersedia === 0 ? "from-red-500 to-orange-500" : "from-green-500 to-emerald-500"}
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

        {/* === Daftar Rapat === */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  Daftar Rapat Hari Ini
                </h2>
                <p className="text-gray-600 text-sm">
                  {rapatHariIni.length > 0
                    ? `${rapatHariIni.length} rapat terjadwal hari ini`
                    : "Tidak ada rapat terjadwal hari ini"}
                </p>
              </div>
            </div>

            {rapatHariIni.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 flex flex-col items-center gap-3">
                  <svg
                    className="w-12 h-12 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      Tidak ada rapat untuk hari ini
                    </p>
                    <button
                      onClick={() => navigate("/rapat")}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Klik untuk tambah rapat pertama
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Name meetings
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                        Time
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rapatHariIni.map((rapat) => (
                      <tr
                        key={rapat.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {rapat.nama_rapat}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              rapat.jenis === "online"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {rapat.jenis === "online" ? "Online" : "Offline"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(rapat.tanggal)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <svg
                              className="w-3 h-3 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {rapat.waktu_mulai} - {rapat.waktu_selesai}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {rapat.jenis === "offline" ? (
                            getDateKey(rapat.tanggal) === todayKey && nowHHmm > rapat.waktu_selesai ? (
                              <span className="text-xs font-medium text-gray-500">

                              </span>
                            ) : (
                              <button
                                onClick={() => handleShowDetail(rapat)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium inline-flex items-center gap-1 transition-colors"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                detail
                              </button>
                            )
                          ) : (
                            <span className="text-xs text-gray-400 italic">

                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
