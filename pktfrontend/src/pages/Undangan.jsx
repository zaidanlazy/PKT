import { useState, useEffect } from "react";
import axios from "../api/axiosClient";
import Toast from "../components/Toast";

export default function Undangan() {
  const [undanganList, setUndanganList] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Fungsi untuk menambah toast
  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  // Fungsi untuk menghapus toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  useEffect(() => {
    fetchUndanganList();
  }, []);

  const fetchUndanganList = async () => {
    try {
      const res = await axios.get("/undangan/user");
      const data = res.data?.data || res.data || [];
      setUndanganList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat data undangan:", err);
      setUndanganList([]);
      addToast("Gagal memuat data undangan", "error");
    }
  };

  const handleAcceptInvitation = async (undanganId) => {
    try {
      await axios.put(`/undangan/${undanganId}/status`, { status: 'accepted' });
      addToast("Undangan berhasil diterima", "success");
      fetchUndanganList();
    } catch (err) {
      addToast("Gagal menerima undangan", "error");
      console.error(err);
    }
  };

  const handleDeclineInvitation = async (undanganId) => {
    try {
      await axios.put(`/undangan/${undanganId}/status`, { status: 'declined' });
      addToast("Undangan berhasil ditolak", "success");
      fetchUndanganList();
    } catch (err) {
      addToast("Gagal menolak undangan", "error");
      console.error(err);
    }
  };

  const handleMarkAsRead = async (undanganId) => {
    try {
      await axios.put(`/undangan/${undanganId}/read`);
      fetchUndanganList();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'accepted': return 'Diterima';
      case 'declined': return 'Ditolak';
      default: return 'Tidak diketahui';
    }
  };

  return (
    <div className="relative z-10">
      {/* Render semua toast notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Undangan Rapat</h2>
              <p className="text-gray-600">Kelola undangan rapat yang Anda terima</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Nama Rapat</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Tanggal & Waktu</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Lokasi</th>
                    <th className="px-6 py-4 text-center text-gray-700 font-semibold text-sm">Status</th>
                    <th className="px-6 py-4 text-center text-gray-700 font-semibold text-sm">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {!undanganList || undanganList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-4 bg-blue-50 rounded-2xl">
                            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 00-15 0v5h5l-5 5-5-5h5v-5a7.5 7.5 0 0115 0v5z" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600 font-medium text-lg mb-2">Belum ada undangan</p>
                            <p className="text-gray-500 text-sm">Anda akan menerima notifikasi ketika ada undangan rapat</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    undanganList.map((undangan, index) => (
                      <tr
                        key={undangan.id}
                        className={`transition-all duration-200 hover:bg-blue-50/50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-gray-800 font-semibold text-sm">{undangan.rapat.nama_rapat}</p>
                              <p className="text-gray-500 text-xs">
                                {undangan.rapat.jenis === 'online' ? 'Online' : 'Offline'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-gray-800 font-medium text-sm">
                              {new Date(undangan.rapat.tanggal).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {undangan.rapat.waktu_mulai} - {undangan.rapat.waktu_selesai}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {undangan.rapat.ruangan ? (
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="text-gray-700 font-medium text-sm">{undangan.rapat.ruangan.nama_ruangan}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Online</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(undangan.status)}`}>
                              {getStatusText(undangan.status)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center space-x-1">
                            {undangan.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleAcceptInvitation(undangan.id)}
                                  className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                                  title="Terima"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeclineInvitation(undangan.id)}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                                  title="Tolak"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </>
                            )}
                            {undangan.dibaca_at === null && (
                              <button
                                onClick={() => handleMarkAsRead(undangan.id)}
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                                title="Tandai sebagai dibaca"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {undanganList && undanganList.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-gray-600 text-sm">
                  Menampilkan <span className="font-semibold">{undanganList.length}</span> undangan
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
