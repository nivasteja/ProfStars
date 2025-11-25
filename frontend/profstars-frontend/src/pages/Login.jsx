import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Auth.css";

const Login = () => {
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
        "http://localhost:5000/api/auth/login",
        formData
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.name);

      window.dispatchEvent(new Event("storage"));

      toast.success(`Welcome back, ${res.data.name}!`, {
        position: "top-center",
      });

      setTimeout(() => {
        if (res.data.role === "professor") {
          navigate("/professor");
        } else {
          navigate("/dashboard");
        }
      }, 1200);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
        {
          position: "top-center",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#fff",
      }}
    >
      <div
        style={{
          background: "#333",
          minHeight: "60px",
          display: "block",
          visibility: "visible",
        }}
      >
        <Navbar />
      </div>

      <div className="auth-page" style={{ flex: 1, paddingTop: "20px" }}>
        <ToastContainer />
        <div className="auth-card">
          <h2>Welcome Back</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-field">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>

      <div
        style={{
          background: "#333",
          minHeight: "100px",
          display: "block",
          visibility: "visible",
        }}
      ></div>
      <Footer />
    </div>
  );
};

export default Login;
