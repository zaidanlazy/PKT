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
            "url('https://media.istockphoto.com/id/1489796304/id/vektor/latar-belakang-gradasi-warna-langit-biru-dengan-tekstur-butiran.jpg?s=170667a&w=0&k=20&c=nRbMgdaVrXibQ0ma-gBxet_mwcijkJpgw7Jmn6pNkg8=')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        Loading
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
        className="flex-1 text-white px-16 py-10 relative"
        style={{
          backgroundImage:
            "url('https://media.istockphoto.com/id/1489796304/id/vektor/latar-belakang-gradasi-warna-langit-biru-dengan-tekstur-butiran.jpg?s=170667a&w=0&k=20&c=nRbMgdaVrXibQ0ma-gBxet_mwcijkJpgw7Jmn6pNkg8=')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>

        <div className="relative z-10">
          {/* Header kiri atas */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 tracking-tight">
                {rapat.ruangan?.nama_ruangan || "RUANG RAPAT UTAMA"}
              </h2>
            </div>
            <div className="text-lg font-semibold leading-tight tracking-wide">
              {formatClockWithSeconds(now)}
            </div>
          </div>

          {/* Current Meeting */}
          <div className="mt-28">
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

          {/* Next Meetings */}
          <div className="mt-20 max-w-xl">
            <h3 className="text-base font-semibold tracking-wide opacity-90 mb-3">
              RAPAT KEGIATAN SELANJUTNYA
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-sm opacity-90">
                  22 May 3:30 PM - 4:30 PM
                </p>
                <p className="text-2xl font-semibold text-white/95">
                  Status Meeting Scrum Team
                </p>
              </div>
              <div>
                <p className="text-sm opacity-90">
                  22 May 4:30 PM - 5:30 PM
                </p>
                <p className="text-2xl font-semibold text-white/95">
                  Progress Update
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[320px] bg-[#004C8C] flex flex-col items-center justify-between py-16 relative">
        {/* Logo */}
        <div className="flex flex-col items-center mt-10 animate-fadeIn">
          <div className="w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-lg p-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Logo_pupuk_kaltim.svg/400px-Logo_pupuk_kaltim.svg.png?20190120151511"
              alt="Pupuk Kaltim"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-row items-center justify-center gap-14 mb-4">
          <button
            onClick={() => setShowCalendar(true)}
            className="flex flex-col items-center justify-center focus:outline-none hover:scale-110 transition-transform"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-white"
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
            <p className="text-sm text-white mt-2 font-extrabold">Kalender</p>
          </button>

          <button
            onClick={() => setShowNextMeetings(true)}
            className="flex flex-col items-center justify-center focus:outline-none hover:scale-110 transition-transform"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-white mt-2 font-extrabold">
              Rapat Berikutnya
            </p>
          </button>
        </div>
      </div>

      {/* MODALS (tidak diubah) */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[520px] relative shadow-lg animate-fadeIn">
            <h2 className="text-xl font-bold text-[#004C8C] mb-4">
              Kalender Rapat
            </h2>
            <div className="grid grid-cols-7 gap-2 text-center">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
                <div
                  key={d}
                  className="font-semibold text-[#004C8C] border-b pb-1"
                >
                  {d}
                </div>
              ))}
              {calendarDays.map((day, i) => (
                <div
                  key={i}
                  className={`h-10 flex items-center justify-center rounded-lg ${
                    day
                      ? "bg-gray-100 hover:bg-[#004C8C] hover:text-white cursor-pointer transition"
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

      {showNextMeetings && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[520px] relative shadow-lg animate-fadeIn">
            <h2 className="text-xl font-bold text-[#004C8C] mb-4">
              Rapat Berikutnya
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-700">
                  22 May 3:30 PM - 4:30 PM
                </p>
                <p className="text-lg font-semibold text-[#004C8C]">
                  Status Meeting Scrum Team
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-700">
                  22 May 4:30 PM - 5:30 PM
                </p>
                <p className="text-lg font-semibold text-[#004C8C]">
                  Progress Update
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNextMeetings(false)}
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
