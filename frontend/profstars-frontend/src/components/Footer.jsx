import { useState } from "react";
import { toast } from "react-toastify";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
} from "lucide-react";
import SupportUs from "./SupportUs.jsx";
import "../styles/Footer.css";

const Footer = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = (type) => setActiveModal(type);
  const closeModal = () => setActiveModal(null);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.warn("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        "Thank you for reaching out! Our team will contact you via email within 24-48 hours.",
        { autoClose: 5000 }
      );
      setContactForm({ name: "", email: "", message: "" });
      closeModal();
    }, 1500);
  };

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <span className="footer-logo">ProfStars</span>
            <p className="footer-tagline">
              Empowering students with transparent academic insights.
            </p>
          </div>

          <div className="footer-links-section">
            <h4 className="footer-heading">Quick Links</h4>
            <nav className="footer-nav" aria-label="Footer navigation">
              <button
                className="footer-link-btn"
                onClick={() => openModal("terms")}
                aria-label="View Terms of Service"
              >
                Terms of Service
              </button>
              <button
                className="footer-link-btn"
                onClick={() => openModal("privacy")}
                aria-label="View Privacy Policy"
              >
                Privacy Policy
              </button>
              <button
                className="footer-link-btn"
                onClick={() => openModal("contact")}
                aria-label="Contact Us"
              >
                Contact Us
              </button>
              <button
                className="footer-link-btn"
                onClick={() => setShowSupportModal(true)}
                aria-label="Support Us"
              >
                Support Us
              </button>
            </nav>
          </div>

          <div className="footer-social-section">
            <h4 className="footer-heading">Connect With Us</h4>
            <div className="social-links">
              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Follow us on Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Follow us on Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Follow us on Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Subscribe to our YouTube channel"
              >
                <Youtube size={20} />
              </a>
              <a
                href="mailto:admin@profstars.com"
                className="social-link"
                aria-label="Email us"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ProfStars. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Terms Modal */}
      {activeModal === "terms" && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-title"
        >
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={closeModal}
              aria-label="Close modal"
            >
              ✕
            </button>
            <h2 id="terms-title" className="modal-title">
              Terms of Service
            </h2>
            <div className="modal-body">
              <p>
                <strong>Last Updated:</strong> January 2025
              </p>

              <h3>1. Acceptance of Terms</h3>
              <p>
                By accessing and using ProfStars, you agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do
                not use our platform.
              </p>

              <h3>2. User Accounts</h3>
              <p>
                You are responsible for maintaining the confidentiality of your
                account credentials. You must provide accurate and complete
                information when creating an account. You are solely responsible
                for all activities that occur under your account.
              </p>

              <h3>3. User Conduct</h3>
              <p>When using ProfStars, you agree to:</p>
              <ul>
                <li>
                  Provide honest and constructive reviews based on genuine
                  experiences
                </li>
                <li>
                  Respect the privacy and dignity of professors and other users
                </li>
                <li>Not post defamatory, abusive, or discriminatory content</li>
                <li>Not manipulate ratings or create fake reviews</li>
                <li>Not use the platform for any illegal purposes</li>
              </ul>

              <h3>4. Content Guidelines</h3>
              <p>
                Reviews should be factual, respectful, and relevant to academic
                performance. We reserve the right to remove content that
                violates our guidelines without notice.
              </p>

              <h3>5. Intellectual Property</h3>
              <p>
                All content, design, and functionality of ProfStars are owned by
                us and protected by intellectual property laws. You may not
                copy, modify, or distribute our content without permission.
              </p>

              <h3>6. Limitation of Liability</h3>
              <p>
                ProfStars is provided "as is" without warranties. We are not
                liable for any damages arising from your use of the platform or
                reliance on user-generated content.
              </p>

              <h3>7. Changes to Terms</h3>
              <p>
                We may update these terms at any time. Continued use of
                ProfStars after changes constitutes acceptance of the new terms.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {activeModal === "privacy" && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-title"
        >
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={closeModal}
              aria-label="Close modal"
            >
              ✕
            </button>
            <h2 id="privacy-title" className="modal-title">
              Privacy Policy
            </h2>
            <div className="modal-body">
              <p>
                <strong>Last Updated:</strong> January 2025
              </p>

              <h3>1. Information We Collect</h3>
              <p>
                <strong>Personal Information:</strong>
              </p>
              <ul>
                <li>Name and email address when you create an account</li>
                <li>University and academic information (for professors)</li>
                <li>Reviews and ratings you submit</li>
              </ul>
              <p>
                <strong>Automatically Collected:</strong>
              </p>
              <ul>
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Usage patterns and preferences</li>
              </ul>

              <h3>2. How We Use Your Information</h3>
              <ul>
                <li>To provide and improve our services</li>
                <li>To personalize your experience</li>
                <li>To communicate with you about updates and features</li>
                <li>To ensure platform security and prevent fraud</li>
                <li>To analyze usage trends and improve functionality</li>
              </ul>

              <h3>3. Information Sharing</h3>
              <p>
                We do not sell your personal information. We may share data with
                service providers who assist in operating our platform, or when
                required by law.
              </p>

              <h3>4. Data Security</h3>
              <p>
                We implement industry-standard security measures to protect your
                information. However, no method of transmission over the
                internet is 100% secure.
              </p>

              <h3>5. Your Rights</h3>
              <p>You have the right to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your account</li>
                <li>Opt out of marketing communications</li>
              </ul>

              <h3>6. Cookies</h3>
              <p>
                We use cookies to enhance your experience. You can manage cookie
                preferences through your browser settings.
              </p>

              <h3>7. Contact Us</h3>
              <p>
                For privacy-related inquiries, please contact us through our
                Contact form or email us at privacy@profstars.com.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {activeModal === "contact" && (
        <div
          className="modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-title"
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={closeModal}
              aria-label="Close modal"
            >
              ✕
            </button>
            <h2 id="contact-title" className="modal-title">
              Contact Us
            </h2>
            <p className="modal-subtitle">
              Have questions or feedback? We'd love to hear from you!
            </p>
            <form onSubmit={handleContactSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="contact-name">Your Name</label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email Address</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  placeholder="How can we help you?"
                  rows={5}
                  required
                />
              </div>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Support Us Modal */}
      <SupportUs
        show={showSupportModal}
        onClose={() => setShowSupportModal(false)}
      />
    </>
  );
};

export default Footer;
