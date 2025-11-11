import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../api/axiosClient";
import { ArrowLeft } from "lucide-react";

export default function DetailRapat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rapat, setRapat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchRapatDetail();
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [id]);

  const fetchRapatDetail = async () => {
    try {
      const res = await axios.get(`/rapat/${id}`);
      setRapat(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
      navigate("/dashboard");
    } finally {
      setLoading(false);
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
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                >
                  <p className="text-sm text-gray-100">
                    22 May 3:{30 + i} PM - 4:{30 + i} PM
                  </p>
                  <p className="text-lg font-semibold text-white">
                    Status Meeting {i + 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
