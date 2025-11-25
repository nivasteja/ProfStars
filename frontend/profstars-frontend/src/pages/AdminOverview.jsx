// import { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import "../styles/AdminOverview.css";
// import {
//   FiUsers,
//   FiUserCheck,
//   FiUserPlus,
//   FiBook,
//   FiTrendingUp,
//   FiAward,
// } from "react-icons/fi";

// const AdminOverview = () => {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const token = localStorage.getItem("token");

//   const fetchStats = useCallback(async () => {
//     try {
//       const res = await axios.get(
//         "http://localhost:5000/api/admin/analytics/summary",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setStats(res.data);
//       setLoading(false);
//     } catch (error) {
//       console.error("❌ Failed to fetch overview stats:", error);
//       setLoading(false);
//     }
//   }, [token]);

//   useEffect(() => {
//     fetchStats();
//     const interval = setInterval(fetchStats, 30000); // Auto refresh every 30s
//     return () => clearInterval(interval);
//   }, [fetchStats]);

//   if (loading)
//     return (
//       <div className="overview-loading">
//         <p>Loading admin overview...</p>
//       </div>
//     );

//   if (!stats)
//     return (
//       <div className="overview-loading">
//         <p>Failed to load admin data.</p>
//       </div>
//     );

//   return (
//     <div className="admin-overview">
//       <h1>Admin Overview</h1>
//       <p className="subtitle">Quick snapshot of your platform performance</p>

//       <div className="overview-grid">
//         <div className="overview-card purple">
//           <FiUsers className="icon" />
//           <h3>Total Professors</h3>
//           <p>{stats.totalProfessors}</p>
//         </div>

//         <div className="overview-card green">
//           <FiUserCheck className="icon" />
//           <h3>Approved Professors</h3>
//           <p>{stats.approvedProfessors}</p>
//         </div>

//         <div className="overview-card orange">
//           <FiUserPlus className="icon" />
//           <h3>Pending Professors</h3>
//           <p>{stats.pendingProfessors}</p>
//         </div>

//         <div className="overview-card blue">
//           <FiBook className="icon" />
//           <h3>Total Students</h3>
//           <p>{stats.totalStudents}</p>
//         </div>

//         <div className="overview-card pink">
//           <FiTrendingUp className="icon" />
//           <h3>Average Rating</h3>
//           <p>{stats.avgRating}</p>
//         </div>

//         <div className="overview-card yellow">
//           <FiAward className="icon" />
//           <h3>Total Admins</h3>
//           <p>{stats.totalAdmins}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminOverview;

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/AdminOverview.css";
import {
  FiUsers,
  FiUserCheck,
  FiUserPlus,
  FiBook,
  FiTrendingUp,
  FiAward,
} from "react-icons/fi";

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchStats = useCallback(async () => {
    // ✅ Don’t call API if token missing
    if (!token || token === "null") {
      console.warn("⚠️ No valid token found, redirecting...");
      localStorage.clear();
      navigate("/admin-login");
      return;
    }

    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/analytics/summary",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(res.data);
      setLoading(false);
    } catch (error) {
      console.error("❌ Failed to fetch overview stats:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expired. Please log in again.");
        localStorage.clear();
        navigate("/admin-login");
      }
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // auto refresh
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading)
    return (
      <div className="overview-loading">
        <p>Loading admin overview...</p>
      </div>
    );

  if (!stats)
    return (
      <div className="overview-loading">
        <p>Failed to load admin data.</p>
      </div>
    );

  return (
    <div className="admin-overview">
      <h1>Admin Overview</h1>
      <p className="subtitle">Quick snapshot of your platform performance</p>

      <div className="overview-grid">
        <div className="overview-card purple">
          <FiUsers className="icon" />
          <h3>Total Professors</h3>
          <p>{stats.totalProfessors}</p>
        </div>

        <div className="overview-card green">
          <FiUserCheck className="icon" />
          <h3>Approved Professors</h3>
          <p>{stats.approvedProfessors}</p>
        </div>

        <div className="overview-card orange">
          <FiUserPlus className="icon" />
          <h3>Pending Professors</h3>
          <p>{stats.pendingProfessors}</p>
        </div>

        <div className="overview-card blue">
          <FiBook className="icon" />
          <h3>Total Students</h3>
          <p>{stats.totalStudents}</p>
        </div>

        <div className="overview-card pink">
          <FiTrendingUp className="icon" />
          <h3>Average Rating</h3>
          <p>{stats.avgRating}</p>
        </div>

        <div className="overview-card yellow">
          <FiAward className="icon" />
          <h3>Total Admins</h3>
          <p>{stats.totalAdmins}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
