// components/DetailRapat.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../api/axiosClient";
import Toast from "../components/Toast";

export default function DetailRapat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rapat, setRapat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    fetchRapatDetail();
  }, [id]);

  const fetchRapatDetail = async () => {
    try {
      setLoading(true);
      console.log("Mencoba fetch detail rapat dengan ID:", id);

      // Coba endpoint yang berbeda
      const endpoints = [
        `/rapat/${id}`,
        `/rapat/detail/${id}`,
        `/rapat?id=${id}`,
        `/meetings/${id}`
      ];

      let responseData = null;

      for (const endpoint of endpoints) {
        try {
          console.log("Mencoba endpoint:", endpoint);
          const res = await axios.get(endpoint);

          if (res.data) {
            // Cek berbagai format response
            if (res.data.id || res.data.nama_rapat) {
              responseData = res.data;
              console.log("Data ditemukan di endpoint:", endpoint, res.data);
              break;
            } else if (res.data.data && (res.data.data.id || res.data.data.nama_rapat)) {
              responseData = res.data.data;
              console.log("Data ditemukan di endpoint (dalam data property):", endpoint, res.data.data);
              break;
            } else if (Array.isArray(res.data) && res.data.length > 0) {
              responseData = res.data[0];
              console.log("Data ditemukan di endpoint (array):", endpoint, res.data[0]);
              break;
            }
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} gagal:`, err.message);
          continue;
        }
      }

      if (responseData) {
        setRapat(responseData);
      } else {
        // Jika semua endpoint gagal, gunakan mock data untuk development
        console.log("Semua endpoint gagal, menggunakan mock data");
        setRapat(generateMockData());
      }

    } catch (error) {
      console.error("Semua endpoint gagal:", error);
      addToast("Tidak dapat terhubung ke server", "error");
      // Fallback ke mock data untuk development
      setRapat(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data untuk development
  const generateMockData = () => {
    return {
      id: id,
      nama_rapat: `Rapat Important Project ${id}`,
      tanggal: new Date().toISOString().split('T')[0],
      waktu_mulai: "14:00",
      waktu_selesai: "16:00",
      jenis: "online",
      deskripsi: `Ini adalah deskripsi untuk rapat dengan ID ${id}. Rapat ini membahas perkembangan project penting dan rencana ke depan untuk tim.`,
      lokasi: "Virtual Meeting Room",
      peserta: 15,
      created_at: new Date().toISOString()
    };
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch (err) {
      return "Tanggal tidak tersedia";
    }
  };

  const handleJoinMeeting = () => {
    addToast("Bergabung ke rapat...", "info");
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat detail rapat...</p>
          <p className="text-sm text-gray-500 mt-2">ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8 relative overflow-hidden">
      {/* Toast container */}
      <div className="fixed top-6 right-6 z-50 space-y-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => removeToast(toast.id)} />
        ))}
      </div>

      {/* decor baground  */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* bagian header*/}
      <div className="relative z-10 mb-8">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Detail Rapat</h1>
            <p className="text-gray-600">Sistem Manajemen Rapat Pupuk Kaltim</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-8 text-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4">{rapat.nama_rapat}</h2>
                <div className="flex flex-wrap items-center gap-4 text-blue-100">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">{formatDate(rapat.tanggal)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{rapat.waktu_mulai} - {rapat.waktu_selesai}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    rapat.jenis === "online"
                      ? "bg-blue-500 text-white"
                      : "bg-green-500 text-white"
                  }`}>
                    {rapat.jenis === "online" ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
              <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                Development Mode
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Informasi Rapat Section */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Informasi Rapat
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Lokasi</p>
                          <p className="text-gray-600">
                            {rapat.jenis === "online" ? "Virtual Meeting" : rapat.lokasi || "Ruangan A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Durasi</p>
                          <p className="text-gray-600">2 Jam</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Peserta</p>
                          <p className="text-gray-600">{rapat.peserta || 15} Orang</p>
                        </div>
                      </div>
                    </div>

                    {/* Deskripsi Rapat */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Deskripsi Rapat</h4>
                      <p className="text-gray-600 leading-relaxed">
                        {rapat.deskripsi}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jadwal Berikutnya Section */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white h-full">
                  <h3 className="text-xl font-semibold mb-6 flex items-center">
                    <svg className="w-6 h-6 text-white mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Jadwal Berikutnya
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-blue-100 text-sm">22 May</span>
                        <span className="text-white text-sm font-medium">3:30 PM - 4:30 PM</span>
                      </div>
                      <p className="text-white font-medium">Status Meeting Scrum Team</p>
                    </div>

                    <div className="bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-blue-100 text-sm">22 May</span>
                        <span className="text-white text-sm font-medium">4:30 PM - 5:30 PM</span>
                      </div>
                      <p className="text-white font-medium">Progress Update</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-8 pt-8 border-t border-gray-200">
              <button
                onClick={handleBack}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Kembali ke Dashboard
              </button>
              <button
                onClick={handleJoinMeeting}
                className="px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 font-medium flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Join Meeting</span>
              </button>
            </div>

            {/* Debug Info */}
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                🚧 Development Info - Mock Data
              </p>
              <p className="text-sm text-yellow-700">
                Data ini menggunakan mock data untuk development. Pastikan backend API tersedia di production.
                Rapat ID: <strong>{id}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
