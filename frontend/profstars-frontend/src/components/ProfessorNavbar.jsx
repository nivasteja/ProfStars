import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/Navbar.css";
import logo from "../assets/logo.svg";

const ProfessorNavbar = ({ activeTab, setActiveTab }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = ["profile", "reviews", "subjects", "analytics"];

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
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

        {/* Dashboard Tab Links */}
        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`nav-link nav-tab-btn ${
                activeTab === tab ? "active" : ""
              }`}
              onClick={() => {
                setActiveTab(tab);
                setMenuOpen(false);
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          <button
            className="nav-link btn-cta btn-logout"
            onClick={handleLogout}
          >
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

export default ProfessorNavbar;
