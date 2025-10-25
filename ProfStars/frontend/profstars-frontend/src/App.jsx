import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import { useState, useEffect } from "react";

// ====== Page Imports ======
import Home from "./pages/Home"; // 🏠 (to be created in Phase 9)
import Register from "./pages/Register";
import Login from "./pages/Login";
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

  // ✅ Sync authentication state across tabs
  useEffect(() => {
    const checkAuth = () => {
      setIsAuth(!!localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // ✅ Logout clears session
  const handleLogout = () => {
    localStorage.clear();
    setIsAuth(false);
    setRole(null);
  };

  return (
    <Router>
      {/* ✅ Global Navbar (Hidden for Admin pages) */}
      {role !== "admin" && (
        <nav className="navbar">
          <div className="navbar-left">
            <Link to="/" className="brand">
              ProfStars
            </Link>
          </div>
          <div className="navbar-right">
            {!isAuth ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            )}
          </div>
        </nav>
      )}

      {/* ✅ App Routes */}
      <Routes>
        {/* =============================
            PUBLIC / AUTH ROUTES
        ============================== */}
        <Route path="/" element={<Home />} /> {/* 🏠 Home page */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* =============================
            ADMIN ROUTES (Protected)
        ============================== */}
        <Route
          path="/admin"
          element={
            isAuth && role === "admin" ? (
              <AdminLayout />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          {/* Nested inside AdminLayout via <Outlet /> */}
          <Route index element={<AdminOverview />} /> {/* ✅ Default Admin Page */}
          <Route path="approvals" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* =============================
            PROFESSOR DASHBOARD
        ============================== */}
        <Route
          path="/professor"
          element={
            isAuth && role === "professor" ? (
              <ProfessorDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* =============================
            STUDENT DASHBOARD & DETAILS
        ============================== */}
        <Route
          path="/dashboard"
          element={
            isAuth && role === "student" ? (
              <StudentDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/professor/:id"
          element={
            isAuth && role === "student" ? (
              <ProfessorDetails />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* =============================
            FALLBACK (404)
        ============================== */}
        <Route
          path="*"
          element={
            <h2 style={{ textAlign: "center", marginTop: "50px" }}>
              404 — Page Not Found
            </h2>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
