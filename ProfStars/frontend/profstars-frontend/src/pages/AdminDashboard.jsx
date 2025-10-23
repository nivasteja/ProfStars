import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch all pending professors
  const fetchProfessors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/pending-professors");
      setProfessors(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load pending professors.");
      setLoading(false);
    }
  };

  // Approve a professor
  const handleApprove = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/approve/${id}`);
      setProfessors(professors.filter((p) => p._id !== id));
      setMessage("✅ Professor approved successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to approve professor.");
    }
  };

  // Reject a professor
  const handleReject = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/reject/${id}`);
      setProfessors(professors.filter((p) => p._id !== id));
      setMessage("❌ Professor rejected and removed.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to reject professor.");
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

  if (loading) {
    return (
      <div className="admin-container">
        <h2>Loading pending professors...</h2>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      <p className="subtext">Manage professor approvals</p>

      {message && <p className="status-message">{message}</p>}

      {professors.length === 0 ? (
        <p className="no-professors">🎉 No pending professors at the moment!</p>
      ) : (
        <table className="professor-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>University</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {professors.map((prof) => (
              <tr key={prof._id}>
                <td>{prof.name}</td>
                <td>{prof.email}</td>
                <td>{prof.department || "N/A"}</td>
                <td>{prof.university || "N/A"}</td>
                <td className="action-buttons">
                  <button
                    className="approve-btn"
                    onClick={() => handleApprove(prof._id)}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleReject(prof._id)}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;
