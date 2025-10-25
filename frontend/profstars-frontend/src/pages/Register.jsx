import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const [countries, setCountries] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [showCustomUniversity, setShowCustomUniversity] = useState(false);
  const [customUniversity, setCustomUniversity] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    country: "",
    university: "",
    department: "",
    academicTitle: "",
    experienceYears: "",
    major: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const res = await axios.get(
          "http://localhost:5000/api/universities/countries"
        );
        setCountries(res.data);
        setLoadingCountries(false);
      } catch (err) {
        console.error("Error loading countries:", err);
        toast.error("Failed to load countries. Please refresh the page.");
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch universities from backend when country changes
  useEffect(() => {
    if (formData.country && formData.role !== "admin") {
      setLoadingUniversities(true);
      setUniversities([]);
      setShowCustomUniversity(false);
      setCustomUniversity("");
      setFormData((prev) => ({ ...prev, university: "" }));

      axios
        .get(
          `http://localhost:5000/api/universities/${encodeURIComponent(
            formData.country
          )}`
        )
        .then((res) => {
          if (res.data && res.data.length > 0) {
            setUniversities(res.data);
          } else {
            setUniversities([]);
            toast.info(`No universities found for ${formData.country}`);
          }
          setLoadingUniversities(false);
        })
        .catch((err) => {
          console.error("Error fetching universities:", err);
          setUniversities([]);
          setLoadingUniversities(false);
          toast.warning("Could not load universities. You can type manually.");
        });
    } else {
      setUniversities([]);
      setShowCustomUniversity(false);
      setCustomUniversity("");
    }
  }, [formData.country, formData.role]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle "Other" selection for university
    if (name === "university" && value === "other") {
      setShowCustomUniversity(true);
      setFormData({ ...formData, university: "" });
    } else if (name === "university" && value !== "other") {
      setShowCustomUniversity(false);
      setCustomUniversity("");
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCustomUniversityChange = (e) => {
    setCustomUniversity(e.target.value);
    setFormData({ ...formData, university: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Admin domain validation
      if (formData.role === "admin") {
        const validDomains = [
          "@profstars.in",
          "@profstars.com",
          "@profstars.ca",
        ];
        const isValidDomain = validDomains.some((d) =>
          formData.email.endsWith(d)
        );
        if (!isValidDomain) {
          toast.error("Admins must use a @profstars.in/.com/.ca email.");
          setLoading(false);
          return;
        }
      }

      // If custom university was entered, save it to database silently
      if (showCustomUniversity && customUniversity.trim()) {
        try {
          await axios.post("http://localhost:5000/api/universities/add", {
            name: customUniversity.trim(),
            country: formData.country,
          });
        } catch (err) {
          console.log("University might already exist:", err);
        }
      }

      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        formData
      );
      toast.success("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wide">
      <ToastContainer />
      <div className="auth-card-wide">
        <h2>Create an Account</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="student">Student</option>
            <option value="professor">Professor</option>
            <option value="admin">Admin</option>
          </select>

          {formData.role !== "admin" && (
            <>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                disabled={loadingCountries}
              >
                <option value="">
                  {loadingCountries ? "Loading Countries..." : "Select Country"}
                </option>
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {universities.length > 0 ? (
                <>
                  <select
                    name="university"
                    value={showCustomUniversity ? "other" : formData.university}
                    onChange={handleChange}
                    required={!showCustomUniversity}
                    disabled={loadingUniversities}
                  >
                    <option value="">Select University</option>
                    {universities.map((uni, index) => (
                      <option key={`${uni.name}-${index}`} value={uni.name}>
                        {uni.name}
                      </option>
                    ))}
                    <option value="other">Other (Not Listed)</option>
                  </select>

                  {showCustomUniversity && (
                    <input
                      type="text"
                      placeholder="Enter Your University Name"
                      value={customUniversity}
                      onChange={handleCustomUniversityChange}
                      required
                    />
                  )}
                </>
              ) : (
                <input
                  type="text"
                  name="university"
                  placeholder={
                    !formData.country
                      ? "Select Country First"
                      : loadingUniversities
                      ? "Loading Universities..."
                      : "Enter University Name"
                  }
                  value={formData.university}
                  onChange={handleChange}
                  required
                  disabled={!formData.country || loadingUniversities}
                />
              )}
            </>
          )}

          {formData.role === "professor" && (
            <>
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="academicTitle"
                placeholder="Academic Title (e.g., Lecturer, Professor)"
                value={formData.academicTitle}
                onChange={handleChange}
              />
              <input
                type="number"
                name="experienceYears"
                placeholder="Years of Experience"
                value={formData.experienceYears}
                onChange={handleChange}
              />
            </>
          )}

          {formData.role === "student" && (
            <input
              type="text"
              name="major"
              placeholder="Major / Field of Study"
              value={formData.major}
              onChange={handleChange}
              required
            />
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
