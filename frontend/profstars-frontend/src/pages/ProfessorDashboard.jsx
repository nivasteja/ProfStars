import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "../styles/ProfessorDashboard.css";

const ProfessorDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [countries, setCountries] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loadingUni, setLoadingUni] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState({
    subjectName: "",
    description: "",
  });
  const [analytics, setAnalytics] = useState(null);
  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const loadProfile = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/professor/me",
        axiosConfig
      );
      setProfile(res.data);
      setEditData(res.data);
      if (res.data.country) {
        loadUniversities(res.data.country);
      }
    } catch (err) {
      toast.error("Failed to load profile");
      console.error(err);
    }
  }, []);

  const loadCountries = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/universities/countries"
      );
      setCountries(res.data);
    } catch {
      toast.error("Failed to load countries");
    }
  };

  const loadUniversities = async (country) => {
    if (!country) return;
    setLoadingUni(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/universities/${encodeURIComponent(country)}`
      );
      setUniversities(res.data);
    } catch {
      toast.error("Failed to load universities");
    } finally {
      setLoadingUni(false);
    }
  };

  const loadReviews = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/professor/my-reviews",
        axiosConfig
      );
      setReviews(res.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadSubjects = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/professor/subjects",
        axiosConfig
      );
      setSubjects(res.data);
    } catch {
      toast.error("Failed to load subjects");
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/professor/my-reviews",
        axiosConfig
      );

      const allReviews = res.data || [];

      if (!Array.isArray(allReviews)) {
        throw new Error("Invalid reviews data");
      }

      const last10 = allReviews.slice(-10);

      const totalReviews = allReviews.length;
      const avgRating =
        allReviews.length > 0
          ? (
              allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
              allReviews.length
            ).toFixed(2)
          : "0.00";

      const chartData = last10
        .filter((review) => review && review.rating)
        .map((review, index) => ({
          index: index + 1,
          rating: review.rating,
        }));

      console.log("Analytics loaded:", {
        totalReviews,
        avgRating,
        chartDataLength: chartData.length,
      });

      setAnalytics({
        avgRating,
        totalReviews,
        chartData,
      });
    } catch (err) {
      console.error("Analytics error:", err);
      toast.error("Failed to load analytics");
      setAnalytics({
        avgRating: "0.00",
        totalReviews: 0,
        chartData: [],
      });
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadCountries();
    loadReviews();
    loadSubjects();
    loadAnalytics();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
    if (name === "country") {
      loadUniversities(value);
      setEditData({ ...editData, country: value, university: "" });
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "http://localhost:5000/api/professor/update",
        editData,
        axiosConfig
      );
      toast.success("Profile updated successfully");
      setIsEditing(false);
      loadProfile();
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const cancelEdit = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  const addSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.subjectName) return toast.warn("Subject name is required");
    try {
      await axios.post(
        "http://localhost:5000/api/professor/subjects",
        newSubject,
        axiosConfig
      );
      toast.success("Subject added successfully");
      setNewSubject({ subjectName: "", description: "" });
      loadSubjects();
    } catch {
      toast.error("Failed to add subject");
    }
  };

  const deleteSubject = async (id) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/professor/subjects/${id}`,
        axiosConfig
      );
      toast.success("Subject deleted");
      loadSubjects();
    } catch {
      toast.error("Failed to delete subject");
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const rating = payload[0].value;
      return (
        <div className="custom-tooltip">
          <span>{"⭐".repeat(rating)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />

      <nav className="nav-tabs">
        {["profile", "reviews", "subjects", "analytics"].map((tab) => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <div className="content">
        {/* PROFILE */}
        {activeTab === "profile" && profile && (
          <div className="section">
            <div className="section-header">
              <h1>Profile</h1>
              {!isEditing && (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="profile-grid">
                <div className="field">
                  <label>Full Name</label>
                  <p>{profile.name || "—"}</p>
                </div>
                <div className="field">
                  <label>Email</label>
                  <p>{profile.email || "—"}</p>
                </div>
                <div className="field">
                  <label>Country</label>
                  <p>{profile.country || "—"}</p>
                </div>
                <div className="field">
                  <label>University</label>
                  <p>{profile.university || "—"}</p>
                </div>
                <div className="field">
                  <label>Department</label>
                  <p>{profile.department || "—"}</p>
                </div>
                <div className="field">
                  <label>Academic Title</label>
                  <p>{profile.academicTitle || "—"}</p>
                </div>
                <div className="field">
                  <label>Years of Experience</label>
                  <p>{profile.experienceYears || 0}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={saveProfile} className="form">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editData.name || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Country</label>
                    <select
                      name="country"
                      value={editData.country || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Country</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>University</label>
                    <select
                      name="university"
                      value={editData.university || ""}
                      onChange={handleChange}
                      disabled={!editData.country || loadingUni}
                    >
                      <option value="">
                        {loadingUni ? "Loading..." : "Select University"}
                      </option>
                      {universities.map((u, i) => (
                        <option key={i} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={editData.department || ""}
                      onChange={handleChange}
                      placeholder="e.g., Computer Science"
                    />
                  </div>

                  <div className="form-field">
                    <label>Academic Title</label>
                    <input
                      type="text"
                      name="academicTitle"
                      value={editData.academicTitle || ""}
                      onChange={handleChange}
                      placeholder="e.g., Professor"
                    />
                  </div>

                  <div className="form-field">
                    <label>Years of Experience</label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={editData.experienceYears || 0}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === "reviews" && (
          <div className="section">
            <h1>Reviews</h1>
            {reviews.length === 0 ? (
              <p className="empty">No reviews yet</p>
            ) : (
              <div className="reviews">
                {reviews.map((r) => (
                  <div key={r._id} className="review">
                    <div className="review-top">
                      <span className="reviewer">
                        {r.studentId?.name || "Anonymous"}
                      </span>
                      <span className="stars">
                        {"★".repeat(r.rating)}
                        {"☆".repeat(5 - r.rating)}
                      </span>
                    </div>
                    <p className="review-text">{r.comment}</p>
                    <span className="review-date">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUBJECTS */}
        {activeTab === "subjects" && (
          <div className="section">
            <h1>Subjects</h1>

            <form onSubmit={addSubject} className="subject-form">
              <input
                type="text"
                placeholder="Subject Name"
                value={newSubject.subjectName}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, subjectName: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newSubject.description}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, description: e.target.value })
                }
              />
              <button type="submit" className="btn-primary">
                Add
              </button>
            </form>

            {subjects.length === 0 ? (
              <p className="empty">No subjects added</p>
            ) : (
              <div className="subjects">
                {subjects.map((s) => (
                  <div key={s._id} className="subject">
                    <div>
                      <h3>{s.subjectName}</h3>
                      <p>{s.description || "No description"}</p>
                    </div>
                    <button
                      className="btn-delete"
                      onClick={() => deleteSubject(s._id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="section">
            <h1>Analytics</h1>

            {analytics ? (
              <>
                <div className="stats">
                  <div className="stat">
                    <span className="stat-value">{analytics.avgRating}</span>
                    <span className="stat-label">Average Rating</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{analytics.totalReviews}</span>
                    <span className="stat-label">Total Reviews</span>
                  </div>
                </div>

                {analytics.chartData && analytics.chartData.length > 0 ? (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={analytics.chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="index"
                          stroke="#9ca3af"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 5]}
                          ticks={[1, 2, 3, 4, 5]}
                          stroke="#9ca3af"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="rating"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6", r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="empty">No review data available yet</p>
                )}
              </>
            ) : (
              <p className="empty">Loading analytics...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorDashboard;
