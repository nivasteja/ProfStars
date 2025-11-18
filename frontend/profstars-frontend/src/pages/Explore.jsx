// src/pages/Explore.jsx
import React, { useState, useEffect } from "react";
import "../styles/Explore.css";
import API from "../api";
import { FaHeart, FaRegHeart, FaStar, FaFilter, FaMap, FaListUl } from "react-icons/fa";
import { motion } from "framer-motion";
import Modal from "../components/Modal";
import ReportModal from "../components/ReportModal";
import MapView from "../components/MapView";

const CATEGORY_LIST = ["AI", "Engineering", "Business", "Medicine", "Arts", "Law"];

const Explore = () => {
  const [view, setView] = useState("universities");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [categories] = useState(CATEGORY_LIST);
  const [activeCategory, setActiveCategory] = useState("");

  const [countries, setCountries] = useState([]);
  const [data, setData] = useState([]);
  const [liked, setLiked] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [showReport, setShowReport] = useState(null);

  const [mapMode, setMapMode] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Get countries list
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await API.get("/universities/ccountries");
        setCountries(res.data || []);
      } catch {
        setCountries(["Canada", "United States"]);
      }
    }
    fetchCountries();
  }, []);

  // Fetch data
  async function loadData() {
    setLoading(true);
    setError("");

    try {
      if (view === "professors") {
        const res = await API.get("/professor/recent");
        setData(res.data || []);
      } else {
        const res = await API.get(
          country ? `/universities/${country}` : `/universities/Canada`
        );
        setData(res.data || []);
      }
    } catch (err) {
      setError("Failed to load data");
    }

    setLoading(false);
    setPage(1);
  }

  useEffect(() => {
    loadData();
  }, [view, country]);

  // Filter by name
  let filtered = data.filter((item) =>
    item.name?.toLowerCase().includes(query.toLowerCase())
  );

  // Filter by category (only professors)
  if (activeCategory && view === "professors") {
    filtered = filtered.filter((item) =>
      item.department?.toLowerCase().includes(activeCategory.toLowerCase())
    );
  }

  // Final pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Badge logic
  const getBadges = (item) => {
    const badges = [];

    if (item.averageRating >= 4.5) {
      badges.push({ label: "Top Rated ⭐", color: "#FFD700" });
    }
    if (item.web_pages?.[0]?.includes(".edu") || item.web_pages?.[0]?.includes(".ac")) {
      badges.push({ label: "Verified", color: "#4BB543" });
    }

    return badges;
  };

  // Like/unlike
  const toggleLike = (name) => {
    setLiked((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]
    );
  };

  return (
    <div className="explore-container">

      {/* HERO */}
      <header className="explore-hero banner-hero">
        <div className="banner-content">
          <h1 className="hero-title">Explore Academia, Globally</h1>
          <p className="hero-subtitle">
            Discover professors, universities, and insights that shape education.
          </p>
        </div>
      </header>

      {/* CATEGORIES */}
      <div className="category-chips">
        {categories.map((c, i) => (
          <button
            key={i}
            className={activeCategory === c ? "chip active" : "chip"}
            onClick={() =>
              activeCategory === c ? setActiveCategory("") : setActiveCategory(c)
            }
          >
            {c}
          </button>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <button className="filter-toggle">
          <FaFilter /> Filters
        </button>

        <input
          type="text"
          placeholder={`Search ${view}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {view === "universities" && (
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">Select Country</option>
            {countries.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        <div className="view-tabs">
          <button
            className={view === "professors" ? "active" : ""}
            onClick={() => setView("professors")}
          >
            👨‍🏫 Professors
          </button>

          <button
            className={view === "universities" ? "active" : ""}
            onClick={() => setView("universities")}
          >
            🏛 Universities
          </button>
        </div>

        <button className="map-toggle" onClick={() => setMapMode(!mapMode)}>
          {mapMode ? <><FaListUl /> List View</> : <><FaMap /> Map View</>}
        </button>
      </div>

      {/* MAP VIEW */}
      {mapMode ? (
        <MapView universities={filtered} />
      ) : (
        <>
          {/* GRID */}
          {loading ? (
            <p className="loading-text">Loading...</p>
          ) : error ? (
            <p className="error-text">{error}</p>
          ) : (
            <motion.div className="explore-grid-new">
              {paginated.map((item, index) => (
                <motion.div
                  key={index}
                  className="explore-card-new"
                  whileHover={{ scale: 1.05 }}
                >
                  {/* Like */}
                  <div className="like-container" onClick={() => toggleLike(item.name)}>
                    {liked.includes(item.name)
                      ? <FaHeart className="heart active" />
                      : <FaRegHeart className="heart" />
                    }
                  </div>

                  {/* Badges */}
                  <div className="badge-row">
                    {getBadges(item).map((b, idx) => (
                      <span key={idx} className="badge" style={{ background: b.color }}>
                        {b.label}
                      </span>
                    ))}
                  </div>

                  {/* CONTENT */}
                  {view === "professors" ? (
                    <>
                      <div className="prof-avatar">{item.name?.charAt(0)}</div>
                      <h3>{item.name}</h3>
                      <p>{item.university}</p>
                      <p>{item.department}</p>
                    </>
                  ) : (
                    <>
                      <div className="uni-icon">🏫</div>
                      <h3>{item.name}</h3>
                      <p>{item.country}</p>

                      {item.web_pages?.[0] && (
                        <a
                          href={item.web_pages[0]}
                          target="_blank"
                          rel="noreferrer"
                          className="visit-link"
                        >
                          Visit Website →
                        </a>
                      )}

                      {/* REPORT BUTTON */}
                      <button
                        className="report-btn"
                        onClick={() => setShowReport(item)}
                      >
                        ⚠️ Report Issue
                      </button>
                    </>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* PAGINATION */}
          {filtered.length > itemsPerPage && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                ← Prev
              </button>

              <span>Page {page} of {totalPages}</span>

              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* REPORT MODAL */}
      {showReport && (
        <ReportModal item={showReport} onClose={() => setShowReport(null)} />
      )}
    </div>
  );
};

export default Explore;
