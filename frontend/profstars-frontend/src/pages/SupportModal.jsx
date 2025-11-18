import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
// import "../styles/SupportComponent.css"; // <-- Removed this import to fix the error

// --- Your PayPal Sandbox Client ID ---
const PAYPAL_CLIENT_ID =
  "AccuJelRoykKw59vqOoNKvN2-ntqJbFJarO04A48H01v_7LBm3GS5Hx9EMAOA0T5CHjIeKx069dzT6F0";
const PAYPAL_CURRENCY = "USD";

// --- NEW: Added all styles directly into the component ---
// This avoids the build error by making the component self-contained.
const SupportStyles = () => (
  <style>
    {`
      /* --- Support Modal & Button Styles --- */
      .footer-link.support-btn {
        background: #6a0dad; /* Main purple theme color */
        border: none;
        padding: 6px 12px; /* Make it a small button */
        font-family: "Poppins", sans-serif; /* Ensure font matches */
        font-size: 0.85rem; /* Slightly smaller */
        font-weight: 500;
        color: #fff; /* White text */
        cursor: pointer;
        text-decoration: none;
        border-radius: 6px; /* Rounded corners */
        transition: all 0.2s ease;
        line-height: 1.5; /* Add line-height for consistency */
      }
      .footer-link.support-btn:hover {
        background: #580a8f; /* Slightly darker purple on hover */
        color: #fff;
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      /* Modal Overlay */
      .support-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: supportModalFadeIn 0.3s ease;
      }

      /* Modal Content */
      .support-modal-content {
        background: #fff;
        padding: 24px 30px;
        border-radius: 12px;
        max-width: 420px;
        width: 90%;
        position: relative;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        text-align: center;
      }

      /* Modal Close Button */
      .support-modal-close {
        position: absolute;
        top: 12px;
        right: 12px;
        background: #f3f4f6;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        font-size: 1.2rem;
        color: #6b7280;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      .support-modal-close:hover {
        background: #e5e7eb;
        color: #111827;
      }

      /* Modal Header */
      .support-modal-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 12px;
      }
      .support-modal-icon {
        font-size: 2rem;
        color: #6a0dad;
        margin-bottom: 8px;
      }
      .support-modal-title {
        font-size: 1.4rem;
        font-weight: 600;
        color: #111827;
        margin: 0;
      }
      .support-modal-desc {
        font-size: 0.95rem;
        color: #555;
        margin: 0 0 20px;
        line-height: 1.6;
      }

      /* Amount Selector */
      .amount-selector {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-bottom: 25px;
      }

      .amount-btn {
        font-family: "Poppins", sans-serif;
        font-size: 1rem;
        font-weight: 600;
        padding: 12px 20px;
        min-width: 80px;
        border-radius: 8px;
        border: 2px solid #e8d6ff; /* Matches your purple theme */
        color: #6a0dad; /* Matches your purple theme */
        background: #fff;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .amount-btn:hover {
        background-color: #f9f5ff; /* Light purple hover */
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(106, 13, 173, 0.1);
      }
      .amount-btn.active {
        background-color: #6a0dad; /* Your main purple */
        color: #fff;
        border-color: #6a0dad;
      }

      /* PayPal Container */
      .paypal-container {
        max-width: 400px;
        margin: 0 auto;
        position: relative;
        z-index: 1; /* Ensures buttons are clickable */
      }

      /* Note */
      .support-note {
        font-size: 0.8rem;
        color: #777;
        margin-top: 20px;
        font-style: italic;
      }

      @keyframes supportModalFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `}
  </style>
);

const SupportModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [donationAmount, setDonationAmount] = useState(5);
  const [isPayPalReady, setIsPayPalReady] = useState(false);

  // Dynamically load PayPal Script
  useEffect(() => {
    const addPayPalScript = () => {
      if (window.paypal) {
        setIsPayPalReady(true);
        return;
      }
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=${PAYPAL_CURRENCY}`;
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => setIsPayPalReady(true);
      script.onerror = () => {
        toast.error("Failed to load PayPal script. Please try again later.");
      };
      document.body.appendChild(script);
    };

    // Only add the script if the modal is opened for the first time
    if (isOpen && !isPayPalReady) {
      addPayPalScript();
    }
  }, [isOpen, isPayPalReady]);

  // PayPal Button Component
  const PayPalDonationButton = ({ amount }) => {
    useEffect(() => {
      // Re-render buttons when modal is open, SDK is ready, and amount changes
      if (isOpen && isPayPalReady) {
        const container = document.getElementById("paypal-button-container");
        if (container) {
          container.innerHTML = ""; // Clear previous buttons
        }

        window.paypal
          .Buttons({
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    description: "Support for ProfStars",
                    amount: {
                      value: amount.toString(),
                      currency_code: PAYPAL_CURRENCY,
                    },
                  },
                ],
              });
            },
            onApprove: (data, actions) => {
              return actions.order.capture().then((details) => {
                toast.success(
                  `Thank you for your $${details.purchase_units[0].amount.value} donation!`
                );
                setIsOpen(false); // Close modal on success
              });
            },
            onError: (err) => {
              console.error("PayPal Error:", err);
              toast.error("An error occurred with your donation.");
            },
            style: {
              layout: "horizontal",
              tagline: false,
            },
          })
          .render("#paypal-button-container");
      }
    }, [isOpen, isPayPalReady, amount]); // Dependencies

    return <div id="paypal-button-container"></div>;
  };

  return (
    <>
      {/* --- NEW: Render the styles --- */}
      <SupportStyles />

      {/* This is the button that will be placed in your footer */}
      <a
        href="#"
        className="footer-link support-btn"
        onClick={() => setIsOpen(true)}
      >
        Support Us
      </a>

      {/* This is the Modal */}
      {isOpen && (
        <div className="support-modal-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="support-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="support-modal-close"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
            <div className="support-modal-header">
              <div className="support-modal-icon">☕</div>
              <h3 className="support-modal-title">Support ProfStars</h3>
            </div>
            <p className="support-modal-desc">
              If you find our platform helpful, please consider a small donation
              to keep it running.
            </p>

            <div className="amount-selector">
              {[3, 5, 10].map((amount) => (
                <button
                  key={amount}
                  className={`amount-btn ${
                    donationAmount === amount ? "active" : ""
                  }`}
                  onClick={() => setDonationAmount(amount)}
                >
                  ${amount}
                </button>
              ))}
            </div>

            <div className="paypal-container">
              {isPayPalReady ? (
                <PayPalDonationButton amount={donationAmount} />
              ) : (
                <p>Loading donation options...</p>
              )}
            </div>

            <p className="support-note">
              You're in Sandbox (Test) mode. No real money will be charged.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportModal;
