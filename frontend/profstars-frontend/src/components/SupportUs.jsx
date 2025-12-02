import { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/SupportUs.css";

const PAYPAL_CLIENT_ID =
  "AccuJelRoykKw59vqOoNKvN2-ntqJbFJarO04A48H01v_7LBm3GS5Hx9EMAOA0T5CHjIeKx069dzT6F0";

const CURRENCY = "CAD";
const FIXED_AMOUNTS = [3, 5, 10];
const MIN_AMOUNT = 1.0;
const MAX_AMOUNT = 1000.0;
const AUTO_CLOSE_SECONDS = 60;

const IS_SANDBOX = true;

const SupportUs = ({ show, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState(FIXED_AMOUNTS[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [countdown, setCountdown] = useState(AUTO_CLOSE_SECONDS);

  useEffect(() => {
    if (show) {
      setSelectedAmount(FIXED_AMOUNTS[1]);
      setCustomAmount("");
      setIsCustom(false);
      setError("");
      setIsProcessing(false);
      setShowSuccess(false);
      setTransactionDetails(null);
      setCountdown(AUTO_CLOSE_SECONDS);
    }
  }, [show]);

  // Countdown timer for auto-close
  useEffect(() => {
    let timer;
    if (showSuccess && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showSuccess, countdown, onClose]);

  const validateAmount = (amount) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < MIN_AMOUNT) {
      setError(
        `Please enter a valid amount (at least ${MIN_AMOUNT.toFixed(2)} CAD).`
      );
      return false;
    }
    if (numericAmount > MAX_AMOUNT) {
      setError(
        `Maximum donation amount is ${MAX_AMOUNT.toFixed(
          2
        )} CAD. Please contact us for larger donations.`
      );
      return false;
    }
    setError("");
    return true;
  };

  const handleCustomChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value);
      setSelectedAmount(value);
      setIsCustom(true);
      validateAmount(value);
    }
  };

  const selectFixedAmount = (amount) => {
    setIsCustom(false);
    setCustomAmount("");
    setSelectedAmount(amount);
    setError("");
  };

  const selectCustom = () => {
    setIsCustom(true);
    setSelectedAmount(customAmount);
    validateAmount(customAmount);
  };

  const createOrder = (data, actions) => {
    console.log("Creating order...");
    if (!validateAmount(selectedAmount)) {
      return actions.reject();
    }
    const finalAmount = parseFloat(selectedAmount);
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: finalAmount.toFixed(2),
            currency_code: CURRENCY,
          },
          description: "Donation to ProfStars",
        },
      ],
      application_context: {
        shipping_preference: "NO_SHIPPING",
      },
    });
  };

  const generatePDFReceipt = () => {
    if (!transactionDetails) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Colors
    const primaryColor = [106, 13, 173]; // #6a0dad
    const secondaryColor = [147, 51, 234]; // Lighter purple
    const textColor = [33, 33, 33];
    const lightGray = [107, 114, 128];
    const bgGray = [249, 250, 251];

    // Generate unique receipt number
    const timestamp = Date.now().toString().slice(-6);
    const receiptNumber = `PS-${transactionDetails.transactionId
      .slice(0, 8)
      .toUpperCase()}-${timestamp}`;

    // Load and add logo
    const logo = new Image();
    logo.src = "/src/assets/logo.png";

    logo.onload = () => {
      // Add logo and header
      try {
        doc.addImage(logo, "PNG", 20, 15, 20, 20);
      } catch (error) {
        console.warn("Logo could not be loaded:", error);
      }

      // Company name next to logo
      doc.setTextColor(...primaryColor);
      doc.setFontSize(26);
      doc.setFont("helvetica", "bold");
      doc.text("ProfStars", 45, 28);

      // Tagline
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...lightGray);
      doc.text("Empowering Students, Building Community", 45, 34);

      // Receipt title on right
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...textColor);
      doc.text("DONATION RECEIPT", pageWidth - 20, 25, { align: "right" });

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...lightGray);
      doc.text(receiptNumber, pageWidth - 20, 31, { align: "right" });

      // Decorative line
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, 45, pageWidth - 20, 45);

      // Thank you section with background
      doc.setFillColor(...bgGray);
      doc.roundedRect(20, 55, pageWidth - 40, 35, 3, 3, "F");

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text("Thank You for Your Generous Support!", pageWidth / 2, 66, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textColor);
      const impactMessage =
        "Your contribution directly supports our mission to provide students with valuable professor ratings and academic resources. Together, we're building a stronger educational community.";
      const splitImpact = doc.splitTextToSize(impactMessage, pageWidth - 60);
      doc.text(splitImpact, pageWidth / 2, 75, { align: "center" });

      // Transaction Summary Box
      const summaryStartY = 100;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.3);
      doc.roundedRect(20, summaryStartY, pageWidth - 40, 78, 2, 2, "FD");

      // Section header
      doc.setFillColor(...primaryColor);
      doc.rect(20, summaryStartY, pageWidth - 40, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Transaction Details", 25, summaryStartY + 7);

      // Transaction details in two columns
      doc.setTextColor(...textColor);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const detailsY = summaryStartY + 20;
      const lineHeight = 11;
      const col1X = 25;
      const col2X = pageWidth / 2 + 5;

      // Left column
      doc.setFont("helvetica", "bold");
      doc.text("Donation Amount:", col1X, detailsY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(...primaryColor);
      doc.text(
        `${transactionDetails.currency} $${transactionDetails.amount}`,
        col1X,
        detailsY + 7
      );

      doc.setFontSize(10);
      doc.setTextColor(...textColor);
      doc.setFont("helvetica", "bold");
      doc.text("Transaction Date:", col1X, detailsY + lineHeight * 2);
      doc.setFont("helvetica", "normal");
      doc.text(transactionDetails.date, col1X, detailsY + lineHeight * 2 + 7);

      doc.setFont("helvetica", "bold");
      doc.text("Payment Method:", col1X, detailsY + lineHeight * 4);
      doc.setFont("helvetica", "normal");
      doc.text("PayPal", col1X, detailsY + lineHeight * 4 + 7);

      // Right column
      doc.setFont("helvetica", "bold");
      doc.text("Donor Name:", col2X, detailsY);
      doc.setFont("helvetica", "normal");
      doc.text(transactionDetails.payerName, col2X, detailsY + 7);

      doc.setFont("helvetica", "bold");
      doc.text("Email Address:", col2X, detailsY + lineHeight * 2);
      doc.setFont("helvetica", "normal");
      const emailText = doc.splitTextToSize(transactionDetails.payerEmail, 65);
      doc.text(emailText, col2X, detailsY + lineHeight * 2 + 7);

      doc.setFont("helvetica", "bold");
      doc.text("Transaction ID:", col2X, detailsY + lineHeight * 4);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const txnId = doc.splitTextToSize(transactionDetails.transactionId, 65);
      doc.text(txnId, col2X, detailsY + lineHeight * 4 + 7);

      // Status badge
      doc.setFillColor(34, 197, 94); // Green
      doc.roundedRect(pageWidth - 50, summaryStartY + 18, 25, 8, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("PAID", pageWidth - 37.5, summaryStartY + 23.5, {
        align: "center",
      });

      // Organization Details Section
      const orgStartY = summaryStartY + 93;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text("About ProfStars", 20, orgStartY);

      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, orgStartY + 2, 60, orgStartY + 2);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textColor);
      doc.text("ProfStars", 20, orgStartY + 10);
      doc.text("299 Doon Valley Drive", 20, orgStartY + 16);
      doc.text("Kitchener, Ontario, N2G 4M4", 20, orgStartY + 22);
      doc.text("Canada", 20, orgStartY + 28);

      // Contact & Social section
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text("Connect With Us", pageWidth / 2 + 10, orgStartY);

      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(
        pageWidth / 2 + 10,
        orgStartY + 2,
        pageWidth / 2 + 50,
        orgStartY + 2
      );

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...primaryColor);

      // Website
      doc.setTextColor(...textColor);
      doc.text("Website:", pageWidth / 2 + 10, orgStartY + 10);
      doc.setTextColor(...primaryColor);
      doc.textWithLink("profstars.com", pageWidth / 2 + 30, orgStartY + 10, {
        url: "https://profstars.com",
      });

      // GitHub
      doc.setTextColor(...textColor);
      doc.text("GitHub:", pageWidth / 2 + 10, orgStartY + 16);
      doc.setTextColor(...primaryColor);
      doc.textWithLink(
        "github.com/nivasteja/ProfStars",
        pageWidth / 2 + 30,
        orgStartY + 16,
        {
          url: "https://github.com/nivasteja/ProfStars",
        }
      );

      // Facebook
      doc.setTextColor(...textColor);
      doc.text("Facebook:", pageWidth / 2 + 10, orgStartY + 22);
      doc.setTextColor(...primaryColor);
      doc.textWithLink(
        "facebook.com/korra.nivas.7",
        pageWidth / 2 + 30,
        orgStartY + 22,
        {
          url: "https://www.facebook.com/korra.nivas.7",
        }
      );

      doc.setDrawColor(...lightGray);
      doc.setLineWidth(0.3);
      doc.line(20, pageHeight - 32, pageWidth - 20, pageHeight - 32);

      doc.setFontSize(8);
      doc.setTextColor(...lightGray);
      doc.setFont("helvetica", "italic");
      const footerText =
        "This receipt serves as confirmation of your donation. Please retain this document for your records.";
      doc.text(footerText, pageWidth / 2, pageHeight - 25, { align: "center" });

      doc.setFontSize(7);
      doc.setTextColor(...lightGray);
      doc.setFont("helvetica", "italic");
      doc.text(
        "SANDBOX MODE — This is a test transaction (no real money processed).",
        pageWidth / 2,
        pageHeight - 19,
        { align: "center" }
      );

      doc.setFontSize(6);
      doc.text(
        "Questions? Contact us through our website or social media channels.",
        pageWidth / 2,
        pageHeight - 12,
        { align: "center" }
      );

      // Save the PDF
      const fileName = `ProfStars_Receipt_${receiptNumber}.pdf`;
      doc.save(fileName);

      toast.success("Receipt downloaded successfully!", {
        autoClose: 3000,
        position: "top-center",
      });
    };

    logo.onerror = () => {
      console.warn("Logo failed to load, generating PDF without logo");
      // If logo fails, still generate the PDF without it
      // (The rest of the PDF generation code would execute anyway)
      toast.warning("Receipt generated without logo", {
        autoClose: 3000,
        position: "top-center",
      });
    };
  };

  const onApprove = async (data, actions) => {
    setIsProcessing(true);
    console.log("Payment approved, capturing order...", data);

    try {
      const details = await actions.order.capture();
      console.log("Order captured successfully:", details);

      // Get the transaction details
      const transactionId = details.id;
      const payerName =
        details.payer.name.given_name + " " + details.payer.name.surname;
      const amount = details.purchase_units[0].amount.value;
      const currency = details.purchase_units[0].amount.currency_code;

      // Store transaction details for success screen
      setTransactionDetails({
        transactionId,
        payerName,
        amount,
        currency,
        payerEmail: details.payer.email_address,
        date: new Date().toLocaleString(),
      });

      // Log transaction details for debugging
      console.log("Transaction Details:", {
        transactionId,
        payerName,
        payerEmail: details.payer.email_address,
        amount,
        currency,
        status: details.status,
        createTime: details.create_time,
        updateTime: details.update_time,
      });

      // Show success screen
      setShowSuccess(true);
      setIsProcessing(false);
      setCountdown(AUTO_CLOSE_SECONDS); // Reset countdown

      // Show toast notification
      toast.success(
        `🎉 Thank you, ${payerName}! Your donation was successful!`,
        {
          autoClose: 4000,
          position: "top-center",
        }
      );

      return details;
    } catch (error) {
      console.error("Error capturing order:", error);
      setIsProcessing(false);
      toast.error("Failed to complete the transaction. Please try again.");
      throw error;
    }
  };

  const onError = (err) => {
    console.error("PayPal Error:", err);
    setIsProcessing(false);
    toast.error("An error occurred with your donation. Please try again.", {
      autoClose: 5000,
    });
    setError(
      "Donation failed. Please check your details or try another amount."
    );
  };

  const onCancel = (data) => {
    console.log("Payment cancelled by user", data);
    toast.info("Payment was cancelled.", {
      autoClose: 3000,
    });
    setIsProcessing(false);
  };

  if (!show) {
    return null;
  }

  const currentAmount = isCustom ? customAmount : selectedAmount;

  return (
    <PayPalScriptProvider
      options={{
        "client-id": PAYPAL_CLIENT_ID,
        currency: CURRENCY,
        intent: "capture",
        // Enable sandbox mode for testing
        ...(IS_SANDBOX && { "data-sandbox": "true" }),
      }}
    >
      <div className="support-modal-overlay" onClick={onClose}>
        <div
          className="support-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {!showSuccess ? (
            <>
              <button className="support-modal-close" onClick={onClose}>
                ✕
              </button>
              <h2 className="support-modal-title">Support ProfStars</h2>
              <p className="support-modal-desc">
                Your contribution helps keep our community running. Thank you!
              </p>

              <div className="donation-amounts">
                {FIXED_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    className={`amount-btn ${
                      !isCustom && currentAmount === amount ? "selected" : ""
                    }`}
                    onClick={() => selectFixedAmount(amount)}
                    disabled={isProcessing}
                  >
                    ${amount}
                  </button>
                ))}
                <button
                  className={`amount-btn ${isCustom ? "selected" : ""}`}
                  onClick={selectCustom}
                  disabled={isProcessing}
                >
                  Other
                </button>
              </div>

              {isCustom && (
                <div className="custom-amount-wrapper">
                  <span className="currency-symbol">CAD $</span>
                  <input
                    type="text"
                    className="custom-amount-input"
                    placeholder={`min ${MIN_AMOUNT.toFixed(2)}`}
                    value={customAmount}
                    onChange={handleCustomChange}
                    disabled={isProcessing}
                    autoFocus
                  />
                </div>
              )}

              {error && <p className="amount-error">{error}</p>}

              {isProcessing && (
                <p className="processing-message">Processing your payment...</p>
              )}

              <div className="paypal-button-container">
                <PayPalButtons
                  style={{ layout: "vertical", color: "blue", shape: "pill" }}
                  disabled={
                    !!error ||
                    parseFloat(selectedAmount) < MIN_AMOUNT ||
                    isProcessing
                  }
                  forceReRender={[selectedAmount, error]}
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={onError}
                  onCancel={onCancel}
                />
              </div>

              {IS_SANDBOX && (
                <p className="sandbox-notice">
                  Using Sandbox Mode - No real money is being processed.
                </p>
              )}
            </>
          ) : (
            <div className="success-screen">
              <div className="success-checkmark">
                <svg className="checkmark" viewBox="0 0 52 52">
                  <circle
                    className="checkmark-circle"
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                  />
                  <path
                    className="checkmark-check"
                    fill="none"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                  />
                </svg>
              </div>

              <h2 className="success-title">Payment Successful!</h2>
              <p className="success-message">
                Thank you for your generous donation! 🎉
              </p>

              {transactionDetails && (
                <div className="transaction-summary">
                  <div className="summary-row">
                    <span className="summary-label">Amount:</span>
                    <span className="summary-value">
                      {transactionDetails.currency} ${transactionDetails.amount}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Transaction ID:</span>
                    <span className="summary-value transaction-id">
                      {transactionDetails.transactionId}
                    </span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Date:</span>
                    <span className="summary-value">
                      {transactionDetails.date}
                    </span>
                  </div>
                </div>
              )}

              <button
                className="download-receipt-btn"
                onClick={generatePDFReceipt}
              >
                📥 Download Receipt
              </button>

              <p className="countdown-timer">
                Auto-closing in {countdown} second{countdown !== 1 ? "s" : ""}
                ...
              </p>

              <button className="success-close-btn" onClick={onClose}>
                Close Now
              </button>
            </div>
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default SupportUs;
