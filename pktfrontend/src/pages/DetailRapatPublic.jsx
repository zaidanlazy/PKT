import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DetailRapatPublic() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rapat, setRapat] = useState(null);
  const [now, setNow] = useState(new Date());
  const [bgImage, setBgImage] = useState(null);
  const [isBgLoaded, setIsBgLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [todayMeetings, setTodayMeetings] = useState([]);

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

  // Load background image dengan rotasi
  useEffect(() => {
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
  }, []);

  // Fetch data rapat tanpa autentikasi
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setError(null);

      fetch(`http://localhost:8000/api/rapat/${id}/public`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      })
        .then((res) => {
          if (!res.ok) {
            if (res.status === 404) {
              throw new Error('Rapat tidak ditemukan');
            }
            throw new Error('Gagal mengambil data rapat');
          }
          return res.json();
        })
        .then((json) => {
          console.log('Data rapat:', json);
          if (json.status === 'success' && json.data) {
            setRapat(json.data);
          } else {
            throw new Error('Format data tidak valid');
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching rapat:', err);
          setError(err.message);
          setIsLoading(false);
        });
    }
  }, [id]);

  // Fetch semua rapat hari ini untuk sidebar
  useEffect(() => {
    fetch("http://localhost:8000/api/rapat/hari-ini/public", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Gagal mengambil data');
        }
        return res.json();
      })
      .then((json) => {
        console.log('Data rapat hari ini:', json);
        if (json.status === 'success' && json.data) {
          setTodayMeetings(Array.isArray(json.data) ? json.data : []);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat rapat hari ini:", err);
        setTodayMeetings([]);
      });
  }, []);

  // Format waktu untuk display (12-hour format)
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  };

  // Format jam dengan detik
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

  // Cek status rapat
  const getRapatStatus = () => {
    if (!rapat) return "unknown";

    const todayKey = now.toISOString().slice(0, 10);
    const rapatDate = String(rapat.tanggal).slice(0, 10);
    const start = new Date(`${rapatDate}T${rapat.waktu_mulai}:00`);
    const end = new Date(`${rapatDate}T${rapat.waktu_selesai}:00`);

    if (now >= start && now <= end && todayKey === rapatDate) {
      return "berlangsung";
    } else if (now < start) {
      return "akan-datang";
    } else {
      return "selesai";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">Memuat data rapat...</p>
          <p className="text-gray-500 text-sm mt-2">Harap tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !rapat) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Data Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-8 text-lg">
            {error || "Rapat yang Anda cari tidak tersedia atau sudah tidak aktif."}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
            >
              Kembali
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
            >
              Ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cek apakah rapat adalah online
  if (rapat.jenis === 'online') {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Rapat Online</h2>
          <p className="text-gray-600 mb-2 text-lg font-medium">{rapat.nama_rapat}</p>
          <p className="text-gray-500 mb-8">
            Detail tampilan hanya tersedia untuk rapat offline.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
            >
              Kembali
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md"
            >
              Ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  const rapatStatus = getRapatStatus();

  return (
    <div className="h-screen w-screen flex overflow-hidden font-sans">
      {/* LEFT SECTION */}
      <div
        className={`flex-1 text-white px-16 py-10 relative flex flex-col transition-opacity duration-700 ${
          isBgLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: bgImage ? `url(${bgImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Header - hanya nama ruangan */}
        <div className="relative z-10 mb-8">
          <h2 className="text-3xl font-bold mb-2 tracking-tight">
            {rapat.ruangan?.nama_ruangan || "RUANG RAPAT UTAMA"}
          </h2>
        </div>

        {/* BAGIAN KIRI: INFORMASI RAPAT - Hanya tampil saat BERLANGSUNG */}
        <div className="relative z-10 mt-20">
          {rapatStatus === "berlangsung" ? (
            <>
              <h3 className="text-base font-semibold tracking-wide opacity-90 mb-1">
                RAPAT SEDANG BERLANGSUNG
              </h3>
              <p className="text-6xl font-bold leading-tight text-white drop-shadow-sm">
                {formatTimeDisplay(rapat.waktu_mulai)} - {formatTimeDisplay(rapat.waktu_selesai)}
              </p>
              <p className="text-4xl mt-4 font-extrabold tracking-wide text-white">
                {rapat.nama_rapat || "Rapat Koordinasi"}
              </p>
              {rapat.deskripsi && (
                <p className="text-lg mt-4 text-white/90 leading-relaxed">
                  {rapat.deskripsi}
                </p>
              )}
            </>
          ) : rapatStatus === "selesai" ? (
            <>
              <h3 className="text-3xl font-bold text-white mb-4">
                Rapat telah selesai
              </h3>
              <p className="text-xl text-white">
                {rapat.nama_rapat} telah berakhir.
              </p>
              <p className="text-lg mt-4 text-white/80">
                Waktu: {formatTimeDisplay(rapat.waktu_mulai)} - {formatTimeDisplay(rapat.waktu_selesai)}
              </p>
            </>
          ) : (
            // Kosong saat "akan-datang" - info ada di sidebar kanan
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold text-white/80 mb-2">
                Menunggu Rapat Dimulai
              </h3>
              <p className="text-lg text-white/60">
                Silakan lihat jadwal di sidebar kanan
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION - Sidebar */}
      <div
        className="w-[380px] flex flex-col py-10 relative overflow-y-auto"
        style={{ backgroundColor: "#004C8C" }}
      >
        <div className="flex flex-col items-center w-full px-6">
          {/* Tombol Kembali */}
          <button
            onClick={() => navigate(-1)}
            className="self-start bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 mb-6 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </button>

          {/* Logo */}
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg p-3 mx-auto mb-6">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_pupuk_kaltim.svg/400px-Logo_pupuk_kaltim.svg.png?20190120151511"
              alt="Pupuk Kaltim"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Jam Real-time */}
          <div className="text-center mb-8 w-full">
            <div className="text-sm text-white/70 mb-1">Waktu Sekarang</div>
            <div className="text-xl font-mono font-semibold text-white">
              {formatClockWithSeconds(now)}
            </div>
          </div>

          {/* Info Rapat Utama - Tampil jika BELUM MULAI atau SELESAI */}
          {(rapatStatus === "akan-datang" || rapatStatus === "selesai") && (
            <div className="w-full mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    rapatStatus === "akan-datang"
                      ? "bg-yellow-400 text-yellow-900"
                      : "bg-gray-400 text-gray-900"
                  }`}>
                    {rapatStatus === "akan-datang" ? "RAPAT AKAN DATANG" : "RAPAT SELESAI"}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">
                  {rapat.nama_rapat}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-white/90">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">
                      {formatTimeDisplay(rapat.waktu_mulai)} - {formatTimeDisplay(rapat.waktu_selesai)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-white/90">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-sm">{rapat.ruangan?.nama_ruangan || "-"}</span>
                  </div>
                </div>

                {rapat.deskripsi && (
                  <p className="text-sm text-white/80 leading-relaxed border-t border-white/20 pt-3">
                    {rapat.deskripsi}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="w-full h-px bg-white/20 mb-6"></div>

          {/* Daftar Rapat Berikutnya */}
          <div className="w-full">
            <h2 className="text-lg font-bold text-white mb-4 text-center">
              Rapat Berikutnya
            </h2>

            {todayMeetings && todayMeetings.length > 0 ? (
              (() => {
                const upcomingMeetings = todayMeetings
                  .filter(r => {
                    const todayKey = now.toISOString().slice(0, 10);
                    const meetingDate = String(r.tanggal).slice(0, 10);
                    const nowHHmm = now.toTimeString().slice(0, 5);

                    return meetingDate === todayKey &&
                           r.waktu_mulai > nowHHmm &&
                           r.id !== parseInt(id) &&
                           r.jenis === 'offline';
                  })
                  .sort((a, b) => a.waktu_mulai.localeCompare(b.waktu_mulai))
                  .slice(0, 3);

                return upcomingMeetings.length > 0 ? (
                  upcomingMeetings.map((r, i) => (
                    <div
                      key={r.id || i}
                      onClick={() => {
                        window.location.href = `/rapat/detail/${r.id}`;
                      }}
                      className="p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all mb-3 cursor-pointer shadow-sm hover:shadow-md border border-white/10"
                    >
                      <p className="text-sm text-gray-200 mb-1">
                        {formatTimeDisplay(r.waktu_mulai)} - {formatTimeDisplay(r.waktu_selesai)}
                      </p>
                      <p className="text-base font-semibold text-white mb-1">{r.nama_rapat}</p>
                      {r.ruangan && (
                        <p className="text-xs text-gray-300 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {r.ruangan.nama_ruangan}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 text-center">
                    <svg className="w-12 h-12 text-white/40 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-white/60 italic">
                      Tidak ada kegiatan rapat
                    </p>
                  </div>
                );
              })()
            ) : (
              <div className="p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 text-center">
                <svg className="w-12 h-12 text-white/40 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-white/60 italic">
                  Tidak ada kegiatan rapat
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
