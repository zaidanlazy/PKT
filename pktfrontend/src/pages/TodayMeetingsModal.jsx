import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Komponen Modal untuk menampilkan rapat hari ini dengan design minimalis
export default function TodayMeetingsModal({ isOpen, onClose }) {
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [now, setNow] = useState(new Date());
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  // Update waktu real-time
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-hide notification setelah 3 detik
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch data rapat hari ini (tanpa autentikasi)
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);

      fetch("http://localhost:8000/api/rapat/hari-ini/public")
        .then((res) => {
          if (!res.ok) {
            throw new Error('Gagal mengambil data');
          }
          return res.json();
        })
        .then((json) => {
          console.log('Data rapat hari ini:', json.data);
          setTodayMeetings(json.data || []);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message);
          setTodayMeetings([]);
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  // Fungsi untuk mendapatkan key tanggal yang konsisten
  const getDateKey = (value) => {
    if (typeof value === "string") {
      const key = value.slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(key)) return key;
    }
    const dt = new Date(value);
    const pad2 = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
  };

  const handleMeetingClick = (meeting) => {
    if (meeting.jenis === 'online') {
      setNotification("Rapat online - tidak dapat melihat detail ruangan");
      return;
    }
    setSelectedMeeting(meeting);
    setShowDetail(true);
  };

  const handleNavigateToDetail = (rapatId) => {
    navigate(`/rapat/detail/${rapatId}`);
    onClose();
  };

  const handleBackToList = () => {
    setShowDetail(false);
    setSelectedMeeting(null);
  };

  const handleGoToDetailPage = () => {
    if (selectedMeeting) {
      navigate(`/rapat/detail/${selectedMeeting.id}`);
      onClose();
    }
  };

  // PERBAIKAN: Format waktu yang benar
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return "";

    // timeStr sudah dalam format "HH:mm" dari API (contoh: "08:00")
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${m} ${ampm}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getMeetingStatus = (meeting) => {
    if (!meeting.tanggal || !meeting.waktu_mulai || !meeting.waktu_selesai) {
      return "akan-datang";
    }

    const meetingDate = getDateKey(meeting.tanggal);
    const todayKey = now.toISOString().slice(0, 10);

    // Jika bukan hari ini, kembalikan status berdasarkan tanggal
    if (meetingDate !== todayKey) {
      if (meetingDate > todayKey) return "akan-datang";
      if (meetingDate < todayKey) return "selesai";
    }

    // Untuk rapat hari ini, cek berdasarkan waktu
    const nowTime = now.toTimeString().slice(0, 5); // Format HH:mm

    if (nowTime >= meeting.waktu_mulai && nowTime <= meeting.waktu_selesai) {
      return "berlangsung";
    } else if (nowTime < meeting.waktu_mulai) {
      return "akan-datang";
    } else if (nowTime > meeting.waktu_selesai) {
      return "selesai";
    }

    return "akan-datang";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "berlangsung":
        return "bg-green-100 text-green-800 border border-green-200";
      case "akan-datang":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "selesai":
        return "bg-gray-100 text-gray-600 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "berlangsung":
        return "Berlangsung";
      case "akan-datang":
        return "Akan Datang";
      case "selesai":
        return "Selesai";
      default:
        return "-";
    }
  };

  if (!isOpen) return null;

  const todayKey = now.toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-60 animate-fade-in">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm font-medium">{notification}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden border border-gray-200">
        {/* Header Minimalis */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {showDetail ? "Detail Rapat" : "Rapat Hari Ini"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {showDetail && selectedMeeting ? selectedMeeting.nama_rapat : `${todayMeetings.length} jadwal rapat`}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {showDetail && (
                <>
                  <button
                    onClick={handleGoToDetailPage}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Halaman Detail
                  </button>
                  <button
                    onClick={handleBackToList}
                    className="text-gray-600 hover:text-gray-800 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Kembali ke daftar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-0 max-h-[65vh] overflow-y-auto">
          {showDetail ? (
            // Tampilan Detail Rapat Minimalis
            selectedMeeting && (
              <div className="p-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-3">
                        {selectedMeeting.ruangan?.nama_ruangan || "Ruangan Tidak Tersedia"}
                      </span>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedMeeting.nama_rapat}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Waktu Sekarang</div>
                      <div className="text-lg font-mono font-medium text-gray-900">
                        {now.toLocaleTimeString("id-ID")}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">Mulai</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatTimeDisplay(selectedMeeting.waktu_mulai)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">Selesai</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatTimeDisplay(selectedMeeting.waktu_selesai)}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                      <div className="text-sm text-gray-500 mb-1">Status</div>
                      <div className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(getMeetingStatus(selectedMeeting))}`}>
                        {getStatusText(getMeetingStatus(selectedMeeting))}
                      </div>
                    </div>
                  </div>

                  {/* Rapat Berikutnya */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Rapat Berikutnya</h4>
                    <div className="space-y-2">
                      {todayMeetings
                        .filter(r => {
                          const meetingDate = getDateKey(r.tanggal);
                          const nowTime = now.toTimeString().slice(0, 5);
                          return meetingDate === todayKey &&
                                 r.waktu_mulai > nowTime &&
                                 r.id !== selectedMeeting.id &&
                                 r.jenis === 'offline';
                        })
                        .sort((a, b) => a.waktu_mulai.localeCompare(b.waktu_mulai))
                        .slice(0, 2)
                        .map((r, i) => (
                          <div key={r.id || i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{r.nama_rapat}</div>
                              <div className="text-xs text-gray-500">
                                {formatTimeDisplay(r.waktu_mulai)} - {formatTimeDisplay(r.waktu_selesai)}
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {r.ruangan?.nama_ruangan}
                            </span>
                          </div>
                        ))}
                      {todayMeetings.filter(r => {
                        const meetingDate = getDateKey(r.tanggal);
                        const nowTime = now.toTimeString().slice(0, 5);
                        return meetingDate === todayKey &&
                               r.waktu_mulai > nowTime &&
                               r.id !== selectedMeeting.id &&
                               r.jenis === 'offline';
                      }).length === 0 && (
                        <div className="text-center py-4 text-sm text-gray-500 bg-white rounded-lg border border-gray-200">
                          Tidak ada rapat selanjutnya
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            // Tampilan Daftar Rapat Minimalis
            <div className="p-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Gagal memuat data</h3>
                  <p className="text-xs text-gray-500">Silakan coba lagi</p>
                </div>
              ) : todayMeetings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Tidak ada rapat</h3>
                  <p className="text-xs text-gray-500">Tidak ada jadwal rapat hari ini</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayMeetings.map((meeting) => {
                    const status = getMeetingStatus(meeting);
                    return (
                      <div
                        key={meeting.id}
                        className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                              {meeting.nama_rapat}
                            </h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                              {getStatusText(status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(meeting.tanggal)}
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatTimeDisplay(meeting.waktu_mulai)} - {formatTimeDisplay(meeting.waktu_selesai)}
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {meeting.jenis === 'online' ? 'Online' : meeting.ruangan?.nama_ruangan || 'Offline'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {meeting.jenis === "offline" ? (
                            status !== "selesai" ? (
                              <button
                                onClick={() => handleNavigateToDetail(meeting.id)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
                              >
                                Lihat
                              </button>
                            ) : null
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              Online
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Minimalis */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              {showDetail
                ? "Klik 'Halaman Detail' untuk informasi lengkap"
                : `Total: ${todayMeetings.length} rapat`
              }
            </div>
            <div className="flex space-x-2">
              {showDetail ? (
                <>
                  <button
                    onClick={handleBackToList}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    Kembali
                  </button>
                  <button
                    onClick={handleGoToDetailPage}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    Halaman Detail
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
