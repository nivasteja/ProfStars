import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [tab, setTab] = useState("registered");
  const [registeredProfs, setRegisteredProfs] = useState([]);
  const [studentProfs, setStudentProfs] = useState([]);
  const token = localStorage.getItem("token");

  // ✅ Wrap fetchPending in useCallback to prevent lint warning
  const fetchPending = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/pending-professors", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const all = res.data;
      setRegisteredProfs(all.filter((p) => !p.email.includes("@pending.profstars.com")));
      setStudentProfs(all.filter((p) => p.email.includes("@pending.profstars.com")));
    } catch (error) {
      console.error("❌ Failed to fetch pending:", error);
      toast.error("Failed to load pending professors.");
    }
  }, [token]);

  // ✅ useEffect runs once with correct dependency
  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  // ✅ Approve or reject professor
  const handleAction = async (id, action) => {
    try {
      const url =
        action === "approve"
          ? `http://localhost:5000/api/admin/approve/${id}`
          : `http://localhost:5000/api/admin/reject/${id}`;

      const res = await axios.put(
        url,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message);
      fetchPending();
    } catch (error) {
      console.error("❌ Action failed:", error);
      toast.error("Action failed.");
    }
  };

  // ✅ Reusable table renderer
  const renderTable = (list) => (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>University</th>
          <th>Department</th>
          <th>Country</th>
          <th>Email</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {list.length === 0 ? (
          <tr>
            <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
              No pending professors.
            </td>
          </tr>
        ) : (
          list.map((prof) => (
            <tr key={prof._id}>
              <td>{prof.name}</td>
              <td>{prof.university || "-"}</td>
              <td>{prof.department || "-"}</td>
              <td>{prof.country || "-"}</td>
              <td>{prof.email}</td>
              <td>
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

      <div className="tabs">
        <button
          className={tab === "registered" ? "active" : ""}
          onClick={() => setTab("registered")}
        >
          Registered Professors
        </button>
        <button
          className={tab === "student" ? "active" : ""}
          onClick={() => setTab("student")}
        >
          Student-Submitted Professors
        </button>
      </div>

      <div className="tab-content">
        {tab === "registered" && renderTable(registeredProfs)}
        {tab === "student" && renderTable(studentProfs)}
      </div>
    </div>
  );
};

export default AdminDashboard;
