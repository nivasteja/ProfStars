import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";
import logo from "./assets/logo.svg";

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      setIsAuth(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    setIsAuth(false);
    navigate("/"); // redirect to home page
  };

  return (
    <div>
      {/* ========================
          NAVBAR SECTION
      ======================== */}
      <nav className="navbar">
        {/* Left Side - Logo + Brand */}
        <div className="navbar-left">
          <Link to="/" className="nav-logo">
            <img src={logo} alt="ProfStars Logo" className="logo" />
            <span className="brand-name">ProfStars</span>
          </Link>
        </div>

        {/* Right Side - Navigation Links */}
        <div className="navbar-right">
          <Link to="/" className="nav-link">
            Home
          </Link>

          {!isAuth && (
            <>
              <Link to="/register" className="nav-link">
                Register
              </Link>
              <Link to="/login" className="nav-link">
                Login
              </Link>
            </>
          )}

          {isAuth && (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              {/* ✅ Show Logout when logged in */}
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ========================
          PAGE ROUTES
      ======================== */}
      <Routes>
        {/* Home Section */}
        <Route
          path="/"
          element={
            <div className="home-container">
              <img src={logo} alt="ProfStars Logo" className="logo" />
              <h1 className="home-title">Welcome to ProfStars</h1>
              <p className="home-subtitle">
                Empower your academic journey — connect with top professors and
                mentors today.
              </p>
              {!isAuth && (
                <Link to="/register" className="primary-btn">
                  Get Started
                </Link>
              )}
            </div>
          }
        />

        {/* Register */}
        <Route
          path="/register"
          element={!isAuth ? <Register /> : <Navigate to="/dashboard" />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={!isAuth ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={isAuth ? <Dashboard /> : <Navigate to="/login" />}
        />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
