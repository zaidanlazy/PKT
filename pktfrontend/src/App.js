import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/Dashboard";
import Rapat from "./pages/rapat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rapat" element={<Rapat />} />
      </Routes>
    </Router>
  );
}

export default App;
