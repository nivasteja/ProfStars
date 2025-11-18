import React, { useState } from "react";
import "../styles/Explore.css";
import { universities, professors } from "../data/exploreData";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";

const Explore = () => {
  const [view, setView] = useState("universities");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [liked, setLiked] = useState([]);

  const data = view === "universities" ? universities : professors;

  const filtered = data.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) &&
      (!country || item.country === country)
  );

  const toggleLike = (id) => {
    setLiked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const uniqueCountries = [...new Set(data.map((i) => i.country))];

  return (
    <div className="explore-container">
      {/* HEADER */}
      <header className="explore-hero">
        <h1 className="hero-title">Discover Top Professors & Universities</h1>
        <p className="hero-subtitle">
          Search globally. Compare insights. Find your academic inspiration.
        </p>
      </header>

      {/* FILTERS */}
      <motion.div
        className="filters-box"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <input
          type="text"
          placeholder={`Search ${view}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          <option value="">🌍 All Countries</option>
          {uniqueCountries.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="view-tabs">
          <button
            className={view === "universities" ? "active" : ""}
            onClick={() => setView("universities")}
          >
            🏛 Universities
          </button>
          <button
            className={view === "professors" ? "active" : ""}
            onClick={() => setView("professors")}
          >
            👨‍🏫 Professors
          </button>
        </div>
      </motion.div>

      {/* GRID */}
      <motion.div
        className="explore-grid-new"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {filtered.length === 0 ? (
          <p className="no-results">No results found.</p>
        ) : (
          filtered.map((item) => (
            <motion.div
              key={item.id}
              className="explore-card-new"
              whileHover={{ scale: 1.05 }}
            >
              <div className="like-container" onClick={() => toggleLike(item.id)}>
                {liked.includes(item.id) ? (
                  <FaHeart className="heart active" />
                ) : (
                  <FaRegHeart className="heart" />
                )}
              </div>

              {view === "universities" ? (
                <>
                  <div className="uni-icon">🏫</div>
                  <h3>{item.name}</h3>
                  <p>{item.city}, {item.country}</p>
                  <p className="meta">
                    {item.type} — Founded {item.founded}
                  </p>
                  <a href={item.website} target="_blank" rel="noreferrer">
                    Visit Website →
                  </a>
                </>
              ) : (
                <>
                  <div className="prof-avatar">{item.name[0]}</div>
                  <h3>{item.name}</h3>
                  <p>{item.university}</p>
                  <p>{item.department}</p>
                  <div className="rating">
                    <FaStar /> {item.rating} ({item.reviews})
                  </div>
                </>
              )}
            </motion.div>
          ))
        )}
      </motion.div>

      {/* ANALYTICS */}
      <motion.div
        className="insight-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2>📊 Quick Insights</h2>
        <div className="insight-grid">
          <div className="insight-card">
            <h3>{universities.length}</h3>
            <p>Universities</p>
          </div>
          <div className="insight-card">
            <h3>{professors.length}</h3>
            <p>Professors</p>
          </div>
          <div className="insight-card">
            <h3>{uniqueCountries.length}</h3>
            <p>Countries</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Explore;
