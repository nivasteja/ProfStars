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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import "../styles/AdminAnalytics.css";

const COLORS = ["#6a0dad", "#9b4de3", "#cda4ff", "#4f46e5", "#818cf8"];

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const token = localStorage.getItem("token");

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/admin/analytics/summary",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data);
    } catch (error) {
      console.error("❌ Analytics fetch failed:", error);
    }
  }, [token]);

  // Initial + auto-refresh
  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  if (!data)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>
        Loading analytics...
      </p>
    );

  // Transform DB data
  const topUniversities =
    data?.topUniversities?.map((u) => ({
      name: u._id || "Unknown",
      count: u.count,
    })) || [];

  const ratingTrend =
    data?.ratingTrends?.map((r) => ({
      date: r._id,
      avg: r.avgRating,
    })) || [];

  const roleDistribution = [
    { name: "Admins", value: data.totalAdmins },
    { name: "Professors", value: data.totalProfessors },
    { name: "Students", value: data.totalStudents },
  ];

  return (
    <div className="admin-analytics">
      <h1>Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div className="analytics-cards">
        <div className="a-card purple">
          <h3>Total Professors</h3>
          <p>{data.totalProfessors}</p>
        </div>
        <div className="a-card green">
          <h3>Approved</h3>
          <p>{data.approvedProfessors}</p>
        </div>
        <div className="a-card yellow">
          <h3>Pending</h3>
          <p>{data.pendingProfessors}</p>
        </div>
        <div className="a-card blue">
          <h3>Students</h3>
          <p>{data.totalStudents}</p>
        </div>
        <div className="a-card pink">
          <h3>Average Rating</h3>
          <p>{data.avgRating}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Bar: Top Universities */}
        <div className="chart-card">
          <h2>Top 5 Universities</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topUniversities}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#6a0dad" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie: Role Distribution */}
        <div className="chart-card">
          <h2>User Role Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {roleDistribution.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line: Rating Trends */}
        <div className="chart-card full">
          <h2>Average Rating Trend</h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={ratingTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avg"
                stroke="#6a0dad"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
