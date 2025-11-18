// src/components/ReportModal.jsx
import React, { useState } from "react";
import "../styles/Explore.css";
import API from "../api";

const ReportModal = ({ item, onClose }) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitReport = async () => {
    try {
      await API.post("/report", {
        university: item.name,
        reason,
        details
      });
      setSubmitted(true);
      setTimeout(onClose, 1500);
    } catch {
      alert("Failed to submit report.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="report-modal">
        {!submitted ? (
          <>
            <h2>Report Issue</h2>
            <p className="modal-uniname">{item.name}</p>

            <label>Reason</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Select reason...</option>
              <option value="Incorrect Information">Incorrect Information</option>
              <option value="Wrong Website">Wrong Website</option>
              <option value="Duplicate Entry">Duplicate Entry</option>
              <option value="Other">Other</option>
            </select>

            <label>Details (optional)</label>
            <textarea
              rows="3"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />

            <button className="submit-report-btn" onClick={submitReport}>
              Submit Report
            </button>
            <button className="modal-close" onClick={onClose}>Close</button>
          </>
        ) : (
          <h3 className="success-msg">Report submitted ✔</h3>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
