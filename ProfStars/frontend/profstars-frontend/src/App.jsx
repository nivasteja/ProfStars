import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";

import Home from "./pages/Home";
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

  // ✅ Sync authentication across tabs and instant updates
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

  return (
    <Router>
      {/* Navbar - hidden for admin layout */}
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

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            isAuth && role === "admin" ? (
              <AdminLayout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="approvals" element={<AdminDashboard />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* Professor Dashboard */}
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

        {/* Student Dashboard + Professor Details */}
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
          path="/professor/:id"
          element={
            isAuth && role === "student" ? (
              <ProfessorDetails />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 fallback */}
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
