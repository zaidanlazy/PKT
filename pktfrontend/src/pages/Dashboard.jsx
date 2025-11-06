import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosClient";
import Toast from "../components/Toast";
import StatCard from "../components/StatCard";
import SidebarLayout from "../components/SidebarLayout";

export default function Dashboard() {
  const navigate = useNavigate();

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
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
      const res = await axios.get("/rapat-ruang");
      const payload = res.data?.data || res.data || [];
      setRapatList(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error("Gagal memuat data rapat:", err);
      setRapatList([]);
      addToast("Gagal memuat data rapat", "error");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatRealTime = (date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const formatRealDate = (date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleShowDetail = (rapat) => {
    navigate(`/rapat/detail/${rapat.id}`);
  };

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
    const rapatHariIni =
      (rapatList || []).filter((r) => getDateKey(r.tanggal) === todayKey);

    return (
      <>
        <div className="flex justify-between items-start mb-8">
          <div></div>

          <div className="text-right bg-white rounded-2xl border border-gray-200 shadow-lg p-4 min-w-[280px]">
            <div className="text-sm text-gray-500 font-medium mb-1">
              Bontang, Kalimantan Timur
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {formatRealTime(currentTime)}
            </div>
            <div className="text-sm text-gray-600">
              {formatRealDate(currentTime)}
            </div>
          </div>
        </div>

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
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Daftar Rapat Terkini
                  </h2>
                  <p className="text-gray-600">Jadwal rapat hari ini</p>
                </div>
                <button
                  onClick={() => navigate("/rapat")}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl border border-blue-500 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Tambah Rapat</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">
                        Nama Kegiatan Rapat
                      </th>
                      <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">
                        Jenis
                      </th>
                      <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-left text-gray-800 font-semibold text-sm">
                        Waktu
                      </th>
                      <th className="px-4 py-3 text-center text-gray-800 font-semibold text-sm">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!rapatHariIni || rapatHariIni.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-8">
                          <div className="text-gray-500 flex flex-col items-center space-y-2">
                            <svg
                              className="w-10 h-10"
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
                            <p className="text-sm">Tidak ada rapat untuk hari ini</p>
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
                      rapatHariIni.map((rapat) => (
                        <tr
                          key={rapat.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <td className="px-4 py-3 text-gray-800 font-medium text-sm">
                            {rapat.nama_rapat}
                          </td>

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
                              <svg
                                className="w-3 h-3 text-blue-500"
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
                              <span>
                                {rapat.waktu_mulai} - {rapat.waktu_selesai}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex justify-center space-x-2">

                              {/* ✅ Hanya OFFLINE boleh lihat detail */}
                              {rapat.jenis === "offline" && (
                                <button
                                  onClick={() => handleShowDetail(rapat)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-2"
                                  title="Lihat Detail"
                                >
                                  <svg
                                    className="w-4 h-4"
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
                                  <span>Detail</span>
                                </button>
                              )}

                              {/* ❌ Jika ONLINE, tidak bisa lihat detail */}
                              {rapat.jenis === "online" && (
                                <span className="text-xs text-gray-400 italic">
                                  Tidak ada detail
                                </span>
                              )}
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
    <SidebarLayout title="Dashboard">
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
