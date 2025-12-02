import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import StudentNavbar from "../components/StudentNavbar";
import Footer from "../components/Footer";
import "../styles/StudentDashboard.css";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [professors, setProfessors] = useState([]);
  const [countries, setCountries] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [loadingProfessors, setLoadingProfessors] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [filterUniversity, setFilterUniversity] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const professorsPerPage = 12;

  // Add Professor Form
  const [newProfessor, setNewProfessor] = useState({
    name: "",
    department: "",
    university: "",
    country: "",
    academicTitle: "",
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Listen for tab switch events from ProfessorDetails
  useEffect(() => {
    const handleTabSwitch = (e) => {
      setActiveTab(e.detail);
    };
    window.addEventListener("switchTab", handleTabSwitch);
    return () => window.removeEventListener("switchTab", handleTabSwitch);
  }, []);

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

  // Fetch universities by country
  useEffect(() => {
    if (!filterCountry && !newProfessor.country) {
      setUniversities([]);
      return;
    }

    const country =
      activeTab === "add-professor" ? newProfessor.country : filterCountry;
    if (!country) return;

    setLoadingUniversities(true);
    axios
      .get(
        `http://localhost:5000/api/universities/${encodeURIComponent(country)}`
      )
      .then((res) => setUniversities(res.data || []))
      .catch((err) => {
        console.error("Error fetching universities:", err);
        setUniversities([]);
      })
      .finally(() => setLoadingUniversities(false));
  }, [filterCountry, newProfessor.country, activeTab]);

  // Fetch professors
  const fetchProfessors = useCallback(async () => {
    setLoadingProfessors(true);
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
      toast.error("Failed to load professors");
    } finally {
      setLoadingProfessors(false);
    }
  }, [token, search]);

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchProfessors();
    }
  }, [fetchProfessors, activeTab]);

  // Filter professors
  const filteredProfessors = professors.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCountry =
      !filterCountry ||
      p.country?.toLowerCase().includes(filterCountry.toLowerCase());
    const matchesUniversity =
      !filterUniversity ||
      p.university?.toLowerCase().includes(filterUniversity.toLowerCase());
    return matchesSearch && matchesCountry && matchesUniversity;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProfessors.length / professorsPerPage);
  const paginatedProfessors = filteredProfessors.slice(
    (currentPage - 1) * professorsPerPage,
    currentPage * professorsPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCountry, filterUniversity]);

  // Handle Add Professor
  const handleAddProfessor = async (e) => {
    e.preventDefault();

    if (
      !newProfessor.name ||
      !newProfessor.department ||
      !newProfessor.university ||
      !newProfessor.country
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/review/add-professor",
        newProfessor,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Professor submitted for admin approval!");
      setNewProfessor({
        name: "",
        department: "",
        university: "",
        country: "",
        academicTitle: "",
      });
      setActiveTab("dashboard");
    } catch (err) {
      console.error("Error submitting professor:", err);
      toast.error(err.response?.data?.message || "Failed to submit professor.");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterCountry("");
    setFilterUniversity("");
  };

  return (
    <div className="student-dashboard">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar />

      <StudentNavbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="content">
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="section">
            <div className="section-header">
              <h1>Explore Professors</h1>
              <p className="section-subtitle">
                Search and filter through our comprehensive professor directory
              </p>
            </div>

            {/* Filters */}
            <div className="filters-section">
              <input
                type="text"
                className="search-input"
                placeholder="Search by professor name..."
                aria-label="Search by professor name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={filterCountry}
                onChange={(e) => {
                  setFilterCountry(e.target.value);
                  setFilterUniversity("");
                }}
                className="filter-select"
              >
                <option value="">All Countries</option>
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
                    ? "Loading..."
                    : "All Universities"}
                </option>
                {universities.map((uni, idx) => (
                  <option key={`${uni.name}-${idx}`} value={uni.name}>
                    {uni.name}
                  </option>
                ))}
              </select>
              {(search || filterCountry || filterUniversity) && (
                <button className="btn-clear" onClick={clearFilters}>
                  Clear Filters
                </button>
              )}
            </div>

            {/* Results Info */}
            {!loadingProfessors && (
              <div className="results-info">
                Showing {paginatedProfessors.length} of{" "}
                {filteredProfessors.length} professors
              </div>
            )}

            {/* Loading State */}
            {loadingProfessors && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading professors...</p>
              </div>
            )}

            {/* Professors Grid */}
            {!loadingProfessors && paginatedProfessors.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🔍</div>
                <h2>No Professors Found</h2>
                <p>
                  {search || filterCountry || filterUniversity
                    ? "We couldn't find any professors matching your criteria. Try adjusting your filters or search terms."
                    : "No professors available yet. Be the first to add one!"}
                </p>
                <div className="empty-actions">
                  {(search || filterCountry || filterUniversity) && (
                    <button className="btn-secondary" onClick={clearFilters}>
                      Clear Filters
                    </button>
                  )}
                  <button
                    className="btn-primary"
                    onClick={() => setActiveTab("add-professor")}
                  >
                    Add Professor
                  </button>
                </div>
              </div>
            ) : (
              !loadingProfessors && (
                <>
                  <div className="professors-grid">
                    {paginatedProfessors.map((prof) => (
                      <div key={prof._id} className="professor-card">
                        <div className="card-header">
                          <h3>{prof.name}</h3>
                          <div className="rating">
                            ⭐{" "}
                            {prof.averageRating
                              ? prof.averageRating.toFixed(1)
                              : "N/A"}
                          </div>
                        </div>

                        <div className="card-body">
                          <div className="info-row">
                            <span className="label">University:</span>
                            <span className="value">
                              {prof.university || "N/A"}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="label">Department:</span>
                            <span className="value">
                              {prof.department || "N/A"}
                            </span>
                          </div>
                          <div className="info-row">
                            <span className="label">Country:</span>
                            <span className="value">
                              {prof.country || "N/A"}
                            </span>
                          </div>
                          {prof.academicTitle && (
                            <div className="info-row">
                              <span className="label">Title:</span>
                              <span className="value">
                                {prof.academicTitle}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="card-actions">
                          <button
                            className="btn-view"
                            onClick={() => navigate(`/professor/${prof._id}`)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
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
              )
            )}
          </div>
        )}

        {/* ADD PROFESSOR TAB */}
        {activeTab === "add-professor" && (
          <div className="section">
            <div className="section-header">
              <h1>Add New Professor</h1>
              <p className="section-subtitle">
                Help grow our community by adding a professor
              </p>
            </div>

            <div className="add-professor-info">
              <p>
                Submit a professor for admin approval. Once approved, they will
                appear in the directory and be available for reviews.
              </p>
            </div>

            <form onSubmit={handleAddProfessor} className="add-professor-form">
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="profName">Professor Name *</label>
                  <input
                    id="profName"
                    type="text"
                    placeholder="Dr. John Smith"
                    value={newProfessor.name}
                    onChange={(e) =>
                      setNewProfessor({ ...newProfessor, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="academicTitle">Academic Title</label>
                  <input
                    id="academicTitle"
                    type="text"
                    placeholder="Assistant Professor, PhD"
                    value={newProfessor.academicTitle}
                    onChange={(e) =>
                      setNewProfessor({
                        ...newProfessor,
                        academicTitle: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-field">
                  <label>Country *</label>
                  <select
                    value={newProfessor.country}
                    onChange={(e) =>
                      setNewProfessor({
                        ...newProfessor,
                        country: e.target.value,
                        university: "",
                      })
                    }
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>University *</label>
                  <select
                    value={newProfessor.university}
                    onChange={(e) =>
                      setNewProfessor({
                        ...newProfessor,
                        university: e.target.value,
                      })
                    }
                    disabled={!newProfessor.country || loadingUniversities}
                    required
                  >
                    <option value="">
                      {loadingUniversities ? "Loading..." : "Select University"}
                    </option>
                    {universities.map((uni, idx) => (
                      <option key={idx} value={uni.name}>
                        {uni.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="department">Department *</label>
                  <input
                    id="department"
                    type="text"
                    placeholder="Computer Science"
                    value={newProfessor.department}
                    onChange={(e) =>
                      setNewProfessor({
                        ...newProfessor,
                        department: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  Submit for Approval
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setActiveTab("dashboard")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
