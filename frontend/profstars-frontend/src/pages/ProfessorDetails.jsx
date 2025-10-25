import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/ProfessorDetails.css";

const ProfessorDetails = () => {
  const { id } = useParams();
  const [professor, setProfessor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const token = localStorage.getItem("token");

  // ✅ Memoized data loader (no React hook warnings)
  const loadDetails = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/review/professor/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfessor(res.data.professor);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.avgRating?.toFixed(1) || 0);
    } catch (err) {
      console.error("❌ Error loading details:", err);
      toast.error("Failed to load professor details.");
    }
  }, [id, token]);

  // ✅ Load data on mount and when professor ID changes
  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  // 📝 Submit new review
  const submitReview = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) {
      return toast.warning("Please enter a comment before submitting!");
    }
    try {
      await axios.post(
        "http://localhost:5000/api/review/add",
        { ...newReview, professorId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Review submitted successfully!");
      setNewReview({ rating: 5, comment: "" });
      loadDetails(); // Reload updated reviews
    } catch (err) {
      console.error("❌ Review submission failed:", err);
      toast.error(err.response?.data?.message || "Failed to submit review.");
    }
  };

  return (
    <div className="prof-details">
      <ToastContainer position="top-right" autoClose={2000} />
      {!professor ? (
        <p className="loading">Loading professor details...</p>
      ) : (
        <>
          {/* Professor Info */}
          <div className="prof-header">
            <h2>{professor.name}</h2>
            <p><strong>University:</strong> {professor.university || "N/A"}</p>
            <p><strong>Department:</strong> {professor.department || "N/A"}</p>
            <p><strong>Country:</strong> {professor.country || "N/A"}</p>
            {professor.academicTitle && (
              <p><strong>Academic Title:</strong> {professor.academicTitle}</p>
            )}
            {professor.experienceYears && (
              <p><strong>Experience:</strong> {professor.experienceYears} years</p>
            )}
            <h3>⭐ Average Rating: {avgRating}</h3>
          </div>

          {/* Review Form */}
          <form onSubmit={submitReview} className="review-form">
            <h3>Add Your Review</h3>

            <label htmlFor="rating">Rating</label>
            <select
              id="rating"
              value={newReview.rating}
              onChange={(e) =>
                setNewReview({ ...newReview, rating: Number(e.target.value) })
              }
            >
              {[1, 2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} ⭐
                </option>
              ))}
            </select>

            <label htmlFor="comment">Comment</label>
            <textarea
              id="comment"
              placeholder="Write your feedback..."
              value={newReview.comment}
              onChange={(e) =>
                setNewReview({ ...newReview, comment: e.target.value })
              }
              required
            ></textarea>

            <button type="submit" className="submit-btn">
              Submit Review
            </button>
          </form>

          {/* Reviews Section */}
          <div className="reviews-section">
            <h3>Student Reviews</h3>
            {reviews.length === 0 ? (
              <p className="no-reviews">No reviews yet for this professor.</p>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="review-card">
                  <p className="review-header">
                    <strong>{r.studentId?.name || "Anonymous"}</strong> — ⭐ {r.rating}
                  </p>
                  <p className="review-comment">{r.comment}</p>
                  <p className="review-date">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProfessorDetails;
