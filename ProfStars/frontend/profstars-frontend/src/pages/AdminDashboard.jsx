import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [tab, setTab] = useState("pending");
  const [pendingProfs, setPendingProfs] = useState([]);
  const [approvedProfs, setApprovedProfs] = useState([]);
  const [studentProfs, setStudentProfs] = useState([]);
  const token = localStorage.getItem("token");

  // ✅ Fetch all professors (pending + approved)
  const fetchProfessors = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/pending-professors",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const all = res.data;

      // Split data into groups
      setPendingProfs(
        all.filter(
          (p) =>
            p.isApproved === false &&
            !p.email.includes("@pending.profstars.com")
        )
      );
      setApprovedProfs(all.filter((p) => p.isApproved === true));
      setStudentProfs(
        all.filter((p) => p.email.includes("@pending.profstars.com"))
      );
    } catch (error) {
      console.error("❌ Failed to fetch professors:", error);
      toast.error("Failed to load professor data.");
    }
  }, [token]);

  useEffect(() => {
    fetchProfessors();
  }, [fetchProfessors]);

  // ✅ Approve or reject professor
  const handleAction = async (id, action) => {
    try {
      const url =
        action === "approve"
          ? `http://localhost:5000/api/admin/approve/${id}`
          : `http://localhost:5000/api/admin/reject/${id}`;

      const method = action === "approve" ? axios.patch : axios.delete;

      const res = await method(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      fetchProfessors();
    } catch (error) {
      console.error("❌ Action failed:", error);
      toast.error("Action failed.");
    }
  };

  // ✅ Reusable table renderer
  const renderTable = (list, showActions = false) => (
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
              No professors found.
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
                <td>
                  <button
                    className="approve-btn"
                    onClick={() => handleAction(prof._id, "approve")}
                  >
                    ✅ Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleAction(prof._id, "reject")}
                  >
                    ❌ Reject
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
      <ToastContainer />
      <h1>Admin Dashboard</h1>

      {/* ✅ Tabs for different professor groups */}
      <div className="tabs">
        <button
          className={tab === "pending" ? "active" : ""}
          onClick={() => setTab("pending")}
        >
          Pending Professors
        </button>
        <button
          className={tab === "approved" ? "active" : ""}
          onClick={() => setTab("approved")}
        >
          Approved Professors
        </button>
        <button
          className={tab === "student" ? "active" : ""}
          onClick={() => setTab("student")}
        >
          Student-Submitted Professors
        </button>
      </div>

      {/* ✅ Render selected tab */}
      <div className="tab-content">
        {tab === "pending" && renderTable(pendingProfs, true)}
        {tab === "approved" && renderTable(approvedProfs)}
        {tab === "student" && renderTable(studentProfs, true)}
      </div>
    </div>
  );
};

export default AdminDashboard;
