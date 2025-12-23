import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosClient";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import SidebarLayout from "../components/SidebarLayout";

export default function Rapat({ onChanged }) {
  const [rapatList, setRapatList] = useState([]);
  const [ruanganList, setRuanganList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRapatDetail, setSelectedRapatDetail] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [selectedRapat, setSelectedRapat] = useState(null);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formErrors, setFormErrors] = useState({
    nama_rapat: "",
    jenis: "",
    tanggal: "",
    waktu_mulai: "",
    waktu_selesai: "",
    ruangan_id: ""
  });

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
    link_rapat: "",
    invited_users: [],
    pesan_undangan: "",
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

  const filteredUsers = userList.filter(user => {
    const query = userSearchQuery.toLowerCase();
    return (
      user.nama?.toLowerCase().includes(query) ||
      user.unit_kerja?.toLowerCase().includes(query) ||
      user.mpk?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  const handleSelectAll = () => {
    const allFilteredUserIds = filteredUsers.map(user => user.id);
    const currentlySelected = formData.invited_users;
    const allSelected = allFilteredUserIds.every(id =>
      currentlySelected.includes(id)
    );

    if (allSelected) {
      const newSelectedUsers = currentlySelected.filter(id =>
        !allFilteredUserIds.includes(id)
      );
      setFormData(prev => ({
        ...prev,
        invited_users: newSelectedUsers
      }));
    } else {
      const newSelectedUsers = [...new Set([...currentlySelected, ...allFilteredUserIds])];
      setFormData(prev => ({
        ...prev,
        invited_users: newSelectedUsers
      }));
    }
  };

  const getSelectedFilteredCount = () => {
    return filteredUsers.filter(user =>
      formData.invited_users.includes(user.id)
    ).length;
  };

  // Fungsi helper untuk mendapatkan nama ruangan
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

  // Filter rapat berdasarkan searchQuery
  const filteredRapatList = rapatList.filter(rapat => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const namaRapat = rapat.nama_rapat?.toLowerCase() || '';
    const deskripsi = rapat.deskripsi?.toLowerCase() || '';
    const jenis = rapat.jenis?.toLowerCase() || '';
    const tanggal = new Date(rapat.tanggal).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).toLowerCase();
    const ruanganNama = getRuanganName(rapat).toLowerCase();

    return namaRapat.includes(query) ||
           deskripsi.includes(query) ||
           jenis.includes(query) ||
           tanggal.includes(query) ||
           ruanganNama.includes(query);
  });

  const totalPages = Math.ceil(filteredRapatList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRapatList = filteredRapatList.slice(indexOfFirstItem, indexOfLastItem);

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
    }, 2000);
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

  const validateForm = () => {
    const errors = {
      nama_rapat: "",
      jenis: "",
      tanggal: "",
      waktu_mulai: "",
      waktu_selesai: "",
      ruangan_id: ""
    };

    let isValid = true;

    if (!formData.nama_rapat.trim()) {
      errors.nama_rapat = "Nama rapat harus diisi";
      isValid = false;
      addToast("Nama rapat harus diisi", "error");
    }

    if (!formData.jenis) {
      errors.jenis = "Jenis rapat harus dipilih";
      isValid = false;
      addToast("Jenis rapat harus dipilih", "error");
    }

    if (!formData.tanggal) {
      errors.tanggal = "Tanggal rapat harus diisi";
      isValid = false;
      addToast("Tanggal rapat harus diisi", "error");
    }

    if (!formData.waktu_mulai) {
      errors.waktu_mulai = "Waktu mulai harus diisi";
      isValid = false;
      addToast("Waktu mulai harus diisi", "error");
    }

    if (!formData.waktu_selesai) {
      errors.waktu_selesai = "Waktu selesai harus diisi";
      isValid = false;
      addToast("Waktu selesai harus diisi", "error");
    }

    if (formData.waktu_mulai && formData.waktu_selesai) {
      if (formData.waktu_selesai <= formData.waktu_mulai) {
        errors.waktu_selesai = "Waktu selesai harus setelah waktu mulai";
        isValid = false;
        addToast("Waktu selesai harus setelah waktu mulai", "error");
      }
    }

    if (formData.jenis === "offline" && !formData.ruangan_id) {
      errors.ruangan_id = "Ruangan harus dipilih untuk rapat offline";
      isValid = false;
      addToast("Ruangan harus dipilih untuk rapat offline", "error");
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };

  useEffect(() => {
    fetchRapatList();
    fetchRuanganList();
    fetchUserList();
  }, []);

  const fetchRapatList = async () => {
    console.log('fetch rapat');

    try {
      const res = await axios.get("/rapat-ruang");
      const data = res.data?.data || res.data || [];
      setRapatList(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err) {
      console.error("Gagal memuat data rapat:", err);
      setRapatList([]);
      addToast("Gagal memuat data rapat", "error");
    }
  };

  const fetchRuanganList = async () => {
  console.log("FETCH RUANGAN DIPANGGIL");

  try {
    const res = await axios.get("/ruangan");
    const data = res.data?.data ?? res.data ?? [];
    setRuanganList(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Gagal memuat data ruangan:", err);
    setRuanganList([]);
    addToast("Gagal memuat data ruangan", "error");
  }
};

const fetchUserList = async () => {
  console.log("FETCH USER DIPANGGIL");

  try {
    const res = await axios.get("/users");
    const data = res.data?.data ?? res.data ?? [];
    setUserList(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Gagal memuat data user:", err);
    setUserList([]);
    addToast("Gagal memuat data user", "error");
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

  const handleOpenModal = async (mode, rapat = null) => {
    setModalMode(mode);
    setFormErrors({
      nama_rapat: "",
      jenis: "",
      tanggal: "",
      waktu_mulai: "",
      waktu_selesai: "",
      ruangan_id: ""
    });

    if (mode === "edit" && rapat) {
      try {
        const response = await axios.get(`/rapat/${rapat.id}`);
        const detailRapat = response.data?.data || response.data;

        const formattedDate = new Date(detailRapat.tanggal)
          .toISOString()
          .split("T")[0];

        let invitedUserIds = [];
        if (detailRapat.undangan && Array.isArray(detailRapat.undangan)) {
          invitedUserIds = detailRapat.undangan.map(inv => {
            return inv.user_id || inv.userId || inv.id_user || inv.id || inv;
          }).filter(id => id != null && typeof id === 'number');
        }

        setSelectedRapat(detailRapat);
        setFormData({
          nama_rapat: detailRapat.nama_rapat,
          jenis: detailRapat.jenis,
          tanggal: formattedDate,
          waktu_mulai: detailRapat.waktu_mulai,
          waktu_selesai: detailRapat.waktu_selesai,
          ruangan_id: detailRapat.ruangan_id || "",
          deskripsi: detailRapat.deskripsi || "",
          link_rapat: detailRapat.link_rapat || "",
          invited_users: invitedUserIds,
          pesan_undangan: "",
        });
      } catch (err) {
        console.error("Error fetching rapat detail:", err);
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
          link_rapat: rapat.link_rapat || "",
          invited_users: [],
          pesan_undangan: "",
        });
      }
    } else {
      setFormData({
        nama_rapat: "",
        jenis: "online",
        tanggal: "",
        waktu_mulai: "",
        waktu_selesai: "",
        ruangan_id: "",
        deskripsi: "",
        link_rapat: "",
        invited_users: [],
        pesan_undangan: "",
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
      link_rapat: "",
      invited_users: [],
      pesan_undangan: "",
    });
    setFormErrors({
      nama_rapat: "",
      jenis: "",
      tanggal: "",
      waktu_mulai: "",
      waktu_selesai: "",
      ruangan_id: ""
    });
    setUserSearchQuery("");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset ke halaman pertama saat search berubah
  };

  const handleUserSearchChange = (e) => {
    setUserSearchQuery(e.target.value);
  };

  const handleUserInvite = (userId) => {
    setFormData(prev => ({
      ...prev,
      invited_users: prev.invited_users.includes(userId)
        ? prev.invited_users.filter(id => id !== userId)
        : [...prev.invited_users, userId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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
      if (err.response && err.response.status === 409) {
        addToast(err.response.data.message || "Ruangan sudah digunakan pada waktu tersebut", "error");
      } else if (err.response && err.response.data && err.response.data.message) {
        addToast(err.response.data.message, "error");
      } else {
        addToast("Gagal menyimpan data rapat", "error");
      }
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

  return (
    <SidebarLayout title="">
      <div className="relative z-10 max-w-7xl mx-auto">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}

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
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Agenda Rapat</h1>
            <p className="text-gray-500 text-sm max-w-xl">
              Kelola jadwal, reservasi ruangan, dan undangan peserta.
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
          {/* Search & Add Button */}
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
                placeholder="Cari rapat, tanggal, ruangan..."
                value={searchQuery}
                onChange={handleSearchChange}
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
              Rapat Baru
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider ">Kegiatan Rapat</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider ">Jenis</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider ">Tanggal</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider  ">Waktu</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider text-center w-20">Lokasi</th>
                  <th className="px-6 py-3 text-xs uppercase tracking-wider  text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!filteredRapatList || filteredRapatList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg className="w-10 h-10 mb-3 opacity-20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">
                          {searchQuery ? "Tidak ada hasil pencarian" : "Tidak ada data"}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          {searchQuery ? `Tidak ditemukan rapat dengan kata kunci "${searchQuery}"` : "Coba ubah filter pencarian atau buat jadwal baru."}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentRapatList.map((rapat) => (
                    <tr key={rapat.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">{rapat.nama_rapat}</span>
                          {rapat.deskripsi && (
                            <span className="text-xs text-gray-500 truncate max-w-[180px] mt-0.5 opacity-80">{rapat.deskripsi}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className= "flex justify-center items-center"></div>
                        {rapat.jenis === "online" ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <polygon points="23 7 16 12 23 17 23 7" />
                              <rect width="15" height="14" x="1" y="5" rx="2" ry="2" />
                            </svg>
                            ONLINE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            OFFLINE
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-xs font-medium">
                        {new Date(rapat.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                        {rapat.waktu_mulai} - {rapat.waktu_selesai}
                      </td>
                      <td className="px-6 py-4">
                        {rapat.jenis === "offline" ? (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {getRuanganName(rapat)}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                            </svg>
                            Via Link
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-center gap-1">
                          {rapat.jenis === "offline" && (
                            <button
                              onClick={() => navigate(`/rapat/detail/${rapat.id}`)}
                              className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
                              title="Lihat Detail"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                                <circle cx="12" cy="12" r="3"/>
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenModal("edit", rapat)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(rapat.id)}
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
          {filteredRapatList && filteredRapatList.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> - <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, filteredRapatList.length)}</span> dari <span className="font-medium text-gray-900">{filteredRapatList.length}</span>
                {searchQuery && <span className="ml-1">(difilter dari {rapatList.length} total)</span>}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FORM */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {modalMode === "add" ? "Jadwalkan Rapat" : "Edit Agenda"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Isi detail pertemuan di bawah ini.</p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-900 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M18 6 6 18"/>
                    <path d="m6 6 12 12"/>
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <form id="rapatForm" onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama Agenda</label>
                    <input
                      type="text"
                      name="nama_rapat"
                      value={formData.nama_rapat}
                      onChange={handleInputChange}
                      className={`block w-full rounded-lg border ${formErrors.nama_rapat ? 'border-red-300 ring-red-100' : 'border-gray-200'} px-3 py-2 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400`}
                      placeholder="Misal: Review Q3"
                    />
                    {formErrors.nama_rapat && <p className="mt-1 text-xs text-red-500">{formErrors.nama_rapat}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Tipe</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`relative flex items-center p-3 border rounded-xl cursor-pointer transition-all ${formData.jenis === 'online' ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="jenis"
                          value="online"
                          checked={formData.jenis === 'online'}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.jenis === 'online' ? 'bg-white shadow-sm text-gray-900' : 'bg-gray-100 text-gray-400'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <polygon points="23 7 16 12 23 17 23 7" />
                              <rect width="15" height="14" x="1" y="5" rx="2" ry="2" />
                            </svg>
                          </div>
                          <div className="text-sm font-medium text-gray-900">Online</div>
                        </div>
                      </label>

                      <label className={`relative flex items-center p-3 border rounded-xl cursor-pointer transition-all ${formData.jenis === 'offline' ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="jenis"
                          value="offline"
                          checked={formData.jenis === 'offline'}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.jenis === 'offline' ? 'bg-white shadow-sm text-gray-900' : 'bg-gray-100 text-gray-400'}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="text-sm font-medium text-gray-900">Offline</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Tanggal</label>
                      <input
                        type="date"
                        name="tanggal"
                        value={formData.tanggal}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Mulai</label>
                      <input
                        type="time"
                        name="waktu_mulai"
                        value={formData.waktu_mulai}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Selesai</label>
                      <input
                        type="time"
                        name="waktu_selesai"
                        value={formData.waktu_selesai}
                        onChange={handleInputChange}
                        className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    {formData.jenis === 'offline' ? (
                      <>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Pilih Ruangan</label>
                        <select
                          name="ruangan_id"
                          value={formData.ruangan_id}
                          onChange={handleInputChange}
                          className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none bg-white"
                        >
                          <option value="">Pilih</option>
                          {ruanganList.map(r => (
                            <option key={r.id} value={r.id}>
                              {r.nama_ruangan} {r.lokasi ? `(${r.lokasi})` : ''}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Link Meeting</label>
                        <input
                          type="url"
                          name="link_rapat"
                          value={formData.link_rapat}
                          onChange={handleInputChange}
                          placeholder="https://..."
                          className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                        />
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Catatan / Deskripsi</label>
                    <textarea
                      name="deskripsi"
                      rows="3"
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none resize-none"
                      placeholder="Tambahkan detail agenda..."
                    ></textarea>
                  </div>

                  {/* Peserta */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Undang Peserta</label>
                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={userSearchQuery}
                          onChange={handleUserSearchChange}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all text-sm pl-10"
                          placeholder="Cari peserta..."
                        />
                        <svg
                          className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>

                      {filteredUsers.length > 0 && (
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={handleSelectAll}
                            className="text-gray-900 hover:text-gray-700 text-xs font-medium transition-colors"
                          >
                            {getSelectedFilteredCount() === filteredUsers.length
                              ? "Batal pilih semua"
                              : "Pilih semua"}
                          </button>
                          <span className="text-gray-500 text-xs">
                            {getSelectedFilteredCount()} dari {filteredUsers.length} terpilih
                          </span>
                        </div>
                      )}

                      <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
                        {filteredUsers.length === 0 ? (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            {userSearchQuery ? "Tidak ada peserta yang cocok" : "Tidak ada peserta tersedia"}
                          </div>
                        ) : (
                          filteredUsers.map(user => (
                            <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.invited_users.includes(user.id)}
                                onChange={() => handleUserInvite(user.id)}
                                className="w-4 h-4 text-gray-900 bg-gray-50 border-gray-300 rounded focus:ring-gray-900"
                              />
                              <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-gray-600 font-medium text-sm">
                                    {user.nama?.charAt(0) || user.mpk?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-gray-800 font-medium text-sm truncate">{user.nama}</p>
                                  <p className="text-gray-500 text-xs truncate">
                                    {user.unit_kerja} • {user.mpk}
                                  </p>
                                </div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>

                      {formData.invited_users.length > 0 && (
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1.5">Pesan Undangan</label>
                          <textarea
                            name="pesan_undangan"
                            value={formData.pesan_undangan}
                            onChange={handleInputChange}
                            className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none resize-none"
                            placeholder="Tulis pesan undangan untuk peserta..."
                            rows="2"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  form="rapatForm"
                  className="px-4 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                >
                  {modalMode === 'add' ? 'Simpan Jadwal' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DETAIL MODAL */}
        {showDetailModal && selectedRapatDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{selectedRapatDetail.nama_rapat}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase ${selectedRapatDetail.jenis === 'online' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {selectedRapatDetail.jenis}
                      </span>
                    </div>
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
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" x2="16" y1="2" y2="6" />
                        <line x1="8" x2="8" y1="2" y2="6" />
                        <line x1="3" x2="21" y1="10" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Waktu</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">
                        {new Date(selectedRapatDetail.tanggal).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })} • {selectedRapatDetail.waktu_mulai} - {selectedRapatDetail.waktu_selesai}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                    <div className="mt-0.5 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Lokasi</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">
                        {selectedRapatDetail.jenis === 'offline' ? getRuanganName(selectedRapatDetail) : (
                          <a href={selectedRapatDetail.link_rapat} className="text-blue-600 hover:underline break-all">
                            {selectedRapatDetail.link_rapat || "-"}
                          </a>
                        )}
                      </p>
                    </div>
                  </div>
                  {selectedRapatDetail.deskripsi && (
                    <div className="p-1">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Deskripsi</p>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedRapatDetail.deskripsi}</p>
                    </div>
                  )}
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
                    handleOpenModal('edit', selectedRapatDetail);
                  }}
                  className="flex-1 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 shadow-sm transition-colors"
                >
                  Edit Agenda
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
