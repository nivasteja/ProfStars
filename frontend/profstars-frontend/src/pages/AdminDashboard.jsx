import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [tab, setTab] = useState("pending");
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // ✅ Load professors by tab
  const fetchProfessors = useCallback(
    async (status = tab) => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/admin/professors?status=${status}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfessors(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch professors:", error);
        toast.error("Unable to load data.");
      } finally {
        setLoading(false);
      }
    },
    [token, tab]
  );

  useEffect(() => {
    fetchProfessors(tab);
  }, [tab, fetchProfessors]);

  // ✅ Approve or Reject professor
  const handleAction = async (id, action) => {
    try {
      const url =
        action === "approve"
          ? `http://localhost:5000/api/admin/professor/approve/${id}`
          : `http://localhost:5000/api/admin/professor/reject/${id}`;

      const res = await axios.put(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message);

      // --------------------------------------------------
      // REMOVE instantly from current tab (critical fix)
      // --------------------------------------------------
      setProfessors((prev) => prev.filter((p) => p._id !== id));

      // If admin is currently viewing APPROVED tab → reload it
      if (action === "approve" && tab === "approved") {
        fetchProfessors("approved");
      }
    } catch (error) {
      console.error("❌ Action failed:", error);
      toast.error("Operation failed.");
    }
  };

  // --------------------------------------------------
  // Dynamic Table Rendering
  // --------------------------------------------------
  const renderTable = (list, showActions) => (
    <table className="prof-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>University</th>
          <th>Department</th>
          <th>Country</th>
          {showActions && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {list.length === 0 ? (
          <tr>
            <td colSpan={showActions ? 6 : 5} className="empty-cell">
              No records found.
            </td>
          </tr>
        ) : (
          list.map((prof) => (
            <tr key={prof._id}>
              <td>{prof.name}</td>
              <td>{prof.email}</td>
              <td>{prof.university || "-"}</td>
              <td>{prof.department || "-"}</td>
              <td>{prof.country || "-"}</td>

              {showActions && (
                <td className="actions">
                  <button
                    className="approve-btn"
                    onClick={() => handleAction(prof._id, "approve")}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleAction(prof._id, "reject")}
                  >
                    Reject
                  </button>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  return (
    <div className="admin-dashboard">
      <ToastContainer position="bottom-right" />

      <h1 className="page-title">Professor Approvals</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={tab === "pending" ? "active" : ""}
          onClick={() => setTab("pending")}
        >
          Pending
        </button>

        <button
          className={tab === "approved" ? "active" : ""}
          onClick={() => setTab("approved")}
        >
          Approved
        </button>

        <button
          className={tab === "student-submitted" ? "active" : ""}
          onClick={() => setTab("student-submitted")}
        >
          Student Submitted
        </button>
      </div>

      {/* Content Loader */}
      {loading ? (
        <p className="loading">Loading professors...</p>
      ) : (
        <div className="tab-content">
          {tab === "pending" && renderTable(professors, true)}
          {tab === "approved" && renderTable(professors, false)}
          {tab === "student-submitted" && renderTable(professors, true)}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
