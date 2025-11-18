// frontend/src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";

import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Explore from "./pages/Explore";
import AdminLogin from "./pages/AdminLogin";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDetails from "./pages/ProfessorDetails";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminOverview from "./pages/AdminOverview";
import AdminLayout from "./layouts/AdminLayout";
import "./App.css";

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const storedRole = localStorage.getItem("role");
      setIsAuth(!!token);
      setRole(storedRole);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuth(false);
    setRole(null);
  };

  // --- THIS IS THE FIX ---
  const location = useLocation();
  const path = location.pathname;

  // Hide on all admin routes
  const isAdminRoute = path.startsWith("/admin");
  // Hide ONLY on the main professor dashboard (path is exactly "/professor")
  const isProfessorDashboard = path === "/professor";

  const showNavbar = !isAdminRoute && !isProfessorDashboard;
  // --- END OF FIX ---

  return (
    <>
      {showNavbar && <Navbar isAuth={isAuth} onLogout={handleLogout} />}

      <Routes>
        {/* All your <Route> components go here... */}
        {/* ...they are all correct, no changes needed to them. */}

        {/* ---------- PUBLIC ROUTES ---------- */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />

        {/* ---------- LOGIN / REGISTER always accessible ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---------- AUTH-PROTECTED ROUTES ---------- */}
        <Route
          path="/dashboard"
          element={
            isAuth && role === "student" ? (
              <StudentDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/professor"
          element={
            isAuth && role === "professor" ? (
              <ProfessorDashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/professor/:id"
          element={
            isAuth ? <ProfessorDetails /> : <Navigate to="/login" replace />
          }
        />

        {/* ---------- ADMIN ROUTES ---------- */}
        <Route
          path="/admin-login"
          element={
            isAuth && role === "admin" ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLogin />
            )
          }
        />

        <Route
          path="/admin"
          element={
            isAuth && role === "admin" ? (
              <AdminLayout />
            ) : (
              <Navigate to="/admin-login" replace />
            )
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="approvals" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* ---------- 404 PAGE ---------- */}
        <Route
          path="*"
          element={
            <h2 style={{ textAlign: "center", marginTop: "50px" }}>
              404 — Page Not Found
            </h2>
          }
        />
      </Routes>
    </>
  );
}
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
