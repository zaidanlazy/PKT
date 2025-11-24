import { useState, useEffect } from "react";
import axios from "../api/axiosClient";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import SidebarLayout from "../components/SidebarLayout";

export default function Ruangan({ onChanged }) {
  const [ruanganList, setRuanganList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRuanganDetail, setSelectedRuanganDetail] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [selectedRuangan, setSelectedRuangan] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const [ruanganForm, setRuanganForm] = useState({
    nama_ruangan: ""
  });

  // Effect untuk update waktu real-time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fungsi untuk format waktu real-time
  const formatRealTime = (date) =>
    date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  const formatRealDate = (date) =>
    date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Pagination logic
  const totalPages = Math.ceil(ruanganList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRuanganList = ruanganList.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

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
    fetchRuanganList();
  }, []);

  const fetchRuanganList = async () => {
    try {
      const res = await axios.get("/ruangan");
      const data = res.data?.data || res.data || [];
      setRuanganList(Array.isArray(data) ? data : []);
      setCurrentPage(1); // Reset ke halaman pertama saat fetch data
    } catch (err) {
      console.error("Gagal memuat data ruangan:", err);
      setRuanganList([]);
      addToast("Gagal memuat data ruangan", "error");
    }
  };

  const handleOpenDetailModal = (ruangan) => {
    setSelectedRuanganDetail(ruangan);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRuanganDetail(null);
  };

  const handleOpenModal = (mode, ruangan = null) => {
    setModalMode(mode);
    if (mode === "edit" && ruangan) {
      setSelectedRuangan(ruangan);
      setRuanganForm({
        nama_ruangan: ruangan.nama_ruangan
      });
    } else {
      setRuanganForm({
        nama_ruangan: ""
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRuangan(null);
    setRuanganForm({
      nama_ruangan: ""
    });
  };

  const handleInputChange = (e) => {
    setRuanganForm({
      ...ruanganForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === "add") {
        await axios.post("/ruangan", ruanganForm);
        addToast("Ruangan berhasil ditambahkan", "success");
      } else {
        await axios.put(`/ruangan/${selectedRuangan.id}`, ruanganForm);
        addToast("Ruangan berhasil diupdate", "success");
      }
      handleCloseModal();
      fetchRuanganList();
      if (onChanged) onChanged();
    } catch (err) {
      addToast("Gagal menyimpan data ruangan", "error");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    showConfirmModal({
      title: "Hapus Ruangan",
      message: "Yakin ingin menghapus ruangan ini? Tindakan ini tidak dapat dibatalkan.",
      onConfirm: async () => {
        try {
          await axios.delete(`/ruangan/${id}`);
          addToast("Ruangan berhasil dihapus", "error");
          fetchRuanganList();
          if (onChanged) onChanged();
          closeConfirmModal();
        } catch (err) {
          addToast("Gagal menghapus ruangan", "error");
          console.error(err);
          closeConfirmModal();
        }
      },
      type: "delete",
      confirmText: "Hapus",
      cancelText: "Batal"
    });
  };

  return (
    <SidebarLayout title="">
      <div className="relative z-10">
        {/* Toast notifications */}
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

       {/* HEADER DATA RUANGAN DAN WAKTU REAL-TIME DI LUAR TABEL */}
<div className="mb-6">
  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Data Ruangan</h1>
      <p className="text-gray-600">Kelola data ruangan meeting</p>
    </div>

    {/* Komponen waktu real-time */}
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-8 py-6 mt-5 lg:mt-0 text-right flex flex-col justify-center">
      {/* JAM */}
      <div className="flex items-center justify-end gap-2 text-blue-600 font-mono font-semibold text-2xl leading-none mb-1">
        <svg
          className="w-4 h-4 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {formatRealTime(currentTime)}
      </div>

      {/* TANGGAL */}
      <div className="text-sm text-gray-600 font-medium leading-tight">
        {formatRealDate(currentTime)}
      </div>

      {/* LOKASI */}
      <div className="text-xs text-gray-500 flex justify-end items-center gap-1 mt-1 leading-tight">
        <svg
          className="w-3 h-3 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Bontang, Kalimantan Timur
      </div>
    </div>
  </div>
</div>

        {/* Container Tabel */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="p-6">
            {/* Tombol tambah ruangan */}
            <div className="flex justify-between items-center mb-6">
              <div></div>
              <button
                onClick={() => handleOpenModal("add")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl border border-blue-500 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Tambah Ruangan</span>
              </button>
            </div>

            {/* Tabel data ruangan */}
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Nama Ruangan</th>
                      <th className="px-6 py-4 text-center text-gray-700 font-semibold text-sm">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!ruanganList || ruanganList.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="text-center py-12">
                          <div className="flex flex-col items-center space-y-4">
                            <div className="p-4 bg-blue-50 rounded-2xl">
                              <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600 font-medium text-lg mb-2">Belum ada data ruangan</p>
                              <p className="text-gray-500 text-sm mb-4">Mulai dengan membuat ruangan pertama Anda</p>
                              <button
                                onClick={() => handleOpenModal("add")}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 font-medium"
                              >
                                Buat Ruangan Pertama
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentRuanganList.map((ruangan, index) => (
                        <tr
                          key={ruangan.id}
                          className={`transition-all duration-200 hover:bg-blue-50/50 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-gray-800 font-semibold text-sm">{ruangan.nama_ruangan}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center space-x-1">
                              <button
                                onClick={() => handleOpenModal("edit", ruangan)}
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(ruangan.id)}
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

            {ruanganList && ruanganList.length > 0 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-gray-600 text-sm">
                    Menampilkan <span className="font-semibold">{indexOfFirstItem + 1}</span> - <span className="font-semibold">{Math.min(indexOfLastItem, ruanganList.length)}</span> dari <span className="font-semibold">{ruanganList.length}</span> ruangan
                  </p>

                  {/* Pagination Controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 ${
                        currentPage === 1
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Sebelumnya
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        // Show first page, last page, current page, and pages around current
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 ${
                                currentPage === pageNumber
                                  ? 'bg-blue-500 text-white font-semibold shadow-md'
                                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return (
                            <span key={pageNumber} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors duration-200 ${
                        currentPage === totalPages
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Detail Ruangan */}
        {showDetailModal && selectedRuanganDetail && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Detail Ruangan</h3>
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Nama Ruangan</p>
                        <p className="font-semibold text-gray-800">{selectedRuanganDetail.nama_ruangan}</p>
                      </div>
                    </div>
                  </div>
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
                      handleOpenModal("edit", selectedRuanganDetail);
                    }}
                    className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 text-sm"
                  >
                    Edit Ruangan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ruangan */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">
                    {modalMode === "add" ? "Tambah Ruangan" : "Edit Ruangan"}
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
                    <label className="block text-gray-800 font-semibold mb-2 text-sm">Nama Ruangan</label>
                    <input
                      type="text"
                      name="nama_ruangan"
                      value={ruanganForm.nama_ruangan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                      placeholder="Masukkan nama ruangan"
                      required
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
    </SidebarLayout>
  );
}
