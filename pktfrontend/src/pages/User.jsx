import { useState, useEffect } from "react";
import axios from "../api/axiosClient";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

export default function User() {
  const [userList, setUserList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [modalMode, setModalMode] = useState("add");
  const [selectedUser, setSelectedUser] = useState(null);
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

  const [userForm, setUserForm] = useState({
    mpk: "",
    nama: "",
    email: "",
    unit_kerja: "",
    no_telp: "",
    password: "",
    role: "user"
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
    fetchUserList();
  }, []);

  const fetchUserList = async () => {
    try {
      const res = await axios.get("/users");
      const data = res.data?.data || res.data || [];
      setUserList(Array.isArray(data) ? data : []);
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
    if (mode === "edit" && userData) {
      setSelectedUser(userData);
      setUserForm({
        mpk: userData.mpk || "",
        nama: userData.nama || "",
        email: userData.email || "",
        unit_kerja: userData.unit_kerja || "",
        no_telp: userData.no_telp || "",
        password: "",
        role: userData.role || "user"
      });
    } else {
      setUserForm({
        mpk: "",
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
      mpk: "",
      nama: "",
      email: "",
      unit_kerja: "",
      no_telp: "",
      password: "",
      role: "user"
    });
  };

  const handleInputChange = (e) => {
    setUserForm({
      ...userForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          addToast("User berhasil dihapus", "error");
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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Data User</h2>
              <p className="text-gray-600">Kelola data user sistem</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleOpenModal("add")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl border border-blue-500 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Tambah User</span>
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">NPK</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Nama</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Email</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Unit Kerja</th>
                    <th className="px-6 py-4 text-left text-gray-700 font-semibold text-sm">Role</th>
                    <th className="px-6 py-4 text-center text-gray-700 font-semibold text-sm">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {!userList || userList.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-4 bg-blue-50 rounded-2xl">
                            <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600 font-medium text-lg mb-2">Belum ada data user</p>
                            <p className="text-gray-500 text-sm mb-4">Mulai dengan membuat user pertama Anda</p>
                            <button
                              onClick={() => handleOpenModal("add")}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 font-medium"
                            >
                              Buat User Pertama
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    userList.map((userData, index) => (
                      <tr
                        key={userData.id}
                        className={`transition-all duration-200 hover:bg-blue-50/50 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-gray-800 font-semibold text-sm">{userData.mpk}</p>
                              <p className="text-gray-500 text-xs mt-1">NPK</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-semibold">
                                  {userData.nama ? userData.nama.charAt(0).toUpperCase() : 'U'}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-800 font-semibold text-sm">{userData.nama}</p>
                              <p className="text-gray-500 text-xs mt-1">{userData.unit_kerja}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700 font-medium text-sm">{userData.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="text-gray-700 font-medium text-sm">{userData.unit_kerja}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center space-x-1 ${
                                userData.role === "admin"
                                  ? "bg-purple-100 text-purple-800 border-purple-200"
                                  : "bg-blue-100 text-blue-800 border-blue-200"
                              }`}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                userData.role === "admin" ? "bg-purple-500" : "bg-blue-500"
                              }`}></div>
                              <span>
                                {userData.role === "admin" ? "Admin" : "User"}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center space-x-1">
                            <button
                              onClick={() => handleOpenDetailModal(userData)}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                              title="Lihat Detail"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleOpenModal("edit", userData)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-105"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(userData.id)}
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

          {userList && userList.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <p className="text-gray-600 text-sm">
                  Menampilkan <span className="font-semibold">{userList.length}</span> user
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

      {/* Modal Detail User */}
      {showDetailModal && selectedUserDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Detail User</h3>
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
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">
                          {selectedUserDetail.nama ? selectedUserDetail.nama.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nama User</p>
                      <p className="font-semibold text-gray-800">{selectedUserDetail.nama}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">NPK</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span className="font-medium text-gray-800">{selectedUserDetail.mpk}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-600">Role</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          selectedUserDetail.role === "admin"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : "bg-blue-100 text-blue-800 border-blue-200"
                        }`}
                      >
                        {selectedUserDetail.role === "admin" ? "Admin" : "User"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Email</p>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-gray-800">{selectedUserDetail.email}</span>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-sm text-gray-600 mb-2">Unit Kerja</p>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="font-medium text-gray-800">{selectedUserDetail.unit_kerja}</span>
                  </div>
                </div>

                {selectedUserDetail.no_telp && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <p className="text-sm text-gray-600 mb-2">No. Telepon</p>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="font-medium text-gray-800">{selectedUserDetail.no_telp}</span>
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
                    handleOpenModal("edit", selectedUserDetail);
                  }}
                  className="flex-1 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 text-sm"
                >
                  Edit User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal User dengan Scroll */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {modalMode === "add" ? "Tambah User" : "Edit User"}
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
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">NPK</label>
                  <input
                    type="text"
                    name="mpk"
                    value={userForm.mpk}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="Masukkan NPK user"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Nama</label>
                  <input
                    type="text"
                    name="nama"
                    value={userForm.nama}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="Masukkan nama user"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={userForm.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="Masukkan email user"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Unit Kerja</label>
                  <input
                    type="text"
                    name="unit_kerja"
                    value={userForm.unit_kerja}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="Masukkan unit kerja"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">No. Telepon</label>
                  <input
                    type="text"
                    name="no_telp"
                    value={userForm.no_telp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="Masukkan nomor telepon"
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Password {modalMode === "edit" && "(kosongkan jika tidak ingin mengubah)"}</label>
                  <input
                    type="password"
                    name="password"
                    value={userForm.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                    placeholder="Masukkan password"
                    required={modalMode === "add"}
                  />
                </div>

                <div>
                  <label className="block text-gray-800 font-semibold mb-2 text-sm">Role</label>
                  <select
                    name="role"
                    value={userForm.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 text-sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
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

