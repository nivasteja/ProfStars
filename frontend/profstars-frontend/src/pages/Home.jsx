import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify"; // Ensure react-toastify is installed
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  // University state
  const [countries, setCountries] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [universityModal, setUniversityModal] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const universitiesPerPage = 12;

  // Professor state
  const [recentProfessors, setRecentProfessors] = useState([]);
  const [professorSearch, setProfessorSearch] = useState("");
  const [loadingProfessors, setLoadingProfessors] = useState(true);

  // Fetch countries
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/universities/countries"
        );
        setCountries(res.data);
      } catch (err) {
        console.error("Error loading countries:", err);
      }
    };
    fetchCountries();
  }, []);

  // Fetch recent professors
  useEffect(() => {
    const fetchRecentProfessors = async () => {
      setLoadingProfessors(true);
      try {
        const res = await axios.get(
          "http://localhost:5000/api/professor/recent"
        );
        setRecentProfessors(res.data || []);
      } catch (err) {
        console.error("Error loading recent professors:", err);
        setRecentProfessors([]);
      } finally {
        setLoadingProfessors(false);
      }
    };
    fetchRecentProfessors();
  }, []);

  // Fetch universities when country changes
  useEffect(() => {
    if (selectedCountry) {
      setLoading(true);
      setCurrentPage(1);
      axios
        .get(
          `http://localhost:5000/api/universities/${encodeURIComponent(
            selectedCountry
          )}`
        )
        .then((res) => {
          setUniversities(res.data || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching universities:", err);
          setUniversities([]);
          setLoading(false);
        });
    } else {
      setUniversities([]);
    }
  }, [selectedCountry]);

  // Filter universities
  const filteredUniversities = universities.filter((uni) =>
    uni.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUniversities.length / universitiesPerPage)
  );
  const paginatedUniversities = filteredUniversities.slice(
    (currentPage - 1) * universitiesPerPage,
    currentPage * universitiesPerPage
  );

  // Filter professors by name
  const filteredProfessors = recentProfessors.filter((prof) =>
    prof.name.toLowerCase().includes(professorSearch.toLowerCase())
  );

  const handleProfessorClick = (profId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please log in to view professor details.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    navigate(`/professor/${profId}`);
  };

  const openUniversityModal = (uni) => {
    setUniversityModal(uni);
  };

  const closeUniversityModal = () => {
    setUniversityModal(null);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="floating-glow"></div>
        <div className="floating-orb orb1"></div>
        <div className="floating-orb orb2"></div>

        <div className="hero-content">
          <h1 className="hero-title">Discover. Review. Connect.</h1>
          <p className="hero-subtitle">
            The future of academic transparency starts here.
          </p>
          <p className="hero-description">
            Join the ProfStars community — a global academic network where
            knowledge meets experience. Find professors, explore universities,
            and share your story.
          </p>

          <div className="scroll-indicator">
            <span className="scroll-icon">⬇️</span>
            <p>Explore Universities</p>
          </div>
        </div>
      </section>

      {/* University Search Section */}
      <section className="section section-light">
        <div className="section-content">
          <h2 className="section-title">Explore Universities Worldwide</h2>
          <p className="section-subtitle">
            Search from thousands of universities across the globe
          </p>

          <div className="search-box">
            <div className="search-row">
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="select-input"
              >
                <option value="">Select a Country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search universities..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>
          </div>

          {loading ? (
            <p className="loading">Loading universities...</p>
          ) : selectedCountry &&
            !loading &&
            paginatedUniversities.length === 0 ? (
            <p className="no-results">No universities found.</p>
          ) : (
            <>
              <div className="university-grid">
                {paginatedUniversities.map((uni, idx) => (
                  <div
                    key={idx}
                    className="university-card"
                    onClick={() => openUniversityModal(uni)}
                  >
                    <div className="uni-icon">🎓</div>
                    <h3 className="uni-name">{uni.name}</h3>
                    <p className="uni-country">{selectedCountry}</p>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    &larr;
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`pagination-btn ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Recently Added Professors */}
      <section className="section section-dark">
        <div className="section-content">
          <h2 className="section-title">Recently Added Professors</h2>
          <p className="section-subtitle">
            Meet the newest members of our academic community
          </p>

          <div className="professor-search-box">
            <input
              type="text"
              placeholder="Search professors by name..."
              value={professorSearch}
              onChange={(e) => setProfessorSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {loadingProfessors ? (
            <p className="loading">Loading professors...</p>
          ) : filteredProfessors.length === 0 ? (
            <p className="no-results">No professors match your search.</p>
          ) : (
            <div className="professor-grid">
              {filteredProfessors.slice(0, 5).map((prof) => (
                <div
                  key={prof._id}
                  className="professor-card"
                  onClick={() => handleProfessorClick(prof._id)}
                >
                  <div className="prof-avatar">
                    {prof.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="prof-info">
                    <h3 className="prof-name">{prof.name}</h3>
                    <p className="prof-detail">{prof.university || "N/A"}</p>
                    <p className="prof-detail">{prof.department || "N/A"}</p>
                    <p className="prof-detail">📍 {prof.country || "N/A"}</p>
                    <div className="prof-rating">
                      ⭐{" "}
                      {prof.averageRating
                        ? prof.averageRating.toFixed(1)
                        : "New"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="section section-light">
        <div className="section-content">
          <h2 className="section-title">Why ProfStars?</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3 className="value-title">Global Network</h3>
              <p className="value-desc">
                Access professor reviews from universities across the world
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">⭐</div>
              <h3 className="value-title">Honest Reviews</h3>
              <p className="value-desc">
                Share and read authentic student experiences and ratings
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3 className="value-title">Make Informed Choices</h3>
              <p className="value-desc">
                Find the right professors for your academic journey
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3 className="value-title">Community Driven</h3>
              <p className="value-desc">
                Built by students, for students, supporting academic excellence
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤖</div>
              <h4 className="value-title">AI Insights</h4>
              <p className="value-desc">
                Get AI-powered analysis of professor ratings and trends for
                smarter decisions.
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">✅</div>
              <h4 className="value-title">Verified Data</h4>
              <p className="value-desc">
                All reviews are verified for authenticity to ensure reliability
                and trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} ProfStars | All Rights Reserved</p>
        <p className="footer-links">
          <a href="#" className="footer-link">
            Terms
          </a>{" "}
          |
          <a href="#" className="footer-link">
            Privacy
          </a>{" "}
          |
          <a href="#" className="footer-link">
            Contact
          </a>
        </p>
      </footer>

      {/* University Modal */}
      {universityModal && (
        <div className="modal-overlay" onClick={closeUniversityModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeUniversityModal}>
              ✕
            </button>
            <h3 className="modal-title">{universityModal.name}</h3>
            <p>
              <strong>Country:</strong>{" "}
              {universityModal.country || selectedCountry}
            </p>
            {universityModal["state-province"] && (
              <p>
                <strong>State/Province:</strong>{" "}
                {universityModal["state-province"]}
              </p>
            )}
            {universityModal.web_pages && universityModal.web_pages[0] && (
              <p>
                <strong>Website:</strong>{" "}
                <a
                  href={universityModal.web_pages[0].trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-link"
                >
                  {universityModal.web_pages[0].trim()}
                </a>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
