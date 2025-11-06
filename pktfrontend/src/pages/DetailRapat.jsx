import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../api/axiosClient";
import Toast from "../components/Toast";

export default function DetailRapat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rapat, setRapat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    fetchRapatDetail();
  }, [id]);

  const fetchRapatDetail = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/rapat/${id}`);
      const data = res.data?.data || res.data;

      if (data) {
        setRapat(data);
      } else {
        addToast("Data rapat tidak ditemukan", "error");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching rapat detail:", error);
      addToast("Gagal memuat detail rapat", "error");
      if (error.response?.status === 404) {
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (err) {
      return "Tanggal tidak tersedia";
    }
  };

  const formatTime = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch (err) {
      return timeString;
    }
  };

  const getRuanganName = (rapat) => {
    if (rapat.ruangan) {
      return rapat.ruangan.nama_ruangan;
    }
    return "Tidak tersedia";
  };

  const getPesertaList = (rapat) => {
    if (rapat.undangan && Array.isArray(rapat.undangan) && rapat.undangan.length > 0) {
      return rapat.undangan.map(inv => inv.user).filter(Boolean);
    }
    return [];
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleJoinMeeting = () => {
    if (rapat?.link_meeting) {
      window.open(rapat.link_meeting, '_blank');
    } else {
      addToast("Link meeting tidak tersedia", "warning");
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gray-900 flex items-center justify-center"
        style={{
          backgroundImage: "url('https://voffice.co.id/blog/wp-content/uploads/2024/03/meeting3.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Memuat detail rapat...</p>
        </div>
      </div>
    );
  }

  if (!rapat) {
    return (
      <div
        className="min-h-screen bg-gray-900 flex items-center justify-center"
        style={{
          backgroundImage: "url('https://voffice.co.id/blog/wp-content/uploads/2024/03/meeting3.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white">
          <p className="text-xl mb-4">Data rapat tidak ditemukan</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  const pesertaList = getPesertaList(rapat);

  return (
    <div
      className="min-h-screen bg-gray-900"
      style={{
        backgroundImage: "url('https://voffice.co.id/blog/wp-content/uploads/2024/03/meeting3.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{rapat.nama_rapat}</h1>
              <p className="text-gray-300">{formatDate(rapat.tanggal)} • {formatTime(rapat.waktu_mulai)} - {formatTime(rapat.waktu_selesai)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              rapat.jenis === "online"
                ? "bg-blue-500 text-white"
                : "bg-green-500 text-white"
            }`}>
              {rapat.jenis === "online" ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Room Info & Current Event */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {rapat.jenis === "offline" ? getRuanganName(rapat) : "Rapat online"}
                </h2>
                <div className={`w-3 h-3 rounded-full ${
                  rapat.status === 'berlangsung' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
              </div>

              {/* Current Event */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">CURRENT EVENT</h3>
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                  <div className="text-blue-800 font-semibold">
                    {formatTime(rapat.waktu_mulai)} - {formatTime(rapat.waktu_selesai)}
                  </div>
                  <div className="text-gray-800 font-bold text-lg mt-1">{rapat.nama_rapat}</div>
                  <div className="text-gray-600 text-sm mt-1">{rapat.deskripsi || "Meeting"}</div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">UPCOMING EVENTS</h3>
                <div className="space-y-3">
                  {/* Example upcoming events - you can replace with actual data */}
                  <div className="border-l-4 border-gray-300 rounded-r-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <div className="text-gray-500 text-sm">22 May 3:30 PM - 4:30 PM</div>
                    <div className="text-gray-800 font-semibold">Status Meeting Score Team</div>
                  </div>
                  <div className="border-l-4 border-gray-300 rounded-r-lg p-3 hover:bg-gray-50 cursor-pointer">
                    <div className="text-gray-500 text-sm">22 May 4:30 PM - 5:30 PM</div>
                    <div className="text-gray-800 font-semibold">Progress Update</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Deskripsi Rapat</h3>
              <p className="text-gray-600 leading-relaxed">
                {rapat.deskripsi || "Tidak ada deskripsi yang disediakan untuk rapat ini."}
              </p>
            </div>
          </div>

          {/* Right Column - Participants & Info */}
          <div className="space-y-6">
            {/* Participants Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Participants</h3>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                  {pesertaList.length} people
                </span>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {pesertaList.length > 0 ? (
                  pesertaList.map((user, index) => (
                    <div key={user.id || index} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {user.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">
                          {user.nama || user.mpk || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user.unit_kerja || user.email || ""}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Tidak ada peserta</p>
                )}
              </div>
            </div>

            {/* Meeting Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Meeting Information</h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className="font-medium text-gray-800 capitalize">{rapat.status || "Terjadwal"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Jenis Rapat</p>
                  <p className="font-medium text-gray-800">
                    {rapat.jenis === "online" ? "Rapat online" : "In-Person Meeting"}
                  </p>
                </div>

                {rapat.jenis === "offline" && rapat.ruangan && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ruangan</p>
                    <p className="font-medium text-gray-800">{getRuanganName(rapat)}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500 mb-1">Tanggal</p>
                  <p className="font-medium text-gray-800">{formatDate(rapat.tanggal)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Waktu</p>
                  <p className="font-medium text-gray-800">
                    {formatTime(rapat.waktu_mulai)} - {formatTime(rapat.waktu_selesai)}
                  </p>
                </div>
              </div>

              {/* Join Button for Online Meetings */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
