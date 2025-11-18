import { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import "../styles/SupportUs.css";

const PAYPAL_CLIENT_ID =
  "AccuJelRoykKw59vqOoNKvN2-ntqJbFJarO04A48H01v_7LBm3GS5Hx9EMAOA0T5CHjIeKx069dzT6F0";

const CURRENCY = "CAD";
const FIXED_AMOUNTS = [3, 5, 10];
const MIN_AMOUNT = 1.0;
const MAX_AMOUNT = 1000.0;

const IS_SANDBOX = true;

const SupportUs = ({ show, onClose }) => {
  const [selectedAmount, setSelectedAmount] = useState(FIXED_AMOUNTS[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);

  useEffect(() => {
    if (show) {
      setSelectedAmount(FIXED_AMOUNTS[1]);
      setCustomAmount("");
      setIsCustom(false);
      setError("");
      setIsProcessing(false);
      setShowSuccess(false);
      setTransactionDetails(null);
    }
  }, [show]);

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

      // Show toast notification
      toast.success(
        `🎉 Thank you, ${payerName}! Your donation was successful!`,
        {
          autoClose: 4000,
          position: "top-center",
        }
      );

      // Auto-close modal
      setTimeout(() => {
        onClose();
      }, 5000);

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

              <p className="success-note">Transaction Successful</p>

              <button className="success-close-btn" onClick={onClose}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default SupportUs;
