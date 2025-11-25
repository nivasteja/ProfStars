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
    confirmPassword: "",
    role: "student",
    country: "",
    university: "",
    department: "",
    academicTitle: "",
    experienceYears: "",
    major: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    if (formData.country) {
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
  }, [formData.country]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = "Please select a country";
    }

    // University validation
    if (!formData.university.trim()) {
      newErrors.university = "Please select or enter a university";
    }

    // Role-specific validations
    if (formData.role === "professor") {
      if (!formData.department.trim()) {
        newErrors.department = "Department is required";
      }
      if (formData.experienceYears && formData.experienceYears < 0) {
        newErrors.experienceYears = "Experience years cannot be negative";
      }
    }

    if (formData.role === "student") {
      if (!formData.major.trim()) {
        newErrors.major = "Major/Field of study is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

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
    const value = e.target.value;
    setCustomUniversity(value);
    setFormData({ ...formData, university: value });
    if (errors.university) {
      setErrors({ ...errors, university: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
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

      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...submitData } = formData;

      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        submitData
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
          <div className="form-field">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? "error" : ""}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-field">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-field">
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 chars, uppercase, lowercase, number)"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
            />
            {errors.password && (
              <span className="error-text">{errors.password}</span>
            )}
          </div>

          <div className="form-field">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "error" : ""}
            />
            {errors.confirmPassword && (
              <span className="error-text">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-field">
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="student">Student</option>
              <option value="professor">Professor</option>
            </select>
          </div>

          <div className="form-field">
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              disabled={loadingCountries}
              className={errors.country ? "error" : ""}
            >
              <option value="">
                {loadingCountries ? "Loading Countries..." : "Select Country *"}
              </option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.country && (
              <span className="error-text">{errors.country}</span>
            )}
          </div>

          {universities.length > 0 ? (
            <>
              <div className="form-field">
                <select
                  name="university"
                  value={showCustomUniversity ? "other" : formData.university}
                  onChange={handleChange}
                  disabled={loadingUniversities}
                  className={errors.university ? "error" : ""}
                >
                  <option value="">Select University *</option>
                  {universities.map((uni, index) => (
                    <option key={`${uni.name}-${index}`} value={uni.name}>
                      {uni.name}
                    </option>
                  ))}
                  <option value="other">Other (Not Listed)</option>
                </select>
                {errors.university && !showCustomUniversity && (
                  <span className="error-text">{errors.university}</span>
                )}
              </div>

              {showCustomUniversity && (
                <div className="form-field">
                  <input
                    type="text"
                    placeholder="Enter Your University Name *"
                    value={customUniversity}
                    onChange={handleCustomUniversityChange}
                    className={errors.university ? "error" : ""}
                  />
                  {errors.university && (
                    <span className="error-text">{errors.university}</span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="form-field">
              <input
                type="text"
                name="university"
                placeholder={
                  !formData.country
                    ? "Select Country First"
                    : loadingUniversities
                    ? "Loading Universities..."
                    : "Enter University Name *"
                }
                value={formData.university}
                onChange={handleChange}
                disabled={!formData.country || loadingUniversities}
                className={errors.university ? "error" : ""}
              />
              {errors.university && (
                <span className="error-text">{errors.university}</span>
              )}
            </div>
          )}

          {formData.role === "professor" && (
            <>
              <div className="form-field">
                <input
                  type="text"
                  name="department"
                  placeholder="Department *"
                  value={formData.department}
                  onChange={handleChange}
                  className={errors.department ? "error" : ""}
                />
                {errors.department && (
                  <span className="error-text">{errors.department}</span>
                )}
              </div>

              <div className="form-field">
                <input
                  type="text"
                  name="academicTitle"
                  placeholder="Academic Title (e.g., Lecturer, Professor)"
                  value={formData.academicTitle}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <input
                  type="number"
                  name="experienceYears"
                  placeholder="Years of Experience"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  min="0"
                  className={errors.experienceYears ? "error" : ""}
                />
                {errors.experienceYears && (
                  <span className="error-text">{errors.experienceYears}</span>
                )}
              </div>
            </>
          )}

          {formData.role === "student" && (
            <div className="form-field">
              <input
                type="text"
                name="major"
                placeholder="Major / Field of Study *"
                value={formData.major}
                onChange={handleChange}
                className={errors.major ? "error" : ""}
              />
              {errors.major && (
                <span className="error-text">{errors.major}</span>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="submit-btn-full">
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
