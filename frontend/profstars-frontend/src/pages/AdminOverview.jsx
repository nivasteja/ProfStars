import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "../styles/AdminOverview.css";

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const token = localStorage.getItem("token");

  const fetchSummary = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/analytics/summary",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data);
    } catch (error) {
      console.error("Failed to load admin overview:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (!data)
    return (
      <div className="overview-loading">
        <h3>Loading Overview...</h3>
      </div>
    );

  // Transform chart data
  const profChartData = [
    { name: "Approved", value: data.approvedProfessors },
    { name: "Pending", value: data.pendingProfessors },
    { name: "Student-Added", value: data.studentAdded },
  ];

  const uniChartData = data.topUniversities.map((u) => ({
    name: u._id || "Unknown",
    value: u.count,
  }));

  return (
    <div className="admin-overview">
      <h1>📊 Admin Overview</h1>
      <p className="overview-subtext">
        Quick snapshot of ProfStars platform performance.
      </p>

      <div className="overview-cards">
        <div className="card">
          <h3>Total Professors</h3>
          <p>{data.totalProfessors}</p>
        </div>
        <div className="card">
          <h3>Approved</h3>
          <p>{data.approvedProfessors}</p>
        </div>
        <div className="card">
          <h3>Pending</h3>
          <p>{data.pendingProfessors}</p>
        </div>
        <div className="card">
          <h3>Students</h3>
          <p>{data.totalStudents}</p>
        </div>
        <div className="card">
          <h3>⭐ Avg Rating</h3>
          <p>{data.avgRating}</p>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-box">
          <h2>Professor Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h2>Top 5 Universities</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={uniChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#7c3aed" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
