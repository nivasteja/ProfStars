import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ProfessorDetails.css";
import "../styles/Navbar.css";
import logo from "../assets/logo.svg";
import Footer from "../components/Footer";

const ProfessorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [professor, setProfessor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    semester: "",
    subject: "",
  });

  const [reviewFilter, setReviewFilter] = useState("all");
  const [reviewSort, setReviewSort] = useState("newest");

  const token = localStorage.getItem("token");

  const loadDetails = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/review/professor/${id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      setProfessor(res.data.professor);
      setReviews(res.data.reviews || []);
      setSubjects(res.data.subjects || []);
      setAvgRating(res.data.avgRating?.toFixed(1) || 0);
    } catch (err) {
      console.error("❌ Error loading details:", err);
      toast.error("Failed to load professor details.");
    }
  }, [id, token]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const submitReview = async (e) => {
    e.preventDefault();

    if (!newReview.comment.trim()) {
      return toast.warning("Please enter a comment!");
    }

    try {
      await axios.post(
        "http://localhost:5000/api/review/add",
        { ...newReview, professorId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Review submitted successfully!");
      setNewReview({
        rating: 5,
        comment: "",
        semester: "",
        subject: "",
      });
      setShowReviewModal(false);
      loadDetails();
    } catch (err) {
      console.error("Review submission failed:", err);
      toast.error(err.response?.data?.message || "Failed to submit review.");
    }
  };

  const getFilteredReviews = () => {
    let filtered = [...reviews];

    if (reviewFilter !== "all") {
      filtered = filtered.filter((r) => r.rating === parseInt(reviewFilter));
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
    navigate("/");
  };

   const studentBtnStyle = {
    background: "linear-gradient(135deg, #6d28d9 0%, #8b5cf6 100%)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
  };


  // Get unique semesters from subjects
  const uniqueSemesters = [
    ...new Set(subjects.map((s) => s.semester).filter(Boolean)),
  ];
  const uniqueSubjects = [...new Set(subjects.map((s) => s.subjectName))];

  if (!professor) {
    return (
      <div className="professor-details">
        <div className="loading">Loading professor details...</div>
      </div>
    );
  }

  return (
    <div className="professor-details">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />

      {/* Integrated Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo and Brand */}
          <Link to="/" className="navbar-logo">
            <img src={logo} alt="ProfStars Logo" className="logo-img" />
            <span className="logo-text">ProfStars</span>
          </Link>

          {/* Links */}
          <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
  <button
    className="nav-link"
    style={studentBtnStyle}
    onClick={() => navigate("/dashboard")}
  >
    Dashboard
  </button>

  <button
    className="nav-link"
    style={studentBtnStyle}
    onClick={() => {
      navigate("/dashboard");
      setTimeout(() => {
        const event = new CustomEvent("switchTab", {
          detail: "add-professor",
        });
        window.dispatchEvent(event);
      }, 100);
    }}
  >
    Add Professor
  </button>

  <button className="nav-link btn-cta" onClick={handleLogout}>
    Logout
  </button>
</div>

          {/* Hamburger Menu for Mobile */}
          <div
            className={`hamburger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Professor Header */}
      <div className="details-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>{professor.name}</h1>
      </div>

      {/* Details/Reviews Tabs */}
      <nav className="details-nav-tabs">
        <button
          className={`nav-tab ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>
        <button
          className={`nav-tab ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews ({reviews.length})
        </button>
      </nav>

      <div className="details-content">
        {activeTab === "details" && (
          <>
            <div className="info-card">
              <div className="info-header">
                <h2>Professor Information</h2>
                <div className="rating-badge">⭐ {avgRating} / 5.0</div>
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">University</span>
                  <span className="info-value">
                    {professor.university || "N/A"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Department</span>
                  <span className="info-value">
                    {professor.department || "N/A"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Country</span>
                  <span className="info-value">
                    {professor.country || "N/A"}
                  </span>
                </div>
                {professor.academicTitle && (
                  <div className="info-item">
                    <span className="info-label">Academic Title</span>
                    <span className="info-value">
                      {professor.academicTitle}
                    </span>
                  </div>
                )}
                {professor.experienceYears && (
                  <div className="info-item">
                    <span className="info-label">Experience</span>
                    <span className="info-value">
                      {professor.experienceYears} years
                    </span>
                  </div>
                )}
                {professor.major && (
                  <div className="info-item">
                    <span className="info-label">Major</span>
                    <span className="info-value">{professor.major}</span>
                  </div>
                )}
              </div>

              {professor.bio && (
                <div className="bio-section">
                  <h3>About</h3>
                  <p>{professor.bio}</p>
                </div>
              )}

              {professor.socialLinks && (
                <div className="social-section">
                  <h3>Academic Profiles</h3>
                  <div className="social-buttons">
                    {professor.socialLinks.linkedin && (
                      <a
                        href={professor.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-btn linkedin"
                      >
                        LinkedIn
                      </a>
                    )}
                    {professor.socialLinks.researchGate && (
                      <a
                        href={professor.socialLinks.researchGate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-btn researchgate"
                      >
                        ResearchGate
                      </a>
                    )}
                    {professor.socialLinks.googleScholar && (
                      <a
                        href={professor.socialLinks.googleScholar}
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

            <div className="subjects-card">
              <h2>Subjects Taught</h2>
              {subjects.length === 0 ? (
                <p className="empty-message">No subjects added yet.</p>
              ) : (
                <div className="subjects-grid">
                  {subjects.map((subject) => (
                    <div key={subject._id} className="subject-item">
                      <div className="subject-header">
                        <h4>{subject.subjectName}</h4>
                        <div className="subject-badges">
                          {subject.courseCode && (
                            <span className="badge badge-blue">
                              {subject.courseCode}
                            </span>
                          )}
                          {subject.category && subject.category !== "Other" && (
                            <span className="badge badge-gray">
                              {subject.category}
                            </span>
                          )}
                        </div>
                      </div>
                      {subject.description && (
                        <p className="subject-description">
                          {subject.description}
                        </p>
                      )}
                      {subject.semester && (
                        <p className="subject-semester">
                          📅 {subject.semester}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {token && (
              <div className="action-section">
                <button
                  className="btn-add-review"
                  onClick={() => setShowReviewModal(true)}
                >
                  ✍️ Add Your Review
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "reviews" && (
          <div className="reviews-tab">
            <div className="review-controls">
              <select
                value={reviewFilter}
                onChange={(e) => setReviewFilter(e.target.value)}
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

              {token && (
                <button
                  className="btn-add-review-inline"
                  onClick={() => setShowReviewModal(true)}
                >
                  ✍️ Add Review
                </button>
              )}
            </div>

            {filteredReviews.length === 0 ? (
              <div className="empty-reviews">
                <p>No reviews yet for this professor.</p>
                {token && (
                  <button
                    className="btn-primary"
                    onClick={() => setShowReviewModal(true)}
                  >
                    Be the First to Review
                  </button>
                )}
              </div>
            ) : (
              <div className="reviews-list">
                {filteredReviews.map((review) => (
                  <div key={review._id} className="review-item">
                    <div className="review-header">
                      <div className="review-author">
                        <strong>{review.studentId?.name || "Anonymous"}</strong>
                        <span className="review-stars">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </span>
                      </div>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>

                    <div className="review-meta">
                      {review.semester && (
                        <span className="meta-badge">📅 {review.semester}</span>
                      )}
                      {review.subject && (
                        <span className="meta-badge">📚 {review.subject}</span>
                      )}
                    </div>

                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showReviewModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowReviewModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowReviewModal(false)}
            >
              ✕
            </button>

            <h2>Add Your Review</h2>
            <p className="modal-subtitle">
              Share your experience with {professor.name}
            </p>

            <form onSubmit={submitReview} className="review-form">
              <div className="form-field">
                <label>Rating *</label>
                <select
                  value={newReview.rating}
                  onChange={(e) =>
                    setNewReview({
                      ...newReview,
                      rating: Number(e.target.value),
                    })
                  }
                  required
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Star{r !== 1 ? "s" : ""} {"⭐".repeat(r)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Semester</label>
                <select
                  value={newReview.semester}
                  onChange={(e) =>
                    setNewReview({ ...newReview, semester: e.target.value })
                  }
                >
                  <option value="">Select Semester (Optional)</option>
                  {uniqueSemesters.length > 0 ? (
                    uniqueSemesters.map((sem, idx) => (
                      <option key={idx} value={sem}>
                        {sem}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No semesters available
                    </option>
                  )}
                </select>
              </div>

              <div className="form-field">
                <label>Subject</label>
                <select
                  value={newReview.subject}
                  onChange={(e) =>
                    setNewReview({ ...newReview, subject: e.target.value })
                  }
                >
                  <option value="">Select Subject (Optional)</option>
                  {uniqueSubjects.length > 0 ? (
                    uniqueSubjects.map((subj, idx) => (
                      <option key={idx} value={subj}>
                        {subj}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No subjects available
                    </option>
                  )}
                </select>
              </div>

              <div className="form-field">
                <label>Your Review *</label>
                <textarea
                  placeholder="Share your experience with this professor..."
                  aria-label="Share your experience with this professor..."
                  value={newReview.comment}
                  onChange={(e) =>
                    setNewReview({ ...newReview, comment: e.target.value })
                  }
                  rows={5}
                  maxLength={500}
                  required
                />
                <div className="char-count">{newReview.comment.length}/500</div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-submit">
                  Submit Review
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
    </div>
  );
};

export default ProfessorDetails;
