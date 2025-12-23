import { useState, useEffect } from "react";
import axios from "../api/axiosClient";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import SidebarLayout from "../components/SidebarLayout";

export default function User() {
    const [userList, setUserList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedUserDetail, setSelectedUserDetail] = useState(null);
    const [modalMode, setModalMode] = useState("add");
    const [selectedUser, setSelectedUser] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const itemsPerPage = 6;

    // State untuk validasi form
    const [formErrors, setFormErrors] = useState({
        npk: "",
        nama: "",
        email: "",
        unit_kerja: "",
        no_telp: "",
        password: "",
        role: ""
    });

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

    const [userForm, setUserForm] = useState({
        npk: "",
        nama: "",
        email: "",
        unit_kerja: "",
        no_telp: "",
        password: "",
        role: "user"
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

    // Filter & Pagination logic
    const filteredList = userList.filter(u =>
        u.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.npk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.unit_kerja.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalPages = Math.ceil(filteredList.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUserList = filteredList.slice(indexOfFirstItem, indexOfLastItem);

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
        setTimeout(() => {
            removeToast(id);
        }, 3000);
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

    // Fungsi validasi form
    const validateForm = () => {
        const errors = {
            npk: "",
            nama: "",
            email: "",
            unit_kerja: "",
            no_telp: "",
            password: "",
            role: ""
        };

        let isValid = true;

        // Validasi NPK
        if (!userForm.npk.trim()) {
            errors.npk = "NPK harus diisi";
            isValid = false;
            addToast("NPK harus diisi", "error");
        }

        // Validasi Nama
        if (!userForm.nama.trim()) {
            errors.nama = "Nama harus diisi";
            isValid = false;
            addToast("Nama harus diisi", "error");
        }

        // Validasi Email
        if (!userForm.email.trim()) {
            errors.email = "Email harus diisi";
            isValid = false;
            addToast("Email harus diisi", "error");
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
            errors.email = "Format email tidak valid";
            isValid = false;
            addToast("Format email tidak valid", "error");
        }

        // Validasi Unit Kerja
        if (!userForm.unit_kerja.trim()) {
            errors.unit_kerja = "Unit kerja harus diisi";
            isValid = false;
            addToast("Unit kerja harus diisi", "error");
        }

        // Validasi No. Telepon
        if (!userForm.no_telp.trim()) {
            errors.no_telp = "No. telepon harus diisi";
            isValid = false;
            addToast("No. telepon harus diisi", "error");
        } else if (!/^[0-9+\-\s()]+$/.test(userForm.no_telp)) {
            errors.no_telp = "Format nomor telepon tidak valid";
            isValid = false;
            addToast("Format nomor telepon tidak valid", "error");
        }

        // Validasi Password
        if (modalMode === "add") {
            if (!userForm.password) {
                errors.password = "Password harus diisi";
                isValid = false;
                addToast("Password harus diisi", "error");
            } else if (userForm.password.length < 8) {
                errors.password = "Password minimal 8 karakter";
                isValid = false;
                addToast("Password minimal 8 karakter", "error");
            }
        } else if (modalMode === "edit" && userForm.password && userForm.password.length < 8) {
            errors.password = "Password minimal 8 karakter";
            isValid = false;
            addToast("Password minimal 8 karakter", "error");
        }

        setFormErrors(errors);
        return isValid;
    };

    useEffect(() => {
        fetchUserList();
    }, []);

    const fetchUserList = async () => {
        try {
            const res = await axios.get("/users");
            const data = res.data?.data || res.data || [];
            setUserList(Array.isArray(data) ? data : []);
            setCurrentPage(1); // Reset ke halaman pertama saat fetch data
        } catch (err) {
            console.error("Gagal memuat data user:", err);
            setUserList([]);
            addToast("Gagal memuat data user", "error");
        }
    };

    const handleOpenDetailModal = (userData) => {
        setSelectedUserDetail(userData);
        setShowDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setShowDetailModal(false);
        setSelectedUserDetail(null);
    };

    const handleOpenModal = (mode, userData = null) => {
        setModalMode(mode);
        // Reset errors saat membuka modal
        setFormErrors({
            npk: "",
            nama: "",
            email: "",
            unit_kerja: "",
            no_telp: "",
            password: "",
            role: ""
        });

        if (mode === "edit" && userData) {
            setSelectedUser(userData);
            setUserForm({
                npk: userData.npk || "",
                nama: userData.nama || "",
                email: userData.email || "",
                unit_kerja: userData.unit_kerja || "",
                no_telp: userData.no_telp || "",
                password: "",
                role: userData.role || "user"
            });
        } else {
            setUserForm({
                npk: "",
                nama: "",
                email: "",
                unit_kerja: "",
                no_telp: "",
                password: "",
                role: "user"
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setUserForm({
            npk: "",
            nama: "",
            email: "",
            unit_kerja: "",
            no_telp: "",
            password: "",
            role: "user"
        });
        setFormErrors({
            npk: "",
            nama: "",
            email: "",
            unit_kerja: "",
            no_telp: "",
            password: "",
            role: ""
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserForm({
            ...userForm,
            [name]: value,
        });

        // Reset error untuk field yang sedang diisi
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ""
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi form sebelum submit
        if (!validateForm()) {
            return; // Stop jika validasi gagal
        }

        try {
            const userDataToSubmit = { ...userForm };
            if (modalMode === "edit" && !userDataToSubmit.password) {
                delete userDataToSubmit.password;
            }

            if (modalMode === "add") {
                await axios.post("/users", userDataToSubmit);
                addToast("User berhasil ditambahkan", "success");
            } else {
                await axios.put(`/users/${selectedUser.id}`, userDataToSubmit);
                addToast("User berhasil diupdate", "success");
            }
            handleCloseModal();
            fetchUserList();
        } catch (err) {
            addToast("Gagal menyimpan data user", "error");
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        showConfirmModal({
            title: "Hapus User",
            message: "Yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.",
            onConfirm: async () => {
                try {
                    await axios.delete(`/users/${id}`);
                    addToast("User berhasil dihapus", "success");
                    fetchUserList();
                    closeConfirmModal();
                } catch (err) {
                    addToast("Gagal menghapus user", "error");
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
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Data User</h1>
                        <p className="text-gray-500 text-sm max-w-xl">
                            Kelola pengguna sistem dan hak akses mereka.
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
                                placeholder="Cari user..."
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
                            Tambah User
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-xs uppercase tracking-wider">NPK</th>
                                    <th className="px-6 py-3 text-xs uppercase tracking-wider">Nama</th>
                                    <th className="px-6 py-3 text-xs uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-xs uppercase tracking-wider">Unit Kerja</th>
                                    <th className="px-6 py-3 text-xs uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-xs uppercase tracking-wider text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {!userList || currentUserList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <div className="bg-gray-50 p-3 rounded-full mb-3">
                                                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">Belum ada data</span>
                                                <span className="text-xs text-gray-500 mt-1">
                                                    {searchQuery ? "Tidak ada user yang cocok dengan pencarian" : "Mulai dengan menambahkan user baru."}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentUserList.map((userData) => (
                                        <tr key={userData.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-medium text-gray-900">{userData.npk}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <span className="text-white text-xs font-semibold">
                                                            {userData.nama ? userData.nama.charAt(0).toUpperCase() : 'U'}
                                                        </span>
                                                    </div>
                                                    <span className="font-medium text-gray-900">{userData.nama}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                                    </svg>
                                                    <span className="text-gray-700">{userData.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                                                    </svg>
                                                    <span className="text-gray-700">{userData.unit_kerja}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${userData.role === "admin"
                                                            ? "bg-purple-50 text-purple-700 border-purple-200"
                                                            : "bg-blue-50 text-blue-700 border-blue-200"
                                                        }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${userData.role === "admin" ? "bg-purple-500" : "bg-blue-500"
                                                        }`}></div>
                                                    {userData.role === "admin" ? "Admin" : "User"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleOpenDetailModal(userData)}
                                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-all"
                                                        title="Lihat Detail"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleOpenModal("edit", userData)}
                                                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-all"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(userData.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                                        title="Hapus"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                            <path d="M3 6h18" />
                                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
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
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col border border-gray-200 max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">
                                        {modalMode === "add" ? "Tambah User" : "Edit User"}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">Lengkapi informasi user.</p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                        <path d="M18 6 6 18" />
                                        <path d="m6 6 12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* NPK */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">NPK</label>
                                    <input
                                        type="text"
                                        name="npk"
                                        value={userForm.npk}
                                        onChange={handleInputChange}
                                        className={`block w-full rounded-lg border ${formErrors.npk ? "border-red-300" : "border-gray-200"
                                            } px-3 py-2.5 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400 bg-gray-50 focus:bg-white`}
                                        placeholder="Masukkan NPK"
                                        required
                                    />
                                    {formErrors.npk && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.npk}</p>
                                    )}
                                </div>

                                {/* Nama */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Nama</label>
                                    <input
                                        type="text"
                                        name="nama"
                                        value={userForm.nama}
                                        onChange={handleInputChange}
                                        className={`block w-full rounded-lg border ${formErrors.nama ? "border-red-300" : "border-gray-200"
                                            } px-3 py-2.5 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400 bg-gray-50 focus:bg-white`}
                                        placeholder="Masukkan nama"
                                        required
                                    />
                                    {formErrors.nama && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.nama}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={userForm.email}
                                        onChange={handleInputChange}
                                        className={`block w-full rounded-lg border ${formErrors.email ? "border-red-300" : "border-gray-200"
                                            } px-3 py-2.5 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400 bg-gray-50 focus:bg-white`}
                                        placeholder="Masukkan email"
                                        required
                                    />
                                    {formErrors.email && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                                    )}
                                </div>

                                {/* Unit Kerja */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Unit Kerja</label>
                                    <input
                                        type="text"
                                        name="unit_kerja"
                                        value={userForm.unit_kerja}
                                        onChange={handleInputChange}
                                        className={`block w-full rounded-lg border ${formErrors.unit_kerja ? "border-red-300" : "border-gray-200"
                                            } px-3 py-2.5 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400 bg-gray-50 focus:bg-white`}
                                        placeholder="Masukkan unit kerja"
                                        required
                                    />
                                    {formErrors.unit_kerja && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.unit_kerja}</p>
                                    )}
                                </div>

                                {/* No. Telepon */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">No. Telepon</label>
                                    <input
                                        type="text"
                                        name="no_telp"
                                        value={userForm.no_telp}
                                        onChange={handleInputChange}
                                        className={`block w-full rounded-lg border ${formErrors.no_telp ? "border-red-300" : "border-gray-200"
                                            } px-3 py-2.5 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400 bg-gray-50 focus:bg-white`}
                                        placeholder="Masukkan nomor telepon"
                                        required
                                    />
                                    {formErrors.no_telp && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.no_telp}</p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                                        Password {modalMode === "edit" && "(Kosongkan jika tidak ingin mengubah)"}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={userForm.password}
                                        onChange={handleInputChange}
                                        className={`block w-full rounded-lg border ${formErrors.password ? "border-red-300" : "border-gray-200"
                                            } px-3 py-2.5 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all placeholder-gray-400 bg-gray-50 focus:bg-white`}
                                        placeholder="Masukkan password"
                                        required={modalMode === "add"}
                                    />
                                    {formErrors.password && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
                                    )}
                                    {modalMode === "add" && (
                                        <p className="text-xs text-gray-500 mt-1">Password minimal 8 karakter</p>
                                    )}
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Role</label>
                                    <select
                                        name="role"
                                        value={userForm.role}
                                        onChange={handleInputChange}
                                        className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all bg-gray-50 focus:bg-white"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                                    >
                                        {modalMode === 'add' ? 'Simpan' : 'Update'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* DETAIL MODAL */}
                {showDetailModal && selectedUserDetail && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm transition-opacity">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-gray-200">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight">Detail User</h3>
                                    </div>
                                    <button
                                        onClick={handleCloseDetailModal}
                                        className="text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <path d="M18 6 6 18" />
                                            <path d="m6 6 12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Avatar & Nama */}
                                    <div className="flex items-start gap-3 p-4 bg-blue-50/80 rounded-xl border border-blue-100">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-lg font-semibold">
                                                {selectedUserDetail.nama ? selectedUserDetail.nama.charAt(0).toUpperCase() : 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Nama User</p>
                                            <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedUserDetail.nama}</p>
                                        </div>
                                    </div>

                                    {/* NPK & Role */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="flex items-start gap-2 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                                            <div className="mt-0.5 text-gray-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">NPK</p>
                                                <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedUserDetail.npk}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-2 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                                            <div className="mt-0.5 text-gray-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Role</p>
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${selectedUserDetail.role === "admin"
                                                            ? "bg-purple-50 text-purple-700 border-purple-200"
                                                            : "bg-blue-50 text-blue-700 border-blue-200"
                                                        }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedUserDetail.role === "admin" ? "bg-purple-500" : "bg-blue-500"
                                                        }`}></div>
                                                    {selectedUserDetail.role === "admin" ? "Admin" : "User"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="flex items-start gap-3 p-3 bg-gray-50/80 rounded-xl border border-gray-100">
                                        <div className="mt-0.5 text-gray-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                                            <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedUserDetail.email}</p>
                                        </div>
                                    </div>

                                    {/* Unit Kerja */}
                                    <div className="flex items-start gap-3 p-3 bg-green-50/80 rounded-xl border border-green-100">
                                        <div className="mt-0.5 text-green-500">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-green-400 uppercase tracking-wider">Unit Kerja</p>
                                            <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedUserDetail.unit_kerja}</p>
                                        </div>
                                    </div>

                                    {/* No. Telepon */}
                                    {selectedUserDetail.no_telp && (
                                        <div className="flex items-start gap-3 p-3 bg-purple-50/80 rounded-xl border border-purple-100">
                                            <div className="mt-0.5 text-purple-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">No. Telepon</p>
                                                <p className="text-sm font-medium text-gray-900 mt-0.5">{selectedUserDetail.no_telp}</p>
                                            </div>
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
                                        handleOpenModal("edit", selectedUserDetail);
                                    }}
                                    className="flex-1 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 shadow-sm transition-colors"
                                >
                                    Edit User
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}
