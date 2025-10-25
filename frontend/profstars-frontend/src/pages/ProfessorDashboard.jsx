import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ProfessorDashboard.css";

const ProfessorDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const token = localStorage.getItem("token");

  // ✅ Fetch profile info
  const loadProfile = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/professor/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setEditData(res.data); // preload edit form
    } catch (err) {
      console.error("❌ Error loading profile:", err);
      toast.error("Failed to load profile");
    }
  }, [token]);

  // ✅ Fetch reviews
  const loadReviews = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/review/my-reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
    } catch (err) {
      console.error("❌ Error loading reviews:", err);
      toast.error("Failed to load reviews");
    }
  }, [token]);

  useEffect(() => {
    loadProfile();
    loadReviews();
  }, [loadProfile, loadReviews]);

  // ✅ Handle input change
  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  // ✅ Update profile info
  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:5000/api/professor/update", editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile updated successfully!");
      setProfile(editData);
      setIsEditing(false);
    } catch (err) {
      console.error("❌ Update failed:", err);
      toast.error("Failed to update profile");
    }
  };

  if (!profile) return <p className="loading">Loading Professor Dashboard...</p>;

  return (
    <div className="prof-dashboard">
      <ToastContainer position="top-right" autoClose={2000} />
      <h1>👨‍🏫 Professor Dashboard</h1>

      {/* ===== Profile Section ===== */}
      <div className="profile-card">
        <h2>My Profile</h2>

        {!isEditing ? (
          <>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>University:</strong> {profile.university || "N/A"}</p>
            <p><strong>Department:</strong> {profile.department || "N/A"}</p>
            <p><strong>Country:</strong> {profile.country || "N/A"}</p>
            <p><strong>Experience:</strong> {profile.experienceYears || 0} years</p>
            <p><strong>⭐ Average Rating:</strong> {profile.avgRating?.toFixed(1) || 0}</p>

            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={saveProfile} className="edit-form">
            <input
              type="text"
              name="name"
              value={editData.name || ""}
              onChange={handleChange}
              placeholder="Name"
              required
            />
            <input
              type="text"
              name="university"
              value={editData.university || ""}
              onChange={handleChange}
              placeholder="University"
            />
            <input
              type="text"
              name="department"
              value={editData.department || ""}
              onChange={handleChange}
              placeholder="Department"
            />
            <input
              type="text"
              name="country"
              value={editData.country || ""}
              onChange={handleChange}
              placeholder="Country"
            />
            <input
              type="number"
              name="experienceYears"
              value={editData.experienceYears || 0}
              onChange={handleChange}
              placeholder="Experience (years)"
            />

            <div className="edit-buttons">
              <button type="submit" className="save-btn">Save</button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ===== Reviews Section ===== */}
      <div className="reviews-card">
        <h2>Student Reviews</h2>
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet.</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r._id} className="review-card">
                <p className="review-header">
                  <strong>{r.studentId?.name || "Anonymous"}</strong> ⭐ {r.rating}
                </p>
                <p className="review-comment">{r.comment}</p>
                <p className="review-date">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorDashboard;
