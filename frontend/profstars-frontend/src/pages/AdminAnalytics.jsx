import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "../styles/AdminAnalytics.css";

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const token = localStorage.getItem("token");

  // ✅ Fetch analytics data
  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/analytics/summary",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data);
    } catch (error) {
      console.error("❌ Failed to load analytics:", error);
    }
  }, [token]);

  // ✅ Load once when mounted
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!data)
    return (
      <p style={{ textAlign: "center", marginTop: "40px" }}>
        Loading analytics...
      </p>
    );

  return (
    <div className="admin-analytics">
      <h1>📊 Admin Analytics Dashboard</h1>

      {/* ===== Cards Summary ===== */}
      <div className="cards">
        <div className="card">
          <h3>Total Professors</h3>
          <p>{data.totalProfessors}</p>
        </div>
        <div className="card">
          <h3>Approved Professors</h3>
          <p>{data.approvedProfessors}</p>
        </div>
        <div className="card">
          <h3>Pending Professors</h3>
          <p>{data.pendingProfessors}</p>
        </div>
        <div className="card">
          <h3>Student-Added Professors</h3>
          <p>{data.studentAdded}</p>
        </div>
        <div className="card">
          <h3>Total Students</h3>
          <p>{data.totalStudents}</p>
        </div>
        <div className="card">
          <h3>Total Admins</h3>
          <p>{data.totalAdmins}</p>
        </div>
        <div className="card">
          <h3>⭐ Average Rating</h3>
          <p>{data.avgRating}</p>
        </div>
      </div>

      {/* ===== Bar Chart: Top Universities ===== */}
      <h2>🏫 Top 5 Universities by Approved Professors</h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data.topUniversities.map((u) => ({
            name: u._id || "Unknown",
            count: u.count,
          }))}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminAnalytics;
