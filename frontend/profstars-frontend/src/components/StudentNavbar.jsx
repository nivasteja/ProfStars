import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/logo.svg";

const StudentNavbar = ({ activeTab, setActiveTab }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close mobile menu when navigating
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Brand */}
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="ProfStars Logo" className="logo-img" />
          <span className="logo-text">ProfStars</span>
        </Link>

        {/* Links */}
        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          <button
            className={`nav-link ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`nav-link ${
              activeTab === "add-professor" ? "active" : ""
            }`}
            onClick={() => setActiveTab("add-professor")}
          >
            Add Professor
          </button>
          <button className="nav-link btn-cta" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Hamburger Menu for Mobile */}
        <div
          className={`hamburger ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default StudentNavbar;
