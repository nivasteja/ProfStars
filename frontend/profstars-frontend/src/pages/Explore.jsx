import React, { useState, useEffect } from "react";
import "../styles/Explore.css";
import API from "../api";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import ReportModal from "../components/ReportModal";

const CATEGORY_LIST = [
  "AI",
  "Engineering",
  "Business",
  "Medicine",
  "Arts",
  "Law",
];

const CATEGORY_KEYWORDS = {
  AI: ["technology", "tech", "information", "informatics", "computer"],
  Engineering: ["engineering", "polytechnic", "institute"],
  Business: ["business", "management", "commerce", "economics"],
  Medicine: ["medical", "health", "pharmacy", "hospital", "nursing"],
  Arts: ["arts", "humanities", "design", "fine arts"],
  Law: ["law", "legal"],
};

const ITEMS_PER_PAGE = 9;

const Explore = () => {
  const [view, setView] = useState("universities");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);

  const [data, setData] = useState([]);
  const [liked, setLiked] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [sortBy, setSortBy] = useState("relevance");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showReport, setShowReport] = useState(null);

  const navigate = useNavigate();

  /* ---------------- LOAD COUNTRIES ---------------- */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/universities/countries");
        setCountries(res.data || []);
      } catch {
        setCountries(["Canada", "United States", "United Kingdom"]);
      }
    };
    load();
  }, []);

  /* ---------------- LOAD DATA ---------------- */
  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      if (view === "professors") {
        const res = await API.get("/professor/recent");
        setData(res.data || []);
      } else {
        const targetCountry = country || "Canada";
        const res = await API.get(
          `/universities/${encodeURIComponent(targetCountry)}`
        );
        setData(res.data || []);
      }
    } catch {
      setError("Failed to load data. Try again.");
    } finally {
      setLoading(false);
      setPage(1);
    }
  };

  useEffect(() => {
    loadData();
  }, [view, country]);

  /* ---------------- FILTERING ---------------- */
  let filtered = [...data];

  if (query.trim()) {
    const q = query.toLowerCase();
    filtered = filtered.filter((item) => item.name?.toLowerCase().includes(q));
  }

  if (activeCategory) {
    if (view === "professors") {
      const cat = activeCategory.toLowerCase();
      filtered = filtered.filter((item) => {
        const dept = item.department?.toLowerCase() || "";
        const uni = item.university?.toLowerCase() || "";
        return dept.includes(cat) || uni.includes(cat);
      });
    } else {
      const keywords = CATEGORY_KEYWORDS[activeCategory] || [];
      filtered = filtered.filter((item) => {
        const name = item.name?.toLowerCase() || "";
        return keywords.some((k) => name.includes(k));
      });
    }
  }

  /* ---------------- SORTING (NO DOMAIN SORTING) ---------------- */
  if (sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortBy === "rating" && view === "professors") {
    filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
  }

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const nextPage = () => {
    if (page < totalPages) setPage((p) => p + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevPage = () => {
    if (page > 1) setPage((p) => p - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------- BADGES ---------------- */
  const getBadges = (item) => {
    const badges = [];

    if (view === "professors") {
      if (item.averageRating >= 4.5)
        badges.push({ label: "Top Rated", color: "#facc15" });
    } else {
      if (
        item.web_pages?.[0]?.includes(".edu") ||
        item.web_pages?.[0]?.includes(".ac")
      )
        badges.push({ label: "Verified", color: "#22c55e" });
    }

    return badges;
  };

  /* ---------------- SKELETON ---------------- */
  const renderSkeletonGrid = () => (
    <div className="explore-grid-new">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="explore-card-new skeleton-card">
          <div className="skeleton-avatar shimmer" />
          <div className="skeleton-line full shimmer" />
          <div className="skeleton-line medium shimmer" />
        </div>
      ))}
    </div>
  );

  /* ---------------- OPEN DETAILS ---------------- */
  const openUniversityDetails = (uni) => {
    navigate("/university-details", { state: { university: uni } });
  };

  /* ==================== RENDER ==================== */
  return (
    <div className="explore-container">
      {/* HERO */}
      <header className="explore-hero banner-hero">
        <h1 className="hero-title">Explore Academia, Globally</h1>
        <p className="hero-subtitle">
          Discover professors, universities, and insights that shape education.
        </p>
      </header>

      {/* CATEGORY CHIPS */}
      <div className="category-chips">
        {CATEGORY_LIST.map((cat) => (
          <button
            key={cat}
            className={activeCategory === cat ? "chip active" : "chip"}
            onClick={() =>
              setActiveCategory((prev) => (prev === cat ? "" : cat))
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder={`Search ${view}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {view === "universities" && (
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">Country</option>
            {countries.map((c, idx) => (
              <option key={idx} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        {/* SORT OPTIONS — domain removed */}
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="relevance">Relevance</option>
          <option value="name">Name (A–Z)</option>

          {view === "professors" && (
            <option value="rating">Rating (High → Low)</option>
          )}
        </select>

        {/* VIEW TABS */}
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
      </div>

      {/* GRID */}
      {loading ? (
        renderSkeletonGrid()
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : (
        <motion.div
          className="explore-grid-new"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {paginated.length === 0 ? (
            <p className="no-results">No results found.</p>
          ) : (
            paginated.map((item, index) => (
              <motion.div
                key={index}
                className="explore-card-new"
                whileHover={{ scale: 1.03 }}
                onClick={() =>
                  view === "universities"
                    ? openUniversityDetails(item)
                    : setSelectedItem(item)
                }
              >
                <div
                  className="like-container"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLiked((prev) =>
                      prev.includes(item.name)
                        ? prev.filter((x) => x !== item.name)
                        : [...prev, item.name]
                    );
                  }}
                >
                  {liked.includes(item.name) ? (
                    <FaHeart className="heart active" />
                  ) : (
                    <FaRegHeart className="heart" />
                  )}
                </div>

                <div className="badge-row">
                  {getBadges(item).map((b, idx) => (
                    <span
                      key={idx}
                      className="badge"
                      style={{ background: b.color }}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>

                {view === "professors" ? (
                  <>
                    <div className="prof-avatar">
                      {item.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3>{item.name}</h3>
                    <p>{item.university}</p>
                    <p>{item.department}</p>
                    {item.averageRating && (
                      <div className="rating">
                        <FaStar /> {item.averageRating.toFixed(1)}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="uni-icon">🏫</div>
                    <h3>{item.name}</h3>
                    <p>{item.country}</p>

                    {item.web_pages?.[0] && (
                      <a
                        href={item.web_pages[0]}
                        className="visit-link"
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Visit Website →
                      </a>
                    )}

                    <button
                      className="report-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReport(item);
                      }}
                    >
                      Report Issue
                    </button>
                  </>
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* PAGINATION */}
      {!loading && filtered.length > ITEMS_PER_PAGE && (
        <div className="pagination">
          <button disabled={page === 1} onClick={prevPage}>
            ← Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button disabled={page === totalPages} onClick={nextPage}>
            Next →
          </button>
        </div>
      )}

      {/* MODALS */}
      {selectedItem && view === "professors" && (
        <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {showReport && (
        <ReportModal item={showReport} onClose={() => setShowReport(null)} />
      )}
    </div>
  );
};

export default Explore;
