import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../api/axiosClient";

export default function DetailRapat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rapat, setRapat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    fetchRapatDetail();

    // update clock setiap detik
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
    const datePart = dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
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
        className="h-screen flex items-center justify-center text-white text-lg"
        style={{
          backgroundImage:
            "url('https://indooffice.co.id/wp-content/uploads/2023/05/Panduan-Lengkap-Ruang-Rapat-Virtual-Mengoptimalkan-Potensi-Bisnis-Anda.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        Loading
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans relative">
      {/* LEFT SECTION */}
      <div
        className="flex-1 text-white p-12 relative"
        style={{
          backgroundImage:
            "url('https://indooffice.co.id/wp-content/uploads/2023/05/Panduan-Lengkap-Ruang-Rapat-Virtual-Mengoptimalkan-Potensi-Bisnis-Anda.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10">
          {/* Header kiri atas */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-extrabold mb-1">
                {rapat.ruangan?.nama_ruangan || "Room 2"}
              </h2>
            </div>

            {/* Jam berjalan real-time */}
            <div className="text-sm font-extrabold leading-tight text-white-100" aria-hidden>
              {formatClockWithSeconds(now)}
            </div>
          </div>

          {/* Current Event */}
          <div className="mt-20">
            <h3 className="text-white-300 text-sm font-extrabold leading-tight">
              RAPAT KEGIATAN INI
            </h3>
            <div className="mt-">
              <p className="text-5xl font-extrabold leading-tight">
                {formatTimeDisplay(rapat.waktu_mulai)} -{" "}
                {formatTimeDisplay(rapat.waktu_selesai)}
              </p>
              <p className="text-2xl mt-">
                {rapat.nama_rapat || "Discussion"}
              </p>
            </div>
          </div>

          {/* Next Events */}
          <div className="mt-10 max-w-lg">
            <h3 className="text-white-300 text-sm font-extrabold leading-tight">
              RAPAT KEGIATAN SELANJUTNYA
            </h3>
            <div className="mt-4 space-y-8">
              <div>
                <p className="text-white-300 text-sm">
                  22 May 3:30 PM - 4:30 PM
                </p>
                <p className="text-lg font-bold text-white/95">
                  Status Meeting Scrum Team
                </p>
              </div>

              <div>
                <p className="text-white-300 text-sm">
                  22 May 4:30 PM - 5:30 PM
                </p>
                <p className="text-lg font-bold text-white/95">
                  Progress Update
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[300px] bg-[#d6302b] flex flex-col items-center justify-between py-16 relative">
        {/* Ikon utama di bagian atas */}
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-[#5cc3ff] rounded-2xl flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-20 h-20 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M9 11a4 4 0 110-8 4 4 0 010 8zm6 0a4 4 0 110-8 4 4 0 010 8z"
              />
            </svg>
          </div>
        </div>

        {/* Dua ikon kalender di bawah */}
        <div className="flex flex-row items-center justify-center gap-10">
          {/* Ikon kiri (kalender dengan X) */}
          <div className="flex flex-col items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-20 h-20 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m1 8l-2 2m0-2l2 2M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Ikon kanan (kalender biasa) */}
          <div className="flex flex-col items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-20 h-20 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white "
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
