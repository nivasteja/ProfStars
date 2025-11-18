import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
    courseCode: "",
    semester: "",
    category: "Other",
  });
  const [analytics, setAnalytics] = useState(null);
  const [reviewStats, setReviewStats] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);

  // Review filters and pagination
  const [reviewFilter, setReviewFilter] = useState("all");
  const [reviewSort, setReviewSort] = useState("newest");
  const [reviewSearch, setReviewSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6b7280"];

  const calculateProfileCompletion = (prof) => {
    if (!prof) return 0;
    const fields = [
      prof.name,
      prof.email,
      prof.country,
      prof.university,
      prof.department,
      prof.academicTitle,
      prof.experienceYears,
      prof.bio,
      prof.socialLinks?.linkedin,
      prof.socialLinks?.researchGate,
      prof.socialLinks?.googleScholar,
    ];
    const filled = fields.filter((f) => f && f !== "").length;
    return Math.round((filled / fields.length) * 100);
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

      setAnalytics({
        avgRating,
        totalReviews,
        chartData,
      });
    } catch (err) {
      console.error("Analytics error:", err);
      toast.error("Failed to load analytics");
    }
  }, []);

  const loadReviewStats = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/professor/review-stats",
        axiosConfig
      );
      setReviewStats(res.data);
    } catch (err) {
      console.error("Review stats error:", err);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadCountries();
    loadReviews();
    loadSubjects();
    loadAnalytics();
    loadReviewStats();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested socialLinks
    if (name.startsWith("socialLinks.")) {
      const field = name.split(".")[1];
      setEditData({
        ...editData,
        socialLinks: {
          ...editData.socialLinks,
          [field]: value,
        },
      });
      return;
    }

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
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
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
      setNewSubject({
        subjectName: "",
        description: "",
        courseCode: "",
        semester: "",
        category: "Other",
      });
      loadSubjects();
    } catch {
      toast.error("Failed to add subject");
    }
  };

  const updateSubject = async (e) => {
    e.preventDefault();
    if (!editingSubject) return;
    try {
      await axios.put(
        `http://localhost:5000/api/professor/subjects/${editingSubject._id}`,
        editingSubject,
        axiosConfig
      );
      toast.success("Subject updated successfully");
      setEditingSubject(null);
      loadSubjects();
    } catch {
      toast.error("Failed to update subject");
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

  // Filter and sort reviews
  const getFilteredReviews = () => {
    let filtered = [...reviews];

    if (reviewFilter !== "all") {
      filtered = filtered.filter((r) => r.rating === parseInt(reviewFilter));
    }

    if (reviewSearch) {
      filtered = filtered.filter((r) =>
        r.comment?.toLowerCase().includes(reviewSearch.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (reviewSort === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (reviewSort === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (reviewSort === "highest") return b.rating - a.rating;
      if (reviewSort === "lowest") return a.rating - b.rating;
      return 0;
    });

    return filtered;
  };

  const filteredReviews = getFilteredReviews();
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <span>{"⭐".repeat(payload[0].value)}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />

      {/* Navigation */}
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
        <button className="nav-tab btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <div className="content">
        {/* PROFILE TAB */}
        {activeTab === "profile" && profile && (
          <div className="section">
            {/* Profile Completion */}
            <div className="profile-completion">
              <div className="completion-header">
                <span className="completion-label">Profile Completion</span>
                <span className="completion-percentage">
                  {calculateProfileCompletion(profile)}%
                </span>
              </div>
              <div className="completion-bar">
                <div
                  className="completion-fill"
                  style={{ width: `${calculateProfileCompletion(profile)}%` }}
                />
              </div>
            </div>

            {/* Header */}
            <div className="section-header">
              <h1>Profile</h1>
              {!isEditing && (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  Edit
                </button>
              )}
            </div>

            {!isEditing ? (
              <div>
                {/* Stats Cards */}
                <div className="stats-grid">
                  <div className="stat-card stat-blue">
                    <div className="stat-value">
                      {analytics?.totalReviews || 0}
                    </div>
                    <div className="stat-label">Total Reviews</div>
                  </div>
                  <div className="stat-card stat-green">
                    <div className="stat-value">
                      {analytics?.avgRating || "0.0"}
                    </div>
                    <div className="stat-label">Average Rating</div>
                  </div>
                  <div className="stat-card stat-orange">
                    <div className="stat-value">{subjects.length}</div>
                    <div className="stat-label">Subjects Taught</div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="profile-grid">
                  {[
                    { label: "Full Name", value: profile.name },
                    { label: "Email", value: profile.email },
                    { label: "Country", value: profile.country },
                    { label: "University", value: profile.university },
                    { label: "Department", value: profile.department },
                    { label: "Academic Title", value: profile.academicTitle },
                    {
                      label: "Years of Experience",
                      value: profile.experienceYears || 0,
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="field">
                      <label>{label}</label>
                      <p>{value || "—"}</p>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="bio-section">
                    <label>Bio</label>
                    <p>{profile.bio}</p>
                  </div>
                )}

                {/* Social Links */}
                {(profile.socialLinks?.linkedin ||
                  profile.socialLinks?.researchGate ||
                  profile.socialLinks?.googleScholar) && (
                  <div className="social-links">
                    <label>Social Links</label>
                    <div className="social-buttons">
                      {profile.socialLinks.linkedin && (
                        <a
                          href={profile.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-btn linkedin"
                        >
                          LinkedIn
                        </a>
                      )}
                      {profile.socialLinks.researchGate && (
                        <a
                          href={profile.socialLinks.researchGate}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-btn researchgate"
                        >
                          ResearchGate
                        </a>
                      )}
                      {profile.socialLinks.googleScholar && (
                        <a
                          href={profile.socialLinks.googleScholar}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="social-btn scholar"
                        >
                          Google Scholar
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={saveProfile} className="profile-form">
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
                    />
                  </div>

                  <div className="form-field">
                    <label>Academic Title</label>
                    <input
                      type="text"
                      name="academicTitle"
                      value={editData.academicTitle || ""}
                      onChange={handleChange}
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

                {/* Bio */}
                <div className="form-field-full">
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={editData.bio || ""}
                    onChange={handleChange}
                    maxLength={500}
                    rows={4}
                    placeholder="Tell students about yourself..."
                  />
                  <div className="char-count">
                    {(editData.bio || "").length}/500
                  </div>
                </div>

                {/* Social Links */}
                <div className="form-field-full">
                  <label>Social Links (Optional)</label>
                  <div className="social-inputs">
                    <input
                      type="url"
                      name="socialLinks.linkedin"
                      value={editData.socialLinks?.linkedin || ""}
                      onChange={handleChange}
                      placeholder="LinkedIn: https://linkedin.com/in/yourprofile"
                    />
                    <input
                      type="url"
                      name="socialLinks.researchGate"
                      value={editData.socialLinks?.researchGate || ""}
                      onChange={handleChange}
                      placeholder="ResearchGate: https://researchgate.net/profile/yourprofile"
                    />
                    <input
                      type="url"
                      name="socialLinks.googleScholar"
                      value={editData.socialLinks?.googleScholar || ""}
                      onChange={handleChange}
                      placeholder="Google Scholar: https://scholar.google.com/citations?user=..."
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

        {/* REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="section">
            <h1>Reviews</h1>

            {/* Filters */}
            <div className="review-filters">
              <select
                value={reviewFilter}
                onChange={(e) => {
                  setReviewFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>

              <select
                value={reviewSort}
                onChange={(e) => setReviewSort(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>

              <input
                type="text"
                placeholder="Search reviews..."
                value={reviewSearch}
                onChange={(e) => {
                  setReviewSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>

            {/* Results info */}
            <div className="results-info">
              Showing {paginatedReviews.length} of {filteredReviews.length}{" "}
              reviews
            </div>

            {paginatedReviews.length === 0 ? (
              <p className="empty">
                {reviewSearch || reviewFilter !== "all"
                  ? "No reviews match your filters"
                  : "No reviews yet"}
              </p>
            ) : (
              <>
                <div className="reviews">
                  {paginatedReviews.map((r) => (
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
                        {new Date(r.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>

                    <span className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* SUBJECTS TAB */}
        {activeTab === "subjects" && (
          <div className="section">
            <h1>Subjects</h1>

            {/* Add/Edit Subject Form */}
            <form
              onSubmit={editingSubject ? updateSubject : addSubject}
              className="subject-form"
            >
              <div className="subject-form-grid">
                <div className="form-field">
                  <label>Subject Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Data Structures"
                    value={
                      editingSubject
                        ? editingSubject.subjectName
                        : newSubject.subjectName
                    }
                    onChange={(e) =>
                      editingSubject
                        ? setEditingSubject({
                            ...editingSubject,
                            subjectName: e.target.value,
                          })
                        : setNewSubject({
                            ...newSubject,
                            subjectName: e.target.value,
                          })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Description</label>
                  <input
                    type="text"
                    placeholder="Brief description..."
                    value={
                      editingSubject
                        ? editingSubject.description
                        : newSubject.description
                    }
                    onChange={(e) =>
                      editingSubject
                        ? setEditingSubject({
                            ...editingSubject,
                            description: e.target.value,
                          })
                        : setNewSubject({
                            ...newSubject,
                            description: e.target.value,
                          })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Course Code</label>
                  <input
                    type="text"
                    placeholder="CS101"
                    value={
                      editingSubject
                        ? editingSubject.courseCode
                        : newSubject.courseCode
                    }
                    onChange={(e) =>
                      editingSubject
                        ? setEditingSubject({
                            ...editingSubject,
                            courseCode: e.target.value,
                          })
                        : setNewSubject({
                            ...newSubject,
                            courseCode: e.target.value,
                          })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Semester</label>
                  <input
                    type="text"
                    placeholder="Fall 2024"
                    value={
                      editingSubject
                        ? editingSubject.semester
                        : newSubject.semester
                    }
                    onChange={(e) =>
                      editingSubject
                        ? setEditingSubject({
                            ...editingSubject,
                            semester: e.target.value,
                          })
                        : setNewSubject({
                            ...newSubject,
                            semester: e.target.value,
                          })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Category</label>
                  <select
                    value={
                      editingSubject
                        ? editingSubject.category
                        : newSubject.category
                    }
                    onChange={(e) =>
                      editingSubject
                        ? setEditingSubject({
                            ...editingSubject,
                            category: e.target.value,
                          })
                        : setNewSubject({
                            ...newSubject,
                            category: e.target.value,
                          })
                    }
                  >
                    <option value="Core">Core</option>
                    <option value="Elective">Elective</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-actions-inline">
                  <button type="submit" className="btn-primary">
                    {editingSubject ? "Update" : "Add"}
                  </button>
                  {editingSubject && (
                    <button
                      type="button"
                      onClick={() => setEditingSubject(null)}
                      className="btn-cancel-inline"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </form>

            {subjects.length === 0 ? (
              <p className="empty">No subjects added</p>
            ) : (
              <div className="subjects">
                {subjects.map((s) => (
                  <div
                    key={s._id}
                    className={`subject ${
                      editingSubject?._id === s._id ? "editing" : ""
                    }`}
                  >
                    <div className="subject-content">
                      <div className="subject-header">
                        <h3>{s.subjectName}</h3>
                        <div className="subject-badges">
                          {s.courseCode && (
                            <span className="badge badge-blue">
                              {s.courseCode}
                            </span>
                          )}
                          {s.category && s.category !== "Other" && (
                            <span className="badge badge-gray">
                              {s.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="subject-description">
                        {s.description || "No description"}
                      </p>
                      {s.semester && (
                        <p className="subject-semester">{s.semester}</p>
                      )}
                    </div>
                    <div className="subject-actions">
                      <button
                        onClick={() => setEditingSubject(s)}
                        className="btn-edit-subject"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteSubject(s._id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="section">
            <h1>Analytics</h1>

            {analytics ? (
              <>
                {/* Stats Cards */}
                <div className="analytics-stats">
                  <div className="stat-card-large stat-blue">
                    <div className="stat-value-large">
                      {analytics.avgRating}
                    </div>
                    <div className="stat-label-large">Average Rating</div>
                  </div>
                  <div className="stat-card-large stat-green">
                    <div className="stat-value-large">
                      {analytics.totalReviews}
                    </div>
                    <div className="stat-label-large">Total Reviews</div>
                  </div>
                </div>

                {/* Rating Distribution */}
                {reviewStats && (
                  <div className="analytics-section">
                    <h2>Rating Distribution</h2>
                    <div className="charts-grid">
                      {/* Pie Chart */}
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: "5 Stars",
                                  value: reviewStats.breakdown[5],
                                  rating: 5,
                                },
                                {
                                  name: "4 Stars",
                                  value: reviewStats.breakdown[4],
                                  rating: 4,
                                },
                                {
                                  name: "3 Stars",
                                  value: reviewStats.breakdown[3],
                                  rating: 3,
                                },
                                {
                                  name: "2 Stars",
                                  value: reviewStats.breakdown[2],
                                  rating: 2,
                                },
                                {
                                  name: "1 Star",
                                  value: reviewStats.breakdown[1],
                                  rating: 1,
                                },
                              ].filter((d) => d.value > 0)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[5, 4, 3, 2, 1].map((rating, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Bar Chart */}
                      <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={[
                              {
                                rating: "5★",
                                count: reviewStats.breakdown[5],
                              },
                              {
                                rating: "4★",
                                count: reviewStats.breakdown[4],
                              },
                              {
                                rating: "3★",
                                count: reviewStats.breakdown[3],
                              },
                              {
                                rating: "2★",
                                count: reviewStats.breakdown[2],
                              },
                              {
                                rating: "1★",
                                count: reviewStats.breakdown[1],
                              },
                            ]}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e5e7eb"
                            />
                            <XAxis
                              dataKey="rating"
                              stroke="#9ca3af"
                              tick={{ fontSize: 12 }}
                            />
                            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar
                              dataKey="count"
                              fill="#3b82f6"
                              radius={[8, 8, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Reviews Trend */}
                {analytics.chartData && analytics.chartData.length > 0 && (
                  <div className="analytics-section">
                    <h2>Recent Reviews Trend (Last 10)</h2>
                    <div className="chart-container-full">
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
                            label={{
                              value: "Review Number",
                              position: "insideBottom",
                              offset: -5,
                              fontSize: 12,
                            }}
                          />
                          <YAxis
                            domain={[0, 5]}
                            ticks={[1, 2, 3, 4, 5]}
                            stroke="#9ca3af"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            label={{
                              value: "Rating",
                              angle: -90,
                              position: "insideLeft",
                              fontSize: 12,
                            }}
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
                  </div>
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
