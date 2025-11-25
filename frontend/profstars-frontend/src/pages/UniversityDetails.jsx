import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Explore.css";

const UniversityDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const university = location.state?.university;

  if (!university) {
    return (
      <div className="explore-container">
        <p className="error-text">
          University details not available. Please return to Explore.
        </p>
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => navigate("/explore")}
            className="pagination-back-btn"
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#6a0dad",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            ← Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const website = university.web_pages?.[0];

  return (
    <div className="explore-container">
      <header className="explore-hero banner-hero">
        <div className="banner-content">
          <h1 className="hero-title">{university.name}</h1>
          <p className="hero-subtitle">
            {university.country} •{" "}
            {university.alpha_two_code || "Academic Institution"}
          </p>
        </div>
      </header>

      <div
        className="explore-grid-new"
        style={{ maxWidth: "800px", marginTop: "10px" }}
      >
        <div className="explore-card-new">
          <div className="uni-icon">🏫</div>
          <h3>{university.name}</h3>
          <p>{university.country}</p>

          {website && (
            <p style={{ marginTop: "10px" }}>
              Official Website:{" "}
              <a
                href={website}
                className="visit-link"
                target="_blank"
                rel="noreferrer"
              >
                {website}
              </a>
            </p>
          )}

          {university.domains && university.domains.length > 0 && (
            <p style={{ marginTop: "8px", fontSize: "0.9rem" }}>
              Domains: {university.domains.join(", ")}
            </p>
          )}

          <button
            onClick={() => navigate("/explore")}
            style={{
              marginTop: "18px",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              background: "#6a0dad",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            ← Back to Explore
          </button>
        </div>
      </div>
    </div>
  );
};

export default UniversityDetails;
