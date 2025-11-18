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
  const [subjects, setSubjects] = useState([]);
  const [avgRating, setAvgRating] = useState(0);

  // ⭐ Updated fields: rating, comment, semester, subject
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: "",
    semester: "",
    subject: "",
  });

  const token = localStorage.getItem("token");

  const loadDetails = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/review/professor/${id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      setProfessor(res.data.professor);
      setReviews(res.data.reviews || []);
      setSubjects(res.data.subjects || []);
      setAvgRating(res.data.avgRating?.toFixed(1) || 0);
    } catch (err) {
      console.error("❌ Error loading details:", err);
      toast.error("Failed to load professor details.");
    }
  }, [id, token]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const submitReview = async (e) => {
    e.preventDefault();

    if (!newReview.comment.trim()) {
      return toast.warning("Please enter a comment before submitting!");
    }
    if (!newReview.semester.trim()) {
      return toast.warning("Please enter the semester!");
    }
    if (!newReview.subject.trim()) {
      return toast.warning("Please enter the subject!");
    }

    try {
      await axios.post(
        "http://localhost:5000/api/review/add",
        { ...newReview, professorId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Review submitted successfully!");

      // Reset form
      setNewReview({
        rating: 5,
        comment: "",
        semester: "",
        subject: "",
      });

      loadDetails();
    } catch (err) {
      console.error("Review submission failed:", err);
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
          {/* ===================== Professor Info ===================== */}
          <div className="prof-header">
            <div className="prof-info-card">
              <h2 className="prof-name">{professor.name}</h2>
              <p><strong>University:</strong> {professor.university || "N/A"}</p>
              <p><strong>Department:</strong> {professor.department || "N/A"}</p>
              <p><strong>Country:</strong> {professor.country || "N/A"}</p>
              {professor.academicTitle && (
                <p><strong>Academic Title:</strong> {professor.academicTitle}</p>
              )}
              {professor.experienceYears && (
                <p><strong>Experience:</strong> {professor.experienceYears} years</p>
              )}
              {professor.major && <p><strong>Major:</strong> {professor.major}</p>}
              {professor.bio && <p><strong>Bio:</strong> {professor.bio}</p>}
              <p><strong>Profile Views:</strong> {professor.profileViews || 0}</p>

              <div className="avg-rating">
                ⭐ <strong>Average Rating:</strong> {avgRating}
              </div>

              {/* Social Links */}
              <div className="social-links">
                {professor.socialLinks?.linkedin && (
                  <p>
                    <strong>LinkedIn:</strong>{" "}
                    <a href={professor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      {professor.socialLinks.linkedin}
                    </a>
                  </p>
                )}
                {professor.socialLinks?.researchGate && (
                  <p>
                    <strong>ResearchGate:</strong>{" "}
                    <a href={professor.socialLinks.researchGate} target="_blank" rel="noopener noreferrer">
                      {professor.socialLinks.researchGate}
                    </a>
                  </p>
                )}
                {professor.socialLinks?.googleScholar && (
                  <p>
                    <strong>Google Scholar:</strong>{" "}
                    <a href={professor.socialLinks.googleScholar} target="_blank" rel="noopener noreferrer">
                      {professor.socialLinks.googleScholar}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ===================== Subjects Section ===================== */}
          <div className="subjects-section">
            <h3>Subjects</h3>
            {subjects.length === 0 ? (
              <p>No subjects added by this professor.</p>
            ) : (
              <div className="subjects-list">
                {subjects.map((s) => (
                  <div key={s._id} className="subject-card">
                    <h4>{s.subjectName}</h4>
                    <p>{s.description || "No description"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ===================== Review Form ===================== */}
          {token && (
            <div className="review-section">
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

                <label>Semester</label>
                <input
                  type="text"
                  placeholder="e.g., Fall 2024"
                  value={newReview.semester}
                  onChange={(e) =>
                    setNewReview({ ...newReview, semester: e.target.value })
                  }
                  required
                />

                <label>Subject</label>
                <input
                  type="text"
                  placeholder="e.g., Data Structures"
                  value={newReview.subject}
                  onChange={(e) =>
                    setNewReview({ ...newReview, subject: e.target.value })
                  }
                  required
                />

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
            </div>
          )}

          {/* ===================== Reviews List ===================== */}
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

                  <p>
                    <strong>Semester:</strong> {r.semester || "N/A"}
                  </p>

                  <p>
                    <strong>Subject:</strong> {r.subject || "N/A"}
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
