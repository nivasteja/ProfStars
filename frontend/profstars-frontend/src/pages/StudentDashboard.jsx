import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../styles/StudentDashboard.css";
import { useNavigate } from "react-router-dom";

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
      const res = await axios.get("http://localhost:5000/api/professors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfessors(res.data);
    } catch (error) {
      console.error("Error fetching professors:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchProfessors();
  }, [fetchProfessors]);

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://localhost:5000/api/reviews/${selectedProfessor._id}`,
        review,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setReview({ rating: 0, comment: "" });
      fetchProfessors();
      alert("Review submitted successfully!");
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review. Please try again.");
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

      {/* 🔍 Filters Section */}
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

      {/* 🧑‍🏫 Professor Cards */}
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

      {/* 💬 Review Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Review for {selectedProfessor.name}</h2>
            <form onSubmit={handleReviewSubmit}>
              <label>Rating (1–5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={review.rating}
                onChange={(e) =>
                  setReview({ ...review, rating: Number(e.target.value) })
                }
                required
              />

              <label>Comment</label>
              <textarea
                value={review.comment}
                onChange={(e) =>
                  setReview({ ...review, comment: e.target.value })
                }
                placeholder="Write your feedback..."
                required
              />

              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  Submit
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
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
