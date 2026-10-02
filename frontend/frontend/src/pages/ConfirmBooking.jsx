import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
  TrainFront,
  User,
  WalletCards,
} from "lucide-react";

function ConfirmBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    train,
    from,
    to,
    date,
    seats = [],
    seatClass = "3A",
    passengers = [],
    contact = {},
    totalAmount = 0,
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] =
    useState("upi");

  const [processing, setProcessing] =
    useState(false);

  const [paymentError, setPaymentError] =
    useState("");

  const handleConfirmBooking = () => {
    setPaymentError("");

    if (!paymentMethod) {
      setPaymentError(
        "Please select a payment method."
      );
      return;
    }

    setProcessing(true);

    setTimeout(() => {
      setProcessing(false);

      navigate("/booking-success", {
        state: {
          train,
          from,
          to,
          date,
          seats,
          seatClass,
          passengers,
          contact,
          totalAmount,
          paymentMethod,
        },
      });
    }, 1200);
  };

  if (!train || seats.length === 0) {
    return (
      <main className="booking-page">
        <section className="empty-results">
          <TrainFront size={46} />

          <h2>Booking information unavailable</h2>

          <p>
            Please complete the previous booking
            steps before confirming your ticket.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            Start New Booking
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="booking-page">
      <section className="booking-hero">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back to Passenger Details
        </button>

        <div className="booking-heading">
          <div>
            <span className="section-label">
              STEP 3 OF 3
            </span>

            <h1>Confirm Your Booking</h1>

            <p>
              Review your journey and payment
              details before confirming.
            </p>
          </div>

          <div className="booking-train-card">
            <div className="train-icon">
              <TrainFront size={22} />
            </div>

            <div>
              <strong>{train.name}</strong>

              <span>
                #{train.number} · {seatClass}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="step-indicator">
        <div className="step completed">
          <span>
            <CheckCircle2 size={15} />
          </span>
          <strong>Seats</strong>
        </div>

        <div className="step-line active"></div>

        <div className="step completed">
          <span>
            <CheckCircle2 size={15} />
          </span>
          <strong>Passenger</strong>
        </div>

        <div className="step-line active"></div>

        <div className="step active">
          <span>3</span>
          <strong>Confirm</strong>
        </div>
      </section>

      <section className="journey-summary">
        <div className="journey-summary-route">
          <div>
            <span>FROM</span>
            <strong>{from}</strong>
          </div>

          <ArrowRight size={20} />

          <div>
            <span>TO</span>
            <strong>{to}</strong>
          </div>
        </div>

        <div className="journey-summary-date">
          <CalendarDays size={18} />

          <div>
            <span>Journey Date</span>
            <strong>{date}</strong>
          </div>
        </div>

        <div className="journey-summary-info">
          <span>Seats</span>

          <strong>
            {seats.join(", ")}
          </strong>
        </div>
      </section>

      <section className="confirm-layout">
        <div className="confirm-main">
          <div className="confirm-card">
            <div className="confirm-card-header">
              <div>
                <span className="section-label">
                  JOURNEY DETAILS
                </span>

                <h2>Your Train</h2>
              </div>

              <TrainFront size={26} />
            </div>

            <div className="confirm-train-info">
              <div className="confirm-train-name">
                <div className="train-icon">
                  <TrainFront size={22} />
                </div>

                <div>
                  <h3>{train.name}</h3>

                  <span>
                    Train #{train.number} ·{" "}
                    {train.type}
                  </span>
                </div>
              </div>

              <div className="confirm-route">
                <div>
                  <span>
                    {train.departure}
                  </span>

                  <strong>{from}</strong>
                </div>

                <div className="confirm-route-line">
                  <span>
                    {train.duration}
                  </span>

                  <div></div>
                </div>

                <div>
                  <span>
                    {train.arrival}
                  </span>

                  <strong>{to}</strong>
                </div>
              </div>
            </div>

            <div className="confirm-info-grid">
              <div>
                <span>Journey Date</span>
                <strong>{date}</strong>
              </div>

              <div>
                <span>Class</span>
                <strong>{seatClass}</strong>
              </div>

              <div>
                <span>Selected Seats</span>
                <strong>
                  {seats.join(", ")}
                </strong>
              </div>

              <div>
                <span>Duration</span>
                <strong>
                  {train.duration}
                </strong>
              </div>
            </div>
          </div>

          <div className="confirm-card">
            <div className="confirm-card-header">
              <div>
                <span className="section-label">
                  PASSENGERS
                </span>

                <h2>Passenger Details</h2>
              </div>

              <User size={25} />
            </div>

            <div className="confirm-passengers">
              {passengers.map(
                (passenger, index) => (
                  <div
                    className="confirm-passenger"
                    key={passenger.seat}
                  >
                    <div className="passenger-avatar">
                      {index + 1}
                    </div>

                    <div>
                      <strong>
                        {passenger.name}
                      </strong>

                      <span>
                        {passenger.age} years ·{" "}
                        {passenger.gender}
                      </span>
                    </div>

                    <div className="passenger-seat">
                      Seat{" "}
                      <strong>
                        {passenger.seat}
                      </strong>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="confirm-card">
            <div className="confirm-card-header">
              <div>
                <span className="section-label">
                  CONTACT DETAILS
                </span>

                <h2>Booking Contact</h2>
              </div>

              <Mail size={24} />
            </div>

            <div className="contact-summary">
              <div>
                <Mail size={18} />

                <div>
                  <span>Email</span>
                  <strong>
                    {contact.email}
                  </strong>
                </div>
              </div>

              <div>
                <Phone size={18} />

                <div>
                  <span>Mobile</span>
                  <strong>
                    +91 {contact.phone}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="confirm-card payment-card">
            <div className="confirm-card-header">
              <div>
                <span className="section-label">
                  PAYMENT
                </span>

                <h2>Select Payment Method</h2>
              </div>

              <LockKeyhole size={23} />
            </div>

            <div className="payment-options">
              <button
                type="button"
                className={
                  paymentMethod === "upi"
                    ? "payment-option active"
                    : "payment-option"
                }
                onClick={() =>
                  setPaymentMethod("upi")
                }
              >
                <div className="payment-icon">
                  <Smartphone size={22} />
                </div>

                <div>
                  <strong>UPI</strong>

                  <span>
                    Google Pay, PhonePe, Paytm
                  </span>
                </div>

                <span className="payment-radio">
                  {paymentMethod ===
                    "upi" && <span />}
                </span>
              </button>

              <button
                type="button"
                className={
                  paymentMethod === "card"
                    ? "payment-option active"
                    : "payment-option"
                }
                onClick={() =>
                  setPaymentMethod("card")
                }
              >
                <div className="payment-icon">
                  <CreditCard size={22} />
                </div>

                <div>
                  <strong>
                    Credit / Debit Card
                  </strong>

                  <span>
                    Visa, Mastercard, RuPay
                  </span>
                </div>

                <span className="payment-radio">
                  {paymentMethod ===
                    "card" && <span />}
                </span>
              </button>

              <button
                type="button"
                className={
                  paymentMethod === "wallet"
                    ? "payment-option active"
                    : "payment-option"
                }
                onClick={() =>
                  setPaymentMethod("wallet")
                }
              >
                <div className="payment-icon">
                  <WalletCards size={22} />
                </div>

                <div>
                  <strong>
                    Wallet
                  </strong>

                  <span>
                    Use your preferred wallet
                  </span>
                </div>

                <span className="payment-radio">
                  {paymentMethod ===
                    "wallet" && <span />}
                </span>
              </button>
            </div>

            {paymentError && (
              <div className="form-error">
                {paymentError}
              </div>
            )}
          </div>
        </div>

        <aside className="booking-summary-card confirm-summary">
          <div className="summary-card-header">
            <span className="section-label">
              FARE SUMMARY
            </span>

            <h2>Payment Summary</h2>
          </div>

          <div className="summary-route">
            <div>
              <span>FROM</span>
              <strong>{from}</strong>
            </div>

            <ArrowRight size={18} />

            <div>
              <span>TO</span>
              <strong>{to}</strong>
            </div>
          </div>

          <div className="summary-details">
            <div>
              <span>Train</span>
              <strong>
                {train.name}
              </strong>
            </div>

            <div>
              <span>Passengers</span>
              <strong>
                {passengers.length}
              </strong>
            </div>

            <div>
              <span>Seats</span>
              <strong>
                {seats.join(", ")}
              </strong>
            </div>

            <div>
              <span>Class</span>
              <strong>{seatClass}</strong>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="fare-row">
            <span>Ticket Fare</span>

            <strong>
              ₹{Math.max(0, totalAmount - 20)}
            </strong>
          </div>

          <div className="fare-row">
            <span>Convenience Fee</span>

            <strong>₹20</strong>
          </div>

          <div className="fare-row total">
            <span>Total Payable</span>

            <strong>
              ₹{totalAmount}
            </strong>
          </div>

          <button
            className="continue-btn"
            onClick={handleConfirmBooking}
            disabled={processing}
          >
            {processing
              ? "Processing..."
              : "Confirm & Pay"}

            {!processing && (
              <ArrowRight size={18} />
            )}
          </button>

          <div className="secure-note">
            <ShieldCheck size={17} />

            <span>
              Secure payment processing
            </span>
          </div>

          <div className="payment-security">
            <LockKeyhole size={16} />

            <span>
              Your payment information is
              protected with secure encryption.
            </span>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default ConfirmBooking;
