import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiMenu, FiLogOut, FiX, FiBarChart2, FiCheckCircle, FiPieChart } from "react-icons/fi";
import "../styles/AdminLayout.css";

const AdminLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin-login");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div>
          <div className="sidebar-header">
            <h2>ProfStars</h2>
            <button className="close-btn" onClick={() => setMenuOpen(false)}>
              <FiX />
            </button>
          </div>

          <nav className="nav-links">
            <NavLink
              to="/admin"
              className={({ isActive }) => (isActive ? "active" : "")}
              end
            >
              <FiBarChart2 /> Overview
            </NavLink>

            <NavLink
              to="/admin/approvals"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FiCheckCircle /> Approvals
            </NavLink>

            <NavLink
              to="/admin/analytics"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <FiPieChart /> Analytics
            </NavLink>
          </nav>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut style={{ marginRight: "6px" }} /> Logout
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="content-area">
        <header className="admin-header">
          <h1 className="header-title">Admin Panel</h1>
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <FiMenu />
          </button>
        </header>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
