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
  const [bgImage, setBgImage] = useState(null);
  const [isBgLoaded, setIsBgLoaded] = useState(false);

  const bgList = [
    "/assets/image.png",
    "/assets/biru oren.jpg",
    "/assets/oren.jpg",
    "/assets/putih dan hitam.jpg",
  ];

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

    bootstrap();
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [id]);

  const bootstrap = async () => {
    try {
      const listRes = await axios.get("/rapat-today-all");
      const listData = Array.isArray(listRes.data?.data)
        ? listRes.data.data
        : [];
      setRapatHariIni(listData);

      let requested = null;
      try {
        const res = await axios.get(`/rapat/${id}`);
        requested = res.data?.data || res.data;
      } catch (e) {
        if (e?.response?.status === 410) {
          alert("Rapat sudah selesai");
          navigate("/dashboard", { replace: true });
          return;
        }
        throw e;
      }

      const { aktif, berikutnya } = getAktifDanBerikutnya(listData, new Date());

      if (aktif && aktif.id?.toString() !== id) {
        navigate(`/rapat/detail/${aktif.id}`, { replace: true });
        return;
      }

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

  const isFinishedToday = (rapatItem, nowDate) => {
    if (!rapatItem) return false;
    const todayKey = nowDate.toISOString().slice(0, 10);
    const meetingDate = String(rapatItem.tanggal).slice(0, 10);
    const nowHHmm = nowDate.toTimeString().slice(0, 5);
    return (
      meetingDate < todayKey ||
      (meetingDate === todayKey && nowHHmm > rapatItem.waktu_selesai)
    );
  };

  const getAktifDanBerikutnya = (list, nowDate) => {
    const todayKey = nowDate.toISOString().slice(0, 10);
    const nowHHmm = nowDate.toTimeString().slice(0, 5);
    const todayList = (Array.isArray(list) ? list : [])
      .filter((r) => String(r.tanggal).slice(0, 10) === todayKey)
      .sort((a, b) => (a.waktu_mulai > b.waktu_mulai ? 1 : -1));

    let aktif = null;
    for (const r of todayList) {
      if (r.waktu_mulai <= nowHHmm && nowHHmm <= r.waktu_selesai) {
        aktif = r;
        break;
      }
    }

    const berikutnya = todayList.find((r) => r.waktu_mulai > nowHHmm) || null;
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
        className={`relative h-screen flex items-center justify-center text-white text-2xl font-semibold transition-opacity duration-700 ${
          isBgLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: bgImage ? `url(${bgImage})` : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans relative">
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
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">
              {rapat.ruangan?.nama_ruangan || "RUANG RAPAT UTAMA"}
            </h2>
            <div className="text-[1.35rem] font-light tracking-wider text-white/90 font-mono drop-shadow-sm">
              {formatClockWithSeconds(now)}
            </div>
          </div>
        </div>

        {/* BAGIAN KIRI: INFORMASI RAPAT */}
        <div className="relative z-10 mt-40">
          {(() => {
            const todayKey = now.toISOString().slice(0, 10);
            const start = new Date(`${todayKey}T${rapat.waktu_mulai}:00`);
            const end = new Date(`${todayKey}T${rapat.waktu_selesai}:00`);

            if (now >= start && now <= end) {
              return (
                <>
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
                </>
              );
            } else {
              return (
                <>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Tidak Ada Rapat Saat Ini
                  </h3>
                  {rapatBerikutnya ? (
                    <p className="text-xl text-white">
                      Silahkan Menunggu Rapat Berikutnya
                    </p>
                  ) : (
                    <p className="text-xl text-white">
                      Tidak ada jadwal rapat berikutnya hari ini.
                    </p>
                  )}
                </>
              );
            }
          })()}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div
        className="w-[320px] flex flex-col items-center py-16 relative h-screen"
        style={{ backgroundColor: "#004C8C" }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm shadow-md transition-all duration-300 hover:scale-110"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mt-10 w-full px-6 flex-1 overflow-hidden">
          <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-lg p-4 mx-auto">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_pupuk_kaltim.svg/400px-Logo_pupuk_kaltim.svg.png?20190120151511"
              alt="Pupuk Kaltim"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="mt-12 text-center w-full flex-1 overflow-hidden flex flex-col">
            <h2 className="text-lg font-bold text-white mb-4">
              Rapat Berikutnya
            </h2>

            {/* Container List Rapat dengan Scroll */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {rapatHariIni && rapatHariIni.length > 0 ? (
                rapatHariIni
                  .filter(r => {
                    const nowHHmm = now.toTimeString().slice(0, 5);
                    return r.waktu_mulai > nowHHmm; // hanya rapat yang belum mulai
                  })
                  .map((r, i) => (
                    <div
                      key={r.id || i}
                      className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all mb-3 last:mb-0"
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
    </div>
  );
}
