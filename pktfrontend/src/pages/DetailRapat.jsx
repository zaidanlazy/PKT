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

  const formatTimeForDisplay = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (err) {
      return timeString;
    }
  };

  const formatDateForDisplay = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      return `${day} ${month}`;
    } catch (err) {
      return dateString;
    }
  };

  const getRuanganName = (rapat) => {
    if (rapat.ruangan) {
      return rapat.ruangan.nama_ruangan;
    }
    return "Room 2";
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
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail rapat...</p>
        </div>
      </div>
    );
  }

  if (!rapat) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-800 mb-4">Data rapat tidak ditemukan</p>
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
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 bg-white hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Detail Rapat</h1>
              <p className="text-gray-600">Informasi lengkap tentang rapat</p>
            </div>
          </div>
        </div>

        {/* Main Content - Full height without scroll */}
        <div className="flex-1 px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Left Column - Room Info & Current Event */}
            <div className="lg:col-span-2 flex flex-col h-full">
              <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {rapat.jenis === "offline" ? getRuanganName(rapat) : "Virtual Meeting Room"}
                    </h2>
                    <div className="flex items-center space-x-2 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{formatDateForDisplay(rapat.tanggal)} {formatTimeForDisplay(rapat.waktu_mulai)}</span>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    rapat.status === 'berlangsung' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                </div>

                {/* Current Event */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-500 mb-4">Current Event</h3>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                    <div className="text-blue-100 text-sm mb-2">
                      {formatTimeForDisplay(rapat.waktu_mulai)} - {formatTimeForDisplay(rapat.waktu_selesai)}
                    </div>
                    <div className="text-2xl font-bold mb-2">{rapat.nama_rapat}</div>
                    <div className="text-blue-100">{rapat.deskripsi || "Team Meeting"}</div>
                  </div>
                </div>

                {/* Next Events */}
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-500 mb-4">Next Events</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-500 text-sm">22 May 3:30 PM - 4:30 PM</div>
                        <div className="text-gray-800 font-semibold">Status Meeting Scrum Team</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-500 text-sm">22 May 4:30 PM - 5:30 PM</div>
                        <div className="text-gray-800 font-semibold">Progress Update</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Participants & Info */}
            <div className="flex flex-col space-y-6 h-full">
              {/* Join Meeting Card */}
              {rapat.jenis === "online" && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Join Meeting</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Klik tombol di bawah untuk bergabung ke meeting online
                  </p>
                  <button
                    onClick={handleJoinMeeting}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Join Meeting</span>
                  </button>
                </div>
              )}

              {/* Participants Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Participants</h3>
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    {pesertaList.length} people
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {pesertaList.length > 0 ? (
                    <div className="space-y-3">
                      {pesertaList.map((user, index) => (
                        <div key={user.id || index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {user.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 text-sm">
                              {user.nama || user.mpk || "User"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.unit_kerja || user.email || ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-sm">Tidak ada peserta</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Meeting Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Meeting Information</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className="font-medium text-gray-800 capitalize">{rapat.status || "Terjadwal"}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Jenis</span>
                    <span className="font-medium text-gray-800">
                      {rapat.jenis === "online" ? "Online" : "Offline"}
                    </span>
                  </div>

                  {rapat.jenis === "offline" && rapat.ruangan && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Ruangan</span>
                      <span className="font-medium text-gray-800">{getRuanganName(rapat)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Tanggal</span>
                    <span className="font-medium text-gray-800">{formatDate(rapat.tanggal)}</span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-500">Waktu</span>
                    <span className="font-medium text-gray-800">
                      {formatTime(rapat.waktu_mulai)} - {formatTime(rapat.waktu_selesai)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}