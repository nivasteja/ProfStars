import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import logo from "../assets/logo.svg";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when navigating
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

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
          <Link
            to="/"
            className={`nav-link ${
              location.pathname === "/" ? "active" : ""
            }`}
          >
            Home
          </Link>
          <Link
            to="/explore"
            className={`nav-link ${
              location.pathname === "/explore" ? "active" : ""
            }`}
          >
            Explore
          </Link>
          <Link
            to="/login"
            className={`nav-link ${
              location.pathname === "/login" ? "active" : ""
            }`}
          >
            Login
          </Link>
          <Link
            to="/register"
            className={`nav-link btn-cta ${
              location.pathname === "/register" ? "active-btn" : ""
            }`}
          >
            Get Started
          </Link>
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

export default Navbar;
