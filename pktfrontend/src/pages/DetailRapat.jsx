import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../api/axiosClient";
import { ArrowLeft } from "lucide-react";

export default function DetailRapat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rapat, setRapat] = useState(null);
  const [rapatBerikutnya, setRapatBerikutnya] = useState(null);
  const [rapatHariIni, setRapatHariIni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    bootstrap();
    const t = setInterval(() => {
      setNow(new Date());
      tickUpdate();
    }, 1000);
    return () => clearInterval(t);
  }, [id]);

  const bootstrap = async () => {
    try {
      // Ambil daftar rapat hari ini
      const listRes = await axios.get("/rapat-today-all");
      const listData = Array.isArray(listRes.data?.data) ? listRes.data.data : [];
      setRapatHariIni(listData);

      // Ambil rapat yang diminta
      let requested = null;
      try {
        const res = await axios.get(`/rapat/${id}`);
        requested = res.data?.data || res.data;
      } catch (e) {
        // Jika backend mengembalikan 410 (rapat selesai), tampilkan pesan dan kembali
        if (e?.response?.status === 410) {
          alert("Rapat sudah selesai");
          navigate("/dashboard", { replace: true });
          return;
        }
        throw e;
      }

      // Hitung rapat aktif & berikutnya berbasis daftar hari ini
      const { aktif, berikutnya } = getAktifDanBerikutnya(listData, new Date());

      // Jika ada rapat aktif dan berbeda dengan ID saat ini, redirect ke aktif
      if (aktif && aktif.id?.toString() !== id) {
        navigate(`/rapat/detail/${aktif.id}`, { replace: true });
        return;
      }

      // Jika rapat yang diminta sudah lewat, pindah ke berikutnya bila ada
      if (isFinishedToday(requested, new Date())) {
        if (berikutnya) {
          navigate(`/rapat/detail/${berikutnya.id}`, { replace: true });
          return;
        }
        navigate("/dashboard", { replace: true });
        return;
      }

      setRapat(requested);
      setRapatBerikutnya(berikutnya || null);
    } catch (err) {
      console.error(err);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Dipanggil setiap detik untuk pindah otomatis ketika rapat selesai
  const tickUpdate = () => {
    if (!rapat) return;
    const nowDate = new Date();

    // Setiap 30 detik, refresh daftar rapat hari ini agar rapat baru langsung tercermin
    if (nowDate.getSeconds() % 30 === 0) {
      refreshTodayList();
    }

    // Jika rapat selesai, tentukan tujuan berikutnya
    if (isFinishedToday(rapat, nowDate)) {
      const { aktif, berikutnya } = getAktifDanBerikutnya(rapatHariIni, nowDate);
      if (aktif) {
        navigate(`/rapat/detail/${aktif.id}`, { replace: true });
      } else if (berikutnya) {
        navigate(`/rapat/detail/${berikutnya.id}`, { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      // Jika masih aktif, perbarui rapat berikutnya dari daftar terbaru
      const { berikutnya } = getAktifDanBerikutnya(rapatHariIni, nowDate, rapat);
      setRapatBerikutnya(berikutnya || null);
    }
  };

  const refreshTodayList = async () => {
    try {
      const listRes = await axios.get("/rapat");
      const listData = Array.isArray(listRes.data?.data) ? listRes.data.data : [];
      setRapatHariIni(listData);
    } catch (e) {
      // ignore refresh error
    }
  };

  // Util: cek apakah rapat sudah selesai hari ini
  const isFinishedToday = (rapatItem, nowDate) => {
    if (!rapatItem) return false;
    const todayKey = nowDate.toISOString().slice(0, 10);
    const meetingDate = String(rapatItem.tanggal).slice(0, 10);
    const nowHHmm = nowDate.toTimeString().slice(0, 5);
    return meetingDate < todayKey || (meetingDate === todayKey && nowHHmm > rapatItem.waktu_selesai);
  };

  // Util: bandingkan HH:mm
  const isTimeBetween = (hhmm, start, end) => start <= hhmm && hhmm <= end;

  // Hitung rapat aktif dan berikutnya dari daftar hari ini
  const getAktifDanBerikutnya = (list, nowDate, current = null) => {
    const todayKey = nowDate.toISOString().slice(0, 10);
    const nowHHmm = nowDate.toTimeString().slice(0, 5);

    // Ambil hanya rapat hari ini; jika fokus ruangan, biasanya offline
    const todayList = (Array.isArray(list) ? list : [])
      .filter(r => String(r.tanggal).slice(0, 10) === todayKey)
      .sort((a, b) => (a.waktu_mulai > b.waktu_mulai ? 1 : -1));

    let aktif = null;
    for (const r of todayList) {
      if (isTimeBetween(nowHHmm, r.waktu_mulai, r.waktu_selesai)) {
        aktif = r;
        break;
      }
    }

    let berikutnya = null;
    if (aktif) {
      berikutnya = todayList.find(r => r.waktu_mulai > aktif.waktu_selesai) || null;
    } else {
      // Jika tidak ada aktif, pilih rapat terdekat setelah sekarang
      berikutnya = todayList.find(r => r.waktu_mulai > nowHHmm) || null;
    }

    // Jika current dipaksa tampil, hitung next berdasarkan current
    if (!aktif && current && String(current.tanggal).slice(0, 10) === todayKey) {
      if (isTimeBetween(nowHHmm, current.waktu_mulai, current.waktu_selesai)) {
        aktif = current;
        berikutnya = todayList.find(r => r.waktu_mulai > current.waktu_selesai) || null;
      } else if (current.waktu_mulai >= nowHHmm && current.waktu_mulai <= (berikutnya?.waktu_mulai || "99:99")) {
        berikutnya = current;
      }
    }

    return { aktif, berikutnya };
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

  if (loading || !rapat) {
    return (
      <div
        className="relative h-screen flex items-center justify-center text-white text-2xl font-semibold"
        style={{
          backgroundImage: "url('/assets/image.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay hitam transparan */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Teks Loading */}
        <div className="relative z-10 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans relative">
      {/* LEFT SECTION */}
      <div
        className="flex-1 text-white px-16 py-10 relative flex flex-col"
        style={{
          backgroundImage: "url('/assets/image.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Nama ruangan dan waktu */}
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 tracking-tight">
                {rapat.ruangan?.nama_ruangan || "RUANG RAPAT UTAMA"}
              </h2>
            </div>
            <div className="text-[1.35rem] font-light tracking-wider text-white/90 font-mono drop-shadow-sm">
              {formatClockWithSeconds(now)}
            </div>
          </div>
        </div>

        {/* Info rapat — tetap di kiri, hanya turun sedikit */}
        <div className="relative z-10 mt-40">
          <h3 className="text-base font-semibold tracking-wide opacity-90 mb-1">
            RAPAT KEGIATAN INI
          </h3>
          <p className="text-6xl font-bold leading-tight text-white drop-shadow-sm">
            {formatTimeDisplay(rapat.waktu_mulai)} -{" "}
            {formatTimeDisplay(rapat.waktu_selesai)}
          </p>
          <p className="text-4xl mt-4 font-extrabold tracking-wide text-white">
            {rapat.nama_rapat || "Rapat Koordinasi Mingguan"}
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className="w-[320px] flex flex-col items-center py-16 relative h-screen"
        style={{
          backgroundColor: "#004C8C",
        }}
      >
        {/* Tombol kembali */}
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm shadow-md transition-all duration-300 hover:scale-110"
          title="Kembali ke Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Logo & daftar rapat berikutnya */}
        <div className="flex flex-col items-center mt-10 w-full px-6 flex-1 overflow-hidden">
          <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-lg p-4 mx-auto">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_pupuk_kaltim.svg/400px-Logo_pupuk_kaltim.svg.png?20190120151511"
              alt="Pupuk Kaltim"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Scrollable Section */}
          <div className="mt-12 text-center w-full flex-1 overflow-y-auto px-2 custom-scrollbar">
            <h2 className="text-lg font-bold text-white mb-4">
              Rapat Berikutnya
            </h2>

            <div className="space-y-4 pb-10">
              {rapatBerikutnya ? (
                <div className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                  <p className="text-sm text-gray-100">
                    {formatTimeDisplay(rapatBerikutnya.waktu_mulai)} - {formatTimeDisplay(rapatBerikutnya.waktu_selesai)}
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {rapatBerikutnya.nama_rapat}
                  </p>
                  {rapatBerikutnya.ruangan && (
                    <p className="text-xs text-gray-300 mt-1">
                      {rapatBerikutnya.ruangan.nama_ruangan}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="text-sm text-gray-300 italic">
                    Tidak ada rapat selanjutnya
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
