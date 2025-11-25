// src/components/ReportModal.jsx
import React, { useState } from "react";
import "../styles/ReportModal.css";
import API from "../api";

const REASONS = [
  "Incorrect Information",
  "Broken Website Link",
  "University Does Not Exist",
  "Duplicate Entry",
  "Other",
];

const ReportModal = ({ item, onClose }) => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const submitReport = async () => {
    if (!reason.trim()) {
      alert("Please select a reason.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/reports/add", {
        targetName: item.name,
        targetType: "university",
        reason,
        details,
      });

      alert("Report submitted successfully. Admin will review it soon.");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to submit report.");
    }
    setLoading(false);
  };

  return (
    <div className="report-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <button className="report-close" onClick={onClose}>
          ✕
        </button>

        <h2 className="report-title">Report Issue</h2>
        <p className="report-sub">{item.name}</p>

        <label className="report-label">Reason</label>
        <select
          className="report-select"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        >
          <option value="">Select reason...</option>
          {REASONS.map((r, i) => (
            <option key={i} value={r}>
              {r}
            </option>
          ))}
        </select>

        <label className="report-label">Details (optional)</label>
        <textarea
          className="report-textarea"
          placeholder="Describe the issue..."
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />

        <button
          className="report-submit"
          disabled={loading}
          onClick={submitReport}
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
};

export default ReportModal;
