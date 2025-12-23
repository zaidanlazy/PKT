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
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 6;

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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Filter & Pagination
  const filteredList = ruanganList.filter(r =>
    r.nama_ruangan.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRuanganList = filteredList.slice(indexOfFirstItem, indexOfLastItem);

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

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

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
      setCurrentPage(1);
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

    if (!ruanganForm.nama_ruangan.trim()) {
      addToast("Nama ruangan wajib diisi", "error");
      return;
    }

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
      message: "Akses ke ruangan ini akan hilang permanen. Lanjutkan?",
      onConfirm: async () => {
        try {
          await axios.delete(`/ruangan/${id}`);
          addToast("Ruangan berhasil dihapus", "success");
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
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Toasts */}
        <div className="fixed top-6 right-6 z-[70] flex flex-col gap-2">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>

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

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Data Ruangan</h1>
            <p className="text-gray-500 text-sm max-w-xl">
              Kelola daftar ruangan meeting dan fasilitas kantor.
            </p>
          </div>

          {/* Clock Widget */}
          <div className="w-full lg:w-auto bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between lg:justify-end gap-6">
            <div className="text-right">
              <div className="text-2xl font-semibold tracking-tight text-blue-600 font-mono leading-none">
                {formatRealTime(currentTime)}
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                {formatRealDate(currentTime)}
              </div>
            </div>
            <div className="h-10 w-px bg-gray-100"></div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1.5 text-xs font-medium text-gray-900">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Bontang
              </div>
              <div className="text-xs text-gray-400 mt-0.5">Kalimantan Timur</div>
            </div>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all"
                placeholder="Cari ruangan"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => handleOpenModal("add")}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-xs font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              Tambah Ruangan
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider">Nama Ruangan</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!ruanganList || currentRuanganList.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <div className="bg-gray-50 p-3 rounded-full mb-3">
                          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <rect width="18" height="18" x="3" y="3" rx="2"/>
                            <path d="M3 9h18"/>
                            <path d="M9 21V9"/>
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900">Belum ada data</span>
                        <span className="text-xs text-gray-500 mt-1">
                          {searchQuery ? "Tidak ada ruangan yang cocok dengan pencarian" : "Mulai dengan menambahkan ruangan baru."}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentRuanganList.map((ruangan) => (
                    <tr key={ruangan.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="M3 3h18v18H3zM12 8v8"/>
                              <path d="M8 12h8"/>
                            </svg>
                          </div>
                          <span className="font-medium text-gray-900">{ruangan.nama_ruangan}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenModal("edit", ruangan)}
                            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(ruangan.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                            title="Hapus"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="M3 6h18"/>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
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

          {/* Pagination */}
          {filteredList.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> - <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, filteredList.length)}</span> dari <span className="font-medium text-gray-900">{filteredList.length}</span>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FORM MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {modalMode === "add" ? "Tambah Ruangan" : "Edit Ruangan"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Lengkapi informasi ruangan baru.</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M18 6 6 18"/>
                    <path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Ruangan</label>
                  <input
                    type="text"
                    name="nama_ruangan"
                    value={ruanganForm.nama_ruangan}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400 bg-gray-50 focus:bg-white"
                    placeholder="Contoh: Meeting Room Alpha"
                    autoFocus
                  />
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                >
                  {modalMode === 'add' ? 'Simpan' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DETAIL MODAL */}
        {showDetailModal && selectedRuanganDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">Detail Ruangan</h3>
                  </div>
                  <button
                    onClick={handleCloseDetailModal}
                    className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M18 6 6 18"/>
                      <path d="m6 6 12 12"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                    <div className="mt-0.5 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M3 3h18v18H3zM12 8v8"/>
                        <path d="M8 12h8"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Nama Ruangan</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedRuanganDetail.nama_ruangan}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={handleCloseDetailModal}
                  className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    handleCloseDetailModal();
                    handleOpenModal("edit", selectedRuanganDetail);
                  }}
                  className="flex-1 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 shadow-sm transition-colors"
                >
                  Edit Ruangan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
