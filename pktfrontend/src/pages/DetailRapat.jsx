import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../api/axiosClient";

export default function DetailRapat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rapat, setRapat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [showNextMeetings, setShowNextMeetings] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

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
        Loading...
      </div>
    );
  }

  const generateCalendarDays = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const calendarDays = generateCalendarDays();

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
                {rapat.ruangan?.nama_ruangan || "Ruangan Besar"}
              </h2>
            </div>
            <div className="text-sm font-extrabold leading-tight">
              {formatClockWithSeconds(now)}
            </div>
          </div>

          {/* Current Meeting */}
          <div className="mt-20">
            <h3 className="text-sm font-extrabold leading-tight">
              RAPAT KEGIATAN INI
            </h3>
            <p className="text-5xl font-extrabold leading-tight">
              {formatTimeDisplay(rapat.waktu_mulai)} -{" "}
              {formatTimeDisplay(rapat.waktu_selesai)}
            </p>
            <p className="text-2xl mt-2">{rapat.nama_rapat || "itu aja"}</p>
          </div>

          {/* Next Meetings */}
          <div className="mt-10 max-w-lg">
            <h3 className="text-sm font-extrabold leading-tight">
              RAPAT KEGIATAN SELANJUTNYA
            </h3>
            <div className="mt-4 space-y-8">
              <div>
                <p className="text-sm">22 May 3:30 PM - 4:30 PM</p>
                <p className="text-lg font-bold text-white/95">
                  Status Meeting Scrum Team
                </p>
              </div>
              <div>
                <p className="text-sm">22 May 4:30 PM - 5:30 PM</p>
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
        {/* Logo Pupuk Kaltim */}
        <div className="flex flex-col items-center mt-6 animate-fadeIn">
          <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center shadow-lg p-3">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_pupuk_kaltim.svg/400px-Logo_pupuk_kaltim.svg.png?20190120151511"
              alt="Pupuk Kaltim"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                console.error("Logo Pupuk Kaltim tidak ditemukan di /public/images/");
              }}
            />
          </div>
        </div>

        {/* Dua ikon di bawah */}
        <div className="flex flex-row items-center justify-center gap-10 mb-4">
          {/* Tombol kiri - Kalender */}
          <button
            onClick={() => setShowCalendar(true)}
            className="flex flex-col items-center justify-center focus:outline-none hover:scale-110 transition-transform"
          >
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs text-white mt-1 font-semibold">Kalender</p>
          </button>

          {/* Tombol kanan - Rapat Berikutnya */}
          <button
            onClick={() => setShowNextMeetings(true)}
            className="flex flex-col items-center justify-center focus:outline-none hover:scale-110 transition-transform"
          >
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs text-white mt-1 font-semibold">
              Rapat Berikutnya
            </p>
          </button>
        </div>
      </div>

      {/* MODAL KALENDER */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[520px] relative shadow-lg animate-fadeIn">
            <h2 className="text-xl font-bold text-[#d6302b] mb-4">
              Kalender Rapat
            </h2>
            <div className="grid grid-cols-7 gap-2 text-center">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
                <div
                  key={d}
                  className="font-semibold text-[#d6302b] border-b pb-1"
                >
                  {d}
                </div>
              ))}
              {calendarDays.map((day, i) => (
                <div
                  key={i}
                  className={`h-10 flex items-center justify-center rounded-lg ${
                    day
                      ? "bg-gray-100 hover:bg-[#d6302b] hover:text-white cursor-pointer transition"
                      : ""
                  }`}
                >
                  {day || ""}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowCalendar(false)}
              className="absolute top-2 right-3 text-gray-600 hover:text-red-500 text-lg font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
