import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import Rapat from "./pages/rapat";
import Undangan from "./pages/Undangan";
import Ruangan from "./pages/ruangan";
import User from "./pages/User";
import DetailRapat from "./pages/DetailRapat"; // Import komponen baru

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/rapat" element={
            <ProtectedRoute>
              <Rapat />
            </ProtectedRoute>
          } />
          {/* Route baru untuk detail rapat */}
          <Route path="/rapat/detail/:id" element={
            <ProtectedRoute>
              <DetailRapat />
            </ProtectedRoute>
          } />
          <Route path="/undangan" element={
            <ProtectedRoute>
              <Undangan />
            </ProtectedRoute>
          } />
          <Route path="/ruangan/list" element={
            <ProtectedRoute>
              <Ruangan />
            </ProtectedRoute>
          } />
          <Route path="/user" element={
            <ProtectedRoute>
              <User />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;