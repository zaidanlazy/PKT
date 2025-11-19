import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Komponen Modal untuk menampilkan rapat hari ini dengan detail
export default function TodayMeetingsModal({ isOpen, onClose }) {
  const [todayMeetings, setTodayMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [now, setNow] = useState(new Date());
  const [bgImage, setBgImage] = useState(null);
  const [isBgLoaded, setIsBgLoaded] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  const bgList = [
    "/assets/image.png",
    "/assets/biru.jpg",
    "/assets/oren.jpg",
    "/assets/putih.jpg",
    "/assets/ungu.jpg",
    "/assets/kuning.jpg",
    "/assets/biruu.jpg",
  ];

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

  // Load background image
  useEffect(() => {
    if (isOpen && showDetail && selectedMeeting) {
      const lastIndex = parseInt(localStorage.getItem("lastBgIndex") || "0", 10);
      const nextIndex = (lastIndex + 1) % bgList.length;
      const nextBg = bgList[nextIndex];
      localStorage.setItem("lastBgIndex", nextIndex.toString());

      const img = new Image();
      img.src = nextBg;
      img.onload = () => {
        setBgImage(nextBg);
        setIsBgLoaded(true);
      };
    }
  }, [isOpen, showDetail, selectedMeeting]);

  // Fetch data rapat hari ini (tanpa autentikasi)
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);

      // Gunakan endpoint publik tanpa Authorization header
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

  const handleMeetingClick = (meeting) => {
    // Cek jika rapat online
    if (meeting.jenis === 'online') {
      setNotification("Ini rapat online - tidak dapat melihat detail");
      return;
    }

    setSelectedMeeting(meeting);
    setShowDetail(true);
    setIsBgLoaded(false); // Reset background load state
  };

  // Fungsi untuk navigasi ke halaman detail
  const handleNavigateToDetail = (rapatId) => {
    navigate(`/rapat/detail/${rapatId}`);
    onClose();
  };

  const handleBackToList = () => {
    setShowDetail(false);
    setSelectedMeeting(null);
    setBgImage(null);
  };

  const handleGoToDetailPage = () => {
    if (selectedMeeting) {
      navigate(`/rapat/detail/${selectedMeeting.id}`);
      onClose();
    }
  };

  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  const formatClockWithSeconds = (dateObj) => {
    const datePart = dateObj.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
    });
    const timePart = dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    return `${datePart} ${timePart}`;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const getMeetingStatus = (meeting) => {
    const todayKey = now.toISOString().slice(0, 10);
    const start = new Date(`${todayKey}T${meeting.waktu_mulai}:00`);
    const end = new Date(`${todayKey}T${meeting.waktu_selesai}:00`);

    if (now >= start && now <= end) {
      return "sedang-berlangsung";
    } else if (now < start) {
      return "akan-datang";
    } else {
      return "selesai";
    }
  };

  const getDateKey = (value) => {
    if (typeof value === "string") {
      const key = value.slice(0, 10);
      if (/^\d{4}-\d{2}-\d{2}$/.test(key)) return key;
    }
    const dt = new Date(value);
    const pad2 = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
  };

  if (!isOpen) return null;

  const todayKey = now.toISOString().slice(0, 10);
  const nowHHmm = now.toTimeString().slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-60 animate-fade-in">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="font-medium">{notification}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {showDetail ? "Detail Rapat" : "Rapat Hari Ini"}
              </h2>
              <p className="text-blue-100">
                {showDetail && selectedMeeting ? selectedMeeting.nama_rapat : "Dashboard Rapat"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {showDetail && (
                <>
                  <button
                    onClick={handleGoToDetailPage}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium"
                  >
                    Lihat Halaman Detail
                  </button>
                  <button
                    onClick={handleBackToList}
                    className="text-white hover:text-blue-100 transition-colors duration-200 p-2"
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
                className="text-white hover:text-blue-100 transition-colors duration-200 p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-0 max-h-[70vh] overflow-y-auto">
          {showDetail ? (
            // Tampilan Detail Rapat (sama seperti di DetailRapat.jsx)
            selectedMeeting && (
              <div className="h-full w-full flex overflow-hidden font-sans relative">
                {/* LEFT SECTION - Sama seperti di DetailRapat */}
                <div
                  className={`flex-1 text-white px-16 py-10 relative flex flex-col transition-opacity duration-700 ${
                    isBgLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    backgroundImage: bgImage ? `url(${bgImage})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    minHeight: "500px",
                  }}
                >
                  <div className="absolute inset-0 bg-black/30"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <h2 className="text-3xl font-bold mb-2 tracking-tight">
                        {selectedMeeting.ruangan?.nama_ruangan || "RUANG RAPAT UTAMA"}
                      </h2>
                      <div className="text-[1.35rem] font-light tracking-wider text-white/90 font-mono drop-shadow-sm">
                        {formatClockWithSeconds(now)}
                      </div>
                    </div>
                  </div>

                  {/* BAGIAN KIRI: INFORMASI RAPAT */}
                  <div className="relative z-10 mt-20">
                    {(() => {
                      const todayKey = now.toISOString().slice(0, 10);
                      const start = new Date(`${todayKey}T${selectedMeeting.waktu_mulai}:00`);
                      const end = new Date(`${todayKey}T${selectedMeeting.waktu_selesai}:00`);

                      if (now >= start && now <= end) {
                        return (
                          <>
                            <h3 className="text-base font-semibold tracking-wide opacity-90 mb-1">
                              RAPAT KEGIATAN INI
                            </h3>
                            <p className="text-5xl font-bold leading-tight text-white drop-shadow-sm">
                              {formatTimeDisplay(selectedMeeting.waktu_mulai)} -{" "}
                              {formatTimeDisplay(selectedMeeting.waktu_selesai)}
                            </p>
                            <p className="text-3xl mt-4 font-extrabold tracking-wide text-white">
                              {selectedMeeting.nama_rapat || "Rapat Koordinasi Mingguan"}
                            </p>
                          </>
                        );
                      } else if (now < start) {
                        return (
                          <>
                            <h3 className="text-base font-semibold tracking-wide opacity-90 mb-1">
                              RAPAT AKAN DATANG
                            </h3>
                            <p className="text-5xl font-bold leading-tight text-white drop-shadow-sm">
                              {formatTimeDisplay(selectedMeeting.waktu_mulai)} -{" "}
                              {formatTimeDisplay(selectedMeeting.waktu_selesai)}
                            </p>
                            <p className="text-3xl mt-4 font-extrabold tracking-wide text-white">
                              {selectedMeeting.nama_rapat || "Rapat Koordinasi Mingguan"}
                            </p>
                          </>
                        );
                      } else {
                        return (
                          <>
                            <h3 className="text-3xl font-bold text-white mb-4">
                              Rapat telah selesai
                            </h3>
                            <p className="text-xl text-white">
                              {selectedMeeting.nama_rapat} telah berakhir.
                            </p>
                          </>
                        );
                      }
                    })()}
                  </div>
                </div>

                {/* RIGHT SECTION - Daftar Rapat Berikutnya */}
                <div
                  className="w-[320px] flex flex-col items-center py-10 relative"
                  style={{ backgroundColor: "#004C8C", minHeight: "500px" }}
                >
                  <div className="flex flex-col items-center mt-6 w-full px-6 flex-1 overflow-hidden">
                    <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg p-3 mx-auto">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_pupuk_kaltim.svg/400px-Logo_pupuk_kaltim.svg.png?20190120151511"
                        alt="Pupuk Kaltim"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="mt-8 text-center w-full flex-1 overflow-y-auto px-2">
                      <h2 className="text-lg font-bold text-white mb-4">
                        Rapat Berikutnya
                      </h2>

                      {todayMeetings && todayMeetings.length > 0 ? (
                        todayMeetings
                          .filter(r => {
                            const todayKey = now.toISOString().slice(0, 10);
                            const meetingDate = String(r.tanggal).slice(0, 10);
                            const nowHHmm = now.toTimeString().slice(0, 5);

                            // Filter hanya rapat hari ini yang belum mulai, bukan rapat yang sedang dilihat, dan hanya rapat offline
                            return meetingDate === todayKey &&
                                   r.waktu_mulai > nowHHmm &&
                                   r.id !== selectedMeeting.id &&
                                   r.jenis === 'offline'; // Hanya tampilkan rapat offline
                          })
                          .sort((a, b) => a.waktu_mulai.localeCompare(b.waktu_mulai))
                          .slice(0, 3) // Batasi hanya 3 rapat berikutnya
                          .map((r, i) => (
                            <div
                              key={r.id || i}
                              className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all mb-3"
                            >
                              <p className="text-sm text-gray-100">
                                {formatTimeDisplay(r.waktu_mulai)} - {formatTimeDisplay(r.waktu_selesai)}
                              </p>
                              <p className="text-lg font-semibold text-white">{r.nama_rapat}</p>
                              {r.ruangan && (
                                <p className="text-xs text-gray-300 mt-1">
                                  {r.ruangan.nama_ruangan}
                                </p>
                              )}
                            </div>
                          ))
                      ) : (
                        <div className="p-3 bg-white/10 rounded-lg">
                          <p className="text-sm text-gray-300 italic">Tidak ada rapat selanjutnya</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            // Tampilan Daftar Rapat dengan Tombol Detail (BARU)
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Tidak dapat mengambil data</h3>
                  <p className="text-gray-500">Terjadi kesalahan saat mengambil data rapat.</p>
                </div>
              ) : todayMeetings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Tidak ada rapat hari ini</h3>
                  <p className="text-gray-500">Tidak ada jadwal rapat untuk hari ini.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                          Nama Rapat
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                          Tipe
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                          Tanggal
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">
                          Waktu
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayMeetings.map((meeting) => (
                        <tr
                          key={meeting.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {meeting.nama_rapat}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                meeting.jenis === "online"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {meeting.jenis === "online" ? "Online" : "Offline"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(meeting.tanggal)}
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
                              {meeting.waktu_mulai} - {meeting.waktu_selesai}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {meeting.jenis === "offline" ? (
                              getDateKey(meeting.tanggal) === todayKey && nowHHmm > meeting.waktu_selesai ? (
                                <span className="text-xs font-medium text-gray-400 italic">
                                  Rapat Selesai
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleNavigateToDetail(meeting.id)}
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
                                  Detail
                                </button>
                              )
                            ) : (
                              <span className="text-xs text-gray-400 italic">
                                Tidak tersedia
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
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {showDetail
                ? "Klik 'Lihat Halaman Detail' untuk informasi lengkap"
                : `${todayMeetings.length} rapat hari ini`
              }
            </div>
            <div className="flex space-x-2">
              {showDetail ? (
                <>
                  <button
                    onClick={handleBackToList}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors duration-200 text-sm"
                  >
                    Kembali ke Daftar
                  </button>
                  <button
                    onClick={handleGoToDetailPage}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 text-sm"
                  >
                    Lihat Halaman Detail
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors duration-200"
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
