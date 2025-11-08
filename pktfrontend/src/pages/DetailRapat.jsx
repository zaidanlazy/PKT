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

  const formatShortDate = (dateObj) => {
    return dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  const formatClockWithSeconds = (dateObj) => {
    // Contoh:  08:39:05 PM
    const datePart = dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
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
          backgroundImage: "url('https://lh7-rt.googleusercontent.com/docsz/AD_4nXd8TqRq2Mubk8l59LPBC_SmEwhLXxjJ1JrcsLqY_gYxtdEJrjSPy1bM7CklTGmtifI72Tl0bqew9EN82k9eIdWuPlV3ZLhE1mQ0ZIZfw76Pw1hEcoYRPvOxG-lrA3Xex1xljwb76U1FFk2od0R-roo?key=VkQzj34Nr2RqtWAmOpEsY_rf')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        Memuat detail rapat...
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans relative">
      {/* LEFT SECTION dengan background image */}
      <div
        className="flex-1 text-white p-12 relative"
        style={{
          backgroundImage: "url('https://lh7-rt.googleusercontent.com/docsz/AD_4nXd8TqRq2Mubk8l59LPBC_SmEwhLXxjJ1JrcsLqY_gYxtdEJrjSPy1bM7CklTGmtifI72Tl0bqew9EN82k9eIdWuPlV3ZLhE1mQ0ZIZfw76Pw1hEcoYRPvOxG-lrA3Xex1xljwb76U1FFk2od0R-roo?key=VkQzj34Nr2RqtWAmOpEsY_rf')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        {/* Overlay untuk meningkatkan keterbacaan teks */}
        <div className="absolute inset-0 bg-black/30"></div>

        {/* Konten */}
        <div className="relative z-10">
          {/* Room name (kiri atas) */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">
                {rapat.ruangan?.nama_ruangan || "Room 2"}
              </h2>
            </div>

            {/* clock kecil yang update (posisi di pojok kanan atas kiri dari panel merah) */}
            <div className="text-sm text-gray-300" aria-hidden>
              {formatClockWithSeconds(now)}
            </div>
          </div>

    

          {/* Current Event */}
          <div className="mt-20">
            <h3 className="text-gray-300 text-sm font-semibold tracking-wider">Current Event</h3>
            <div className="mt-6">
              <p className="text-5xl font-extrabold leading-tight">
                {formatTimeDisplay(rapat.waktu_mulai)} - {formatTimeDisplay(rapat.waktu_selesai)}
              </p>
              <p className="text-2xl mt-4">{rapat.nama_rapat || "Discussion"}</p>
            </div>
          </div>

          {/* Next Events */}
          <div className="mt-16 max-w-lg">
            <h3 className="text-gray-300 text-sm font-semibold tracking-wider">Next Events</h3>
            <div className="mt-4 space-y-8">
              {/* Jika punya data next events dari API, replace bagian ini dengan map */}
              <div>
                <p className="text-gray-300 text-sm">22 May 3:30 PM - 4:30 PM</p>
                <p className="text-lg font-medium text-white/95">Status Meeting Scrum Team</p>
              </div>

              <div>
                <p className="text-gray-300 text-sm">22 May 4:30 PM - 5:30 PM</p>
                <p className="text-lg font-medium text-white/95">Progress Update</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (lebar tetap) */}
      <div className="w-[260px] bg-[#d6302b] flex flex-col items-center justify-center relative">
        {/* ikon-ikon diletakkan secara vertikal, berada di tengah panel kanan */}
        <div className="flex flex-col items-center gap-10">
          {/* kotak ikon pertama */}
          <div className="w-20 h-20 bg-white/8 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
            {/* ikon kamera/meeting */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>

          {/* kotak ikon kedua */}
          <div className="w-20 h-20 bg-white/8 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
            {/* ikon kalender */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
