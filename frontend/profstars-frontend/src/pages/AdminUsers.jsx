import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/AdminUsers.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  // ✅ Memoized loader
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ✅ Approve / Reject / Delete
  const handleAction = async (id, action) => {
    try {
      const endpoint =
        action === "approve"
          ? `/approve/${id}`
          : action === "reject"
          ? `/reject/${id}`
          : `/delete/${id}`;

      await axios.put(`http://localhost:5000/api/admin${endpoint}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`User ${action}d successfully`);
      loadUsers();
    } catch (err) {
      console.error("❌ Action failed:", err);
      toast.error("Operation failed");
    }
  };

  const filtered =
    filter === "all" ? users : users.filter((u) => u.role === filter);

  return (
    <div className="admin-users">
      <ToastContainer position="top-right" autoClose={2000} />
      <h1>👥 User Management</h1>

      <div className="filters">
        <label>Filter By Role:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Users</option>
          <option value="student">Students</option>
          <option value="professor">Professors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <p className="loading">Loading users...</p>
      ) : filtered.length === 0 ? (
        <p className="no-users">No users found.</p>
      ) : (
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td className={`role-${u.role}`}>{u.role}</td>
                <td>{u.role === "professor" ? (u.isApproved ? "✅ Approved" : "🕒 Pending") : "—"}</td>
                <td>
                  {u.role === "professor" && !u.isApproved && (
                    <>
                      <button
                        className="approve-btn"
                        onClick={() => handleAction(u._id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleAction(u._id, "reject")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {u.role !== "admin" && (
                    <button
                      className="delete-btn"
                      onClick={() => handleAction(u._id, "delete")}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUsers;
