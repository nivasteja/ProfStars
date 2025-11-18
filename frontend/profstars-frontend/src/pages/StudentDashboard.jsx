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
  const [showAddProfessor, setShowAddProfessor] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [review, setReview] = useState({ rating: 0, comment: "", semester: "", subject: "" });
  const [newProfessor, setNewProfessor] = useState({
    name: "",
    department: "",
    university: "",
  });


  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const res = await axios.get("http://localhost:5000/api/universities/countries");
        setCountries(res.data);
      } catch (err) {
        console.error("Error loading countries:", err);
      } finally {
        setLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // Fetch universities by country
  useEffect(() => {
    if (!filterCountry) {
      setUniversities([]);
      setFilterUniversity("");
      return;
    }
    setLoadingUniversities(true);
    setUniversities([]);
    setFilterUniversity("");
    axios
      .get(`http://localhost:5000/api/universities/${encodeURIComponent(filterCountry)}`)
      .then((res) => setUniversities(res.data || []))
      .catch((err) => {
        console.error("Error fetching universities:", err);
        setUniversities([]);
      })
      .finally(() => setLoadingUniversities(false));
  }, [filterCountry]);

  // Fetch professors
  const fetchProfessors = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/review/professors?q=${encodeURIComponent(search)}`,
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

  // Submit review
  const handleReviewSubmit = async (e) => {
  e.preventDefault();

  try {
    await axios.post(
      "http://localhost:5000/api/review/add",
      {
        professorId: selectedProfessor._id,
        rating: review.rating,
        comment: review.comment,
        semester: review.semester,
        subject: review.subject,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setShowModal(false);

    // Reset the form
    setReview({
      rating: 0,
      comment: "",
      semester: "",
      subject: ""
    });

    fetchProfessors();
    alert("Review submitted successfully!");
  } catch (err) {
    console.error("Error submitting review:", err);
    alert(err.response?.data?.message || "Failed to submit review.");
  }
};

  // Add new professor (student submission -> admin approval)
  const handleAddProfessor = async (e) => {
    e.preventDefault();

    if (!newProfessor.name || !newProfessor.department || !newProfessor.university) {
      alert("Please fill all fields");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/professors/add",
        {
          name: newProfessor.name,
          department: newProfessor.department,
          university: newProfessor.university,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Professor submitted for admin approval!");
      setShowAddProfessor(false);
      setNewProfessor({ name: "", department: "", university: "" });
    } catch (err) {
      console.error("Error submitting professor:", err);
      alert(err.response?.data?.message || "Failed to submit professor.");
    }
  };


  // Filter professors
  const filteredProfessors = professors.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCountry =
      !filterCountry || (p.country && p.country.toLowerCase().includes(filterCountry.toLowerCase()));
    const matchesUniversity =
      !filterUniversity || (p.university && p.university.toLowerCase().includes(filterUniversity.toLowerCase()));
    return matchesSearch && matchesCountry && matchesUniversity;
  });

  return (
    <div className="student-dashboard">
      <h1>🎓 Explore Professors</h1>

      {/* Filters */}
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
          <option value="">{loadingCountries ? "Loading Countries..." : "All Countries"}</option>
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
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
          {universities.map((uni, idx) => (
            <option key={`${uni.name}-${idx}`} value={uni.name}>{uni.name}</option>
          ))}
        </select>
        <button className="add-professor-btn" onClick={() => setShowAddProfessor(true)}>➕ Add Professor</button>
        {(search || filterCountry || filterUniversity) && (
          <button className="clear-filters-btn" onClick={() => {
            setSearch("");
            setFilterCountry("");
            setFilterUniversity("");
          }}>Clear Filters</button>
        )}
      </div>

      {/* Professors List */}
      <div className="professor-grid">
        {filteredProfessors.length === 0 ? (
          <div className="no-results">
            <p>No professors found matching your criteria.</p>
            <button className="clear-filters-btn" onClick={() => {
              setSearch("");
              setFilterCountry("");
              setFilterUniversity("");
            }}>Clear Filters</button>
          </div>
        ) : (
          filteredProfessors.map((prof) => (
            <div key={prof._id} className="professor-card">
              <h2>{prof.name}</h2>
              <p><strong>University:</strong> {prof.university || "N/A"}</p>
              <p><strong>Department:</strong> {prof.department || "N/A"}</p>
              <p><strong>Country:</strong> {prof.country || "N/A"}</p>
              <p>⭐ {prof.averageRating ? prof.averageRating.toFixed(1) : "No Ratings"}</p>
              <div className="card-buttons">
                <button className="review-btn" onClick={() => { setSelectedProfessor(prof); setShowModal(true); }}>Add Review</button>
                <button className="view-btn" onClick={() => navigate(`/professor/${prof._id}`)}>View Details</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Review for {selectedProfessor.name}</h2>
            <form onSubmit={handleReviewSubmit}>
              <label>Rating (1–5)</label>
              <input type="number" min="1" max="5" value={review.rating} onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })} required />
              <label>Comment</label>
              <textarea value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} placeholder="Write your feedback..." required />
              <label>Semester</label>
              <input
                type="text"
                value={review.semester}
                onChange={(e) => setReview({ ...review, semester: e.target.value })}
                required
              />

              <label>Subject</label>
              <input
                type="text"
                value={review.subject}
                onChange={(e) => setReview({ ...review, subject: e.target.value })}
                required
              />

              <div className="modal-buttons">
                <button type="submit" className="submit-btn">Submit</button>
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Professor Modal */}
      {showAddProfessor && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add New Professor</h2>
            <form onSubmit={handleAddProfessor}>
              <label>Name</label>
              <input type="text" value={newProfessor.name} onChange={(e) => setNewProfessor({ ...newProfessor, name: e.target.value })} required />
              <label>Department</label>
              <input type="text" value={newProfessor.department} onChange={(e) => setNewProfessor({ ...newProfessor, department: e.target.value })} required />
              <label>University</label>
              <input type="text" value={newProfessor.university} onChange={(e) => setNewProfessor({ ...newProfessor, university: e.target.value })} required />
              <div className="modal-buttons">
                <button type="submit" className="submit-btn">Submit</button>
                <button type="button" className="cancel-btn" onClick={() => setShowAddProfessor(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
