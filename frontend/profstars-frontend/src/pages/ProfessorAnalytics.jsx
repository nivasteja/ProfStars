import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "../styles/ProfessorAnalytics.css";

const ProfessorAnalytics = () => {
  const [data, setData] = useState(null);
  const token = localStorage.getItem("token");

  const loadData = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/professor/analytics/summary",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data);
    } catch (err) {
      console.error("Error loading professor analytics:", err);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!data) return <p className="loading">Loading analytics...</p>;

  const chartData = data.monthly.map((m) => ({
    month: `${m._id.month}/${m._id.year}`,
    avgRating: m.avgRating.toFixed(2),
    totalReviews: m.totalReviews,
  }));

  return (
    <div className="prof-analytics">
      <h1>My Performance Analytics</h1>

      <div className="analytics-cards">
        <div className="card">
          <h3>Average Rating</h3>
          <p>{data.avgRating}</p>
        </div>
        <div className="card">
          <h3>Total Reviews</h3>
          <p>{data.totalReviews}</p>
        </div>
      </div>

      <div className="charts">
        <div className="chart-box">
          <h2>Average Rating Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgRating"
                stroke="#4f46e5"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h2>Reviews Per Month</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalReviews" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProfessorAnalytics;
