import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../styles/StudentDashboard.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const StudentDashboard = () => {
  const [professors, setProfessors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterUniversity, setFilterUniversity] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [review, setReview] = useState({ rating: 0, comment: "" });
  const [reviewErrors, setReviewErrors] = useState({});

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const res = await axios.get(
          "http://localhost:5000/api/universities/countries"
        );
        setCountries(res.data);
        setLoadingCountries(false);
      } catch (err) {
        console.error("Error loading countries:", err);
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch universities when country filter changes
  useEffect(() => {
    if (filterCountry) {
      setLoadingUniversities(true);
      setUniversities([]);
      setFilterUniversity("");

      axios
        .get(
          `http://localhost:5000/api/universities/${encodeURIComponent(
            filterCountry
          )}`
        )
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setUniversities(res.data);
          } else {
            setUniversities([]);
          }
          setLoadingUniversities(false);
        })
        .catch((err) => {
          console.error("Error fetching universities:", err);
          setUniversities([]);
          setLoadingUniversities(false);
        });
    } else {
      setUniversities([]);
      setFilterUniversity("");
    }
  }, [filterCountry]);

  // Fetch professors
  const fetchProfessors = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/review/professors?q=${encodeURIComponent(
          search
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfessors(res.data);
    } catch (error) {
      console.error("Error fetching professors:", error);
    }
  }, [token, search]);

  useEffect(() => {
    fetchProfessors();
  }, [fetchProfessors]);

  // Validate review form
  const validateReview = () => {
    const errors = {};

    if (!review.rating || review.rating < 1 || review.rating > 5) {
      errors.rating = "Please select a rating between 1 and 5";
    }

    if (!review.comment.trim()) {
      errors.comment = "Please write a comment";
    } else if (review.comment.trim().length < 10) {
      errors.comment = "Comment must be at least 10 characters";
    } else if (review.comment.trim().length > 500) {
      errors.comment = "Comment must not exceed 500 characters";
    }

    setReviewErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!validateReview()) {
      toast.error("Please fix the errors in your review");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/reviews/${selectedProfessor._id}`,
        review,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setReview({ rating: 0, comment: "" });
      setReviewErrors({});
      fetchProfessors();
      toast.success("Review submitted successfully!");
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error(
        err.response?.data?.message ||
          "Failed to submit review. Please try again."
      );
    }
  };

  // Handle review field changes
  const handleReviewChange = (field, value) => {
    setReview({ ...review, [field]: value });
    // Clear error for this field
    if (reviewErrors[field]) {
      setReviewErrors({ ...reviewErrors, [field]: "" });
    }
  };

  // Filter professors by search, university, country
  const filteredProfessors = professors.filter((p) => {
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (!filterCountry ||
        (p.country &&
          p.country.toLowerCase().includes(filterCountry.toLowerCase()))) &&
      (!filterUniversity ||
        (p.university &&
          p.university.toLowerCase().includes(filterUniversity.toLowerCase())))
    );
  });

  return (
    <div className="student-dashboard">
      <h1>🎓 Explore Professors</h1>

      {/* Filters Section */}
      <div className="filters-grid">
        <input
          type="text"
          placeholder="Search by professor name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />

        <select
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          disabled={loadingCountries}
          className="filter-select"
        >
          <option value="">
            {loadingCountries ? "Loading Countries..." : "All Countries"}
          </option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <select
          value={filterUniversity}
          onChange={(e) => setFilterUniversity(e.target.value)}
          disabled={!filterCountry || loadingUniversities}
          className="filter-select"
        >
          <option value="">
            {!filterCountry
              ? "Select Country First"
              : loadingUniversities
              ? "Loading Universities..."
              : "All Universities"}
          </option>
          {universities.map((uni, index) => (
            <option key={`${uni.name}-${index}`} value={uni.name}>
              {uni.name}
            </option>
          ))}
        </select>

        {/* Clear Filters Button */}
        {(search || filterCountry || filterUniversity) && (
          <button
            className="clear-filters-btn"
            onClick={() => {
              setSearch("");
              setFilterCountry("");
              setFilterUniversity("");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Professor Cards */}
      <div className="professor-grid">
        {filteredProfessors.length === 0 ? (
          <div className="no-results">
            <p>No professors found matching your criteria.</p>
            {(search || filterCountry || filterUniversity) && (
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSearch("");
                  setFilterCountry("");
                  setFilterUniversity("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filteredProfessors.map((prof) => (
            <div key={prof._id} className="professor-card">
              <h2>{prof.name}</h2>
              <p>
                <strong>University:</strong> {prof.university || "N/A"}
              </p>
              <p>
                <strong>Department:</strong> {prof.department || "N/A"}
              </p>
              <p>
                <strong>Country:</strong> {prof.country || "N/A"}
              </p>
              <p>
                ⭐{" "}
                {prof.averageRating
                  ? prof.averageRating.toFixed(1)
                  : "No Ratings"}
              </p>

              <div className="card-buttons">
                <button
                  className="review-btn"
                  onClick={() => {
                    setSelectedProfessor(prof);
                    setShowModal(true);
                    setReview({ rating: 0, comment: "" });
                    setReviewErrors({});
                  }}
                >
                  Add Review
                </button>
                <button
                  className="view-btn"
                  onClick={() => navigate(`/professor/${prof._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Review for {selectedProfessor.name}</h2>
            <form onSubmit={handleReviewSubmit}>
              <div className="form-field">
                <label>Rating (1–5) *</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${
                        review.rating >= star ? "active" : ""
                      }`}
                      onClick={() => handleReviewChange("rating", star)}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                {reviewErrors.rating && (
                  <span className="error-text">{reviewErrors.rating}</span>
                )}
              </div>

              <div className="form-field">
                <label>Comment (10-500 characters) *</label>
                <textarea
                  value={review.comment}
                  onChange={(e) =>
                    handleReviewChange("comment", e.target.value)
                  }
                  placeholder="Share your experience with this professor..."
                  rows="5"
                  className={reviewErrors.comment ? "error" : ""}
                />
                <div className="char-count">
                  {review.comment.length}/500 characters
                </div>
                {reviewErrors.comment && (
                  <span className="error-text">{reviewErrors.comment}</span>
                )}
              </div>

              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  Submit Review
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setReview({ rating: 0, comment: "" });
                    setReviewErrors({});
                  }}
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

export default StudentDashboard;
