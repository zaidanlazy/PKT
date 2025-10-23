import { useState, useEffect } from "react";
import axios from "../api/axiosClient";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

export default function Rapat({ onChanged }) {
  const [rapatList, setRapatList] = useState([]);
  const [ruanganList, setRuanganList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRapatDetail, setSelectedRapatDetail] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [selectedRapat, setSelectedRapat] = useState(null);
  const [toasts, setToasts] = useState([]);

  // State untuk confirm modal
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "delete",
    confirmText: "Hapus",
    cancelText: "Batal"
  });

  const [formData, setFormData] = useState({
    nama_rapat: "",
    jenis: "offline",
    tanggal: "",
    waktu_mulai: "",
    waktu_selesai: "",
    ruangan_id: "",
    deskripsi: "",
  });

  // Fungsi untuk menambah toast
  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  // Fungsi untuk menghapus toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Fungsi untuk menampilkan confirm modal
  const showConfirmModal = (options) => {
    setConfirmModal({
      isOpen: true,
      title: options.title || "Konfirmasi",
      message: options.message || "Apakah Anda yakin?",
      onConfirm: options.onConfirm,
      type: options.type || "delete",
      confirmText: options.confirmText || "Hapus",
      cancelText: options.cancelText || "Batal"
    });
  };

  // Fungsi untuk menutup confirm modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null,
      type: "delete",
      confirmText: "Hapus",
      cancelText: "Batal"
    });
  };

  useEffect(() => {
    fetchRapatList();
    fetchRuanganList();
  }, []);

  const fetchRapatList = async () => {
    try {
      const res = await axios.get("/rapat-ruang");
      const data = res.data?.data || res.data || [];
      setRapatList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat data rapat:", err);
      setRapatList([]);
      addToast("Gagal memuat data rapat", "error");
    }
  };

  const fetchRuanganList = async () => {
    try {
      const res = await axios.get("/ruangan");
      const data = res.data?.data || res.data || [];
      setRuanganList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat data ruangan:", err);
      setRuanganList([]);
      addToast("Gagal memuat data ruangan", "error");
    }
  };

  const handleOpenDetailModal = (rapat) => {
    setSelectedRapatDetail(rapat);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRapatDetail(null);
  };

  const handleOpenModal = (mode, rapat = null) => {
    setModalMode(mode);
    if (mode === "edit" && rapat) {
      const formattedDate = new Date(rapat.tanggal)
        .toISOString()
        .split("T")[0];
      setSelectedRapat(rapat);
      setFormData({
        nama_rapat: rapat.nama_rapat,
        jenis: rapat.jenis,
        tanggal: formattedDate,
        waktu_mulai: rapat.waktu_mulai,
        waktu_selesai: rapat.waktu_selesai,
        ruangan_id: rapat.ruangan_id || "",
        deskripsi: rapat.deskripsi || "",
      });
    } else {
      setFormData({
        nama_rapat: "",
        jenis: "online",
        tanggal: "",
        waktu_mulai: "",
        waktu_selesai: "",
        ruangan_id: "",
        deskripsi: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRapat(null);
    setFormData({
      nama_rapat: "",
      jenis: "online",
      tanggal: "",
      waktu_mulai: "",
      waktu_selesai: "",
      ruangan_id: "",
      deskripsi: "",
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "add") {
        await axios.post("/rapat", formData);
        addToast("Rapat berhasil ditambahkan", "success");
      } else {
        await axios.put(`/rapat/${selectedRapat.id}`, formData);
        addToast("Rapat berhasil diupdate", "success");
      }
      handleCloseModal();
      fetchRapatList();
      if (onChanged) onChanged();
    } catch (err) {
      addToast("Gagal menyimpan data rapat", "error");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    showConfirmModal({
      title: "Hapus Rapat",
      message: "Yakin ingin menghapus rapat ini? Tindakan ini tidak dapat dibatalkan.",
      onConfirm: async () => {
        try {
          await axios.delete(`/rapat/${id}`);
          addToast("Rapat berhasil dihapus", "error");
          fetchRapatList();
          if (onChanged) onChanged();
          closeConfirmModal();
        } catch (err) {
          addToast("Gagal menghapus rapat", "error");
          console.error(err);
          closeConfirmModal();
        }
      },
      type: "delete",
      confirmText: "Hapus",
      cancelText: "Batal"
    });
  };

  const getNamaRuangan = (ruanganId) => {
    const ruangan = ruanganList.find(r => r.id === ruanganId);
    return ruangan ? ruangan.nama_ruangan : "Tidak tersedia";
  };

  const getRuanganName = (rapat) => {
    if (rapat.ruangan) {
      return rapat.ruangan.nama_ruangan;
    }
    return getNamaRuangan(rapat.ruangan_id);
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
      />

      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Rapat</h2>
              <p className="text-gray-600">Kelola data rapat meeting</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleOpenModal("add")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl border border-blue-500 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Tambah Rapat</span>
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Nama Rapat</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Jenis</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Tanggal</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Waktu</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Ruangan</th>
                    <th className="px-6 py-4 text-center text-gray-700 font-semibold text-sm">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {!rapatList || rapatList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-4 bg-blue-50 rounded-2xl">
                            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600 font-medium text-lg mb-2">Belum ada data rapat</p>
                            <p className="text-gray-500 text-sm mb-4">Mulai dengan membuat rapat pertama Anda</p>
                            <button
                              onClick={() => handleOpenModal("add")}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 font-medium"
                            >
                              Buat Rapat Pertama
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rapatList.map((rapat, index) => (
                      <tr
                        key={rapat.id}
                        className={`transition-all duration-200 hover:bg-blue-50/50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-gray-800 font-semibold text-sm">{rapat.nama_rapat}</p>
                              {rapat.deskripsi && (
                                <p className="text-gray-500 text-xs mt-1 line-clamp-1">{rapat.deskripsi}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1.5 rounded-lg ${
                              rapat.jenis === "online" ? "bg-blue-100" : "bg-green-100"
                            }`}>
                              <svg className={`w-3 h-3 ${
                                rapat.jenis === "online" ? "text-blue-600" : "text-green-600"
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {rapat.jenis === "online" ? (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                ) : (
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                )}
                              </svg>
                            </div>
                            <span className={`text-sm font-medium ${
                              rapat.jenis === "online" ? "text-blue-700" : "text-green-700"
                            }`}>
                              {rapat.jenis === "online" ? "Online" : "Offline"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700 font-medium text-sm">
                              {new Date(rapat.tanggal).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-gray-700 font-medium text-sm">
                              {rapat.waktu_mulai} - {rapat.waktu_selesai}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {rapat.jenis === "offline" && rapat.ruangan_id ? (
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="text-gray-700 font-medium text-sm">{getRuanganName(rapat)}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center space-x-1">
                            <button
                              onClick={() => handleOpenDetailModal(rapat)}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                              title="Lihat Detail"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleOpenModal("edit", rapat)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(rapat.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                              title="Hapus"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {rapatList && rapatList.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-gray-600 text-sm">
                  Menampilkan <span className="font-semibold">{rapatList.length}</span> rapat
                </p>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    Previous
                  </button>
                  <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Rapat */}
      {showDetailModal && selectedRapatDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Detail Rapat</h3>
                <button
                  onClick={handleCloseDetailModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nama kegiatan Rapat</p>
                      <p className="font-semibold text-gray-800">{selectedRapatDetail.nama_rapat}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">Jenis Rapat</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          selectedRapatDetail.jenis === "online"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-green-100 text-green-800 border-green-200"
                        }`}
                      >
                        {selectedRapatDetail.jenis === "online" ? "Online" : "Offline"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">Tanggal</p>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedRapatDetail.tanggal).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Waktu</p>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-gray-800">
                      {selectedRapatDetail.waktu_mulai} - {selectedRapatDetail.waktu_selesai}
                    </span>
                  </div>
                </div>

                {selectedRapatDetail.jenis === "offline" && selectedRapatDetail.ruangan_id && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-gray-600 mb-2">Ruangan</p>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium text-gray-800">
                        {getRuanganName(selectedRapatDetail)}
                      </span>
                    </div>
                  </div>
                )}

                {selectedRapatDetail.jenis === "online" && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">Platform</p>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium text-gray-800">Meeting Online</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-6">
                <button
                  onClick={handleCloseDetailModal}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    handleCloseDetailModal();
                    handleOpenModal("edit", selectedRapatDetail);
                  }}
                  className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 text-sm"
                >
                  Edit Rapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rapat */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {modalMode === "add" ? "Tambah Rapat" : "Edit Rapat"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Nama Rapat</label>
                  <input
                    type="text"
                    name="nama_rapat"
                    value={formData.nama_rapat}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="Masukkan nama kegiatan "
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Jenis Rapat</label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jenis"
                        value="online"
                        checked={formData.jenis === "online"}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-500 bg-gray-50 border-gray-200 focus:ring-blue-400"
                      />
                      <span className="text-gray-800 text-sm">Online</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="jenis"
                        value="offline"
                        checked={formData.jenis === "offline"}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-500 bg-gray-50 border-gray-200 focus:ring-blue-400"
                      />
                      <span className="text-gray-800 text-sm">Offline</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Tanggal</label>
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2 text-sm">Waktu Mulai</label>
                    <input
                      type="time"
                      name="waktu_mulai"
                      value={formData.waktu_mulai}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2 text-sm">Waktu Selesai</label>
                    <input
                      type="time"
                      name="waktu_selesai"
                      value={formData.waktu_selesai}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                      required
                    />
                  </div>
                </div>

                {formData.jenis === "offline" && (
                  <div>
                    <label className="block text-gray-800 font-semibold mb-2 text-sm">Ruangan</label>
                    <select
                      name="ruangan_id"
                      value={formData.ruangan_id}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    >
                      <option value="">Pilih Ruangan</option>
                      {ruanganList.filter(r => r.status === "tersedia").map(ruangan => (
                        <option key={ruangan.id} value={ruangan.id}>
                          {ruangan.nama_ruangan} - {ruangan.lokasi}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Deskripsi</label>
                  <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm resize-none"
                    placeholder="Masukkan deskripsi rapat (opsional)"
                    rows="3"
                  />
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-50 transition-all duration-300 text-sm"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 text-sm"
                  >
                    {modalMode === "add" ? "Tambah" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

