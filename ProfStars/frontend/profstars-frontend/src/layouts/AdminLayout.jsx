import { Link, Outlet, useNavigate } from "react-router-dom";
import "../styles/AdminLayout.css";

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>ProfStars</h2>
        </div>
        <nav className="sidebar-links">
          <Link to="/admin/approvals">📋 Approvals</Link>
          <Link to="/admin/analytics">📊 Analytics</Link>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="topbar">
          <h1>Admin Panel</h1>
        </header>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
