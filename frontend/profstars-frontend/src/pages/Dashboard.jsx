import { useEffect, useState } from "react";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate fetching user data (replace with your API call)
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("username");
    const role = localStorage.getItem("role");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    // Simulate slight delay to display animation properly
    setTimeout(() => {
      setUser({ name, role });
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="dashboard-container">
      {loading ? (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      ) : (
        <div className="dashboard-content fade-in">
          <header className="dashboard-header">
            <h1>Welcome, {user.name} 👋</h1>
            <p className="role-badge">
              Role: <span>{user.role.toUpperCase()}</span>
            </p>
          </header>

          <main className="dashboard-main">
            <div className="dashboard-card">
              <h3>Quick Stats</h3>
              <p>Projects: 5 | Reviews: 12 | Notifications: 3</p>
            </div>
            <div className="dashboard-card">
              <h3>Recent Activity</h3>
              <ul>
                <li>Rated Professor John ⭐⭐⭐⭐☆</li>
                <li>Viewed Top Rated Professors</li>
                <li>Updated Profile Information</li>
              </ul>
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
