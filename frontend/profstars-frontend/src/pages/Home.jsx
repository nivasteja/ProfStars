// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../api";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  // University state
  const [countries, setCountries] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [universityModal, setUniversityModal] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const UNIVERSITIES_PER_PAGE = 12;

  // Professor state
  const [recentProfessors, setRecentProfessors] = useState([]);
  const [professorSearch, setProfessorSearch] = useState("");
  const [loadingProfessors, setLoadingProfessors] = useState(true);

  /* ------------ FETCH COUNTRIES ------------ */
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await API.get("/universities/countries");
        setCountries(res.data || []);
      } catch (err) {
        console.error("Error loading countries:", err);
      }
    };
    fetchCountries();
  }, []);

  /* ------------ FETCH RECENT PROFESSORS ------------ */
  useEffect(() => {
    const fetchRecentProfessors = async () => {
      setLoadingProfessors(true);
      try {
        // FIXED: endpoint aligned with Explore (/professor/recent)
        const res = await API.get("/professor/recent");
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

  /* ------------ FETCH UNIVERSITIES BY COUNTRY ------------ */
  useEffect(() => {
    if (!selectedCountry) {
      setUniversities([]);
      return;
    }

    const fetchUniversities = async () => {
      try {
        setLoadingUniversities(true);
        setCurrentPage(1);
        const res = await API.get(
          `/universities/${encodeURIComponent(selectedCountry)}`
        );
        setUniversities(res.data || []);
      } catch (err) {
        console.error("Error fetching universities:", err);
        setUniversities([]);
      } finally {
        setLoadingUniversities(false);
      }
    };

    fetchUniversities();
  }, [selectedCountry]);

  /* ------------ FILTER / PAGINATE UNIVERSITIES ------------ */
  const filteredUniversities = universities.filter((uni) =>
    uni.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUniversities.length / UNIVERSITIES_PER_PAGE)
  );

  const paginatedUniversities = filteredUniversities.slice(
    (currentPage - 1) * UNIVERSITIES_PER_PAGE,
    currentPage * UNIVERSITIES_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  /* ------------ FILTER PROFESSORS ------------ */
  const filteredProfessors = recentProfessors.filter((prof) =>
    prof.name?.toLowerCase().includes(professorSearch.toLowerCase())
  );

  /* ------------ HANDLERS ------------ */
  const handleProfessorClick = (profId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please log in to view professor details.", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }
    navigate(`/professor/${profId}`);
  };

  const openUniversityModal = (uni) => setUniversityModal(uni);
  const closeUniversityModal = () => setUniversityModal(null);

  /* ------------ RENDER ------------ */
  return (
    <div className="home-container">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="floating-glow" />
        <div className="floating-orb orb1" />
        <div className="floating-orb orb2" />

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

          <div className="hero-cta-row">
            <button
              className="hero-btn primary"
              onClick={() => navigate("/explore")}
            >
              Explore Professors & Universities
            </button>
            <button
              className="hero-btn ghost"
              onClick={() => navigate("/register")}
            >
              Join as a Student
            </button>
          </div>

          <div className="hero-trust-row">
            <span className="trust-dot" />
            <p>Built by students for students — global, transparent, fair.</p>
          </div>

          <div className="scroll-indicator">
            <span className="scroll-icon">⬇️</span>
            <p>Scroll to explore universities</p>
          </div>
        </div>
      </section>

      {/* UNIVERSITIES SECTION */}
      <section className="section section-light">
        <div className="section-content">
          <h2 className="section-title">Explore Universities Worldwide</h2>
          <p className="section-subtitle">
            Search from thousands of universities across the globe.
          </p>

          {/* Compact search bar */}
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
                aria-label="Search universities..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>
          </div>

          {/* Universities content */}
          {loadingUniversities ? (
            <p className="loading">Loading universities...</p>
          ) : selectedCountry && paginatedUniversities.length === 0 ? (
            <p className="no-results">No universities found.</p>
          ) : (
            <>
              <div className="university-grid">
                {paginatedUniversities.map((uni, idx) => (
                  <div
                    key={`${uni.name}-${idx}`}
                    className="university-card"
                    onClick={() => openUniversityModal(uni)}
                  >
                    <div className="uni-icon">🎓</div>
                    <h3 className="uni-name">{uni.name}</h3>
                    <p className="uni-country">
                      {uni.country || selectedCountry}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pagination (scoped classes to avoid conflict with Explore) */}
              {selectedCountry && totalPages > 1 && (
                <div className="home-pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="home-pagination-btn"
                  >
                    &larr;
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`home-pagination-btn ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="home-pagination-btn"
                  >
                    &rarr;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* RECENT PROFESSORS */}
      <section className="section section-dark">
        <div className="section-content">
          <h2 className="section-title">Recently Added Professors</h2>
          <p className="section-subtitle">
            Meet the newest voices in our academic community.
          </p>

          <div className="professor-search-box">
            <input
              type="text"
              placeholder="Search professors by name..."
              aria-label="Search professors by name..."
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
              {filteredProfessors.slice(0, 6).map((prof) => (
                <div
                  key={prof._id}
                  className="professor-card"
                  onClick={() => handleProfessorClick(prof._id)}
                >
                  <div className="prof-avatar">
                    {prof.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="prof-info">
                    <h3 className="prof-name">{prof.name}</h3>
                    <p className="prof-detail">{prof.university || "N/A"}</p>
                    <p className="prof-detail">{prof.department || "N/A"}</p>
                    <p className="prof-detail">
                      📍 {prof.country || "Not specified"}
                    </p>
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

      {/* WHY PROFSTARS / VALUES */}
      <section className="section section-light">
        <div className="section-content">
          <h2 className="section-title">Why ProfStars?</h2>
          <p className="section-subtitle">
            Designed for transparency, built for student success.
          </p>

          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3 className="value-title">Global Network</h3>
              <p className="value-desc">
                Access professor reviews from universities all around the world.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">⭐</div>
              <h3 className="value-title">Honest Reviews</h3>
              <p className="value-desc">
                Read authentic student voices — no sugarcoating, no noise.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3 className="value-title">Smarter Decisions</h3>
              <p className="value-desc">
                Choose professors who match your goals, learning style, and
                ambitions.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3 className="value-title">Community Driven</h3>
              <p className="value-desc">
                Built by students, for students — constantly evolving with your
                feedback.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤖</div>
              <h3 className="value-title">AI Insights</h3>
              <p className="value-desc">
                Get AI-powered trends and patterns to quickly understand
                professor performance.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon">✅</div>
              <h3 className="value-title">Verified Data</h3>
              <p className="value-desc">
                Reviews are checked for authenticity to keep the platform fair
                and trustworthy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* UNIVERSITY MODAL (uses global modal styles from Footer.css) */}
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
            {universityModal.web_pages?.[0] && (
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
