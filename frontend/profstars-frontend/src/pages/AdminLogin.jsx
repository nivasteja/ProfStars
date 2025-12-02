import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Auth.css";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/admin-login",
        formData
      );

      // Store login details
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.name);

      // Trigger other tabs to re-sync
      window.dispatchEvent(new Event("storage"));

      toast.success(`Welcome back, ${res.data.name}!`, {
        position: "top-center",
      });

      // Navigate to admin dashboard
      setTimeout(() => {
        navigate("/admin");
      }, 1200);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Admin login failed. Invalid credentials.",
        {
          position: "top-center",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <ToastContainer />
      <div className="auth-card">
        <div className="admin-badge">
          <span>🔒</span>
          <h2>Admin Access</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <input
              type="email"
              name="email"
              placeholder="Admin Email Address"
              aria-label="admin email address"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-field">
            <input
              type="password"
              name="password"
              placeholder="Admin Password"
              aria-label="admin password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <button type="submit" disabled={loading} className="admin-btn">
            {loading ? "Authenticating..." : "Admin Login"}
          </button>
        </form>

        <p className="auth-link">
          Not an admin? <Link to="/login">Regular Login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
