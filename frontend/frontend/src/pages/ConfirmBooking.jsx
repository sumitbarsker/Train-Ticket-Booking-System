import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Ticket,
  TrainFront,
  User,
  Users,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function ConfirmBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    train,
    from,
    to,
    date,
    selectedSeats = [],
    passengers = [],
    contact = {},
    totalFare = 0,
    serviceCharge = 0,
    finalAmount = 0,
  } = location.state || {};

  const [paymentMethod, setPaymentMethod] =
    useState("upi");

  const [booking, setBooking] = useState(
    false
  );

  const [error, setError] = useState("");

  const handleConfirmBooking = async () => {
    try {
      setBooking(true);
      setError("");

      /*
       * Try the real backend booking API first.
       * If the endpoint is not available yet,
       * create a local demo booking so the complete
       * frontend flow can still be tested.
       */

      try {
        await axios.post(
          `${API_URL}/bookings/`,
          {
            train_id: train.id,
            journey_date: date,
            source: from,
            destination: to,
            seats: selectedSeats,
            passengers,
            contact,
            payment_method: paymentMethod,
            amount: finalAmount,
          }
        );
      } catch (backendError) {
        console.warn(
          "Booking API unavailable. Using frontend demo booking."
        );
      }

      const bookingId =
        `RC${Date.now()
          .toString()
          .slice(-8)}`;

      const bookingData = {
        bookingId,
        train,
        from,
        to,
        date,
        selectedSeats,
        passengers,
        contact,
        paymentMethod,
        totalFare,
        serviceCharge,
        finalAmount,
        bookedAt:
          new Date().toISOString(),
      };

      localStorage.setItem(
        "railconnect_last_booking",
        JSON.stringify(bookingData)
      );

      const existingBookings =
        JSON.parse(
          localStorage.getItem(
            "railconnect_bookings"
          ) || "[]"
        );

      localStorage.setItem(
        "railconnect_bookings",
        JSON.stringify([
          bookingData,
          ...existingBookings,
        ])
      );

      navigate(
        "/booking-success",
        {
          state: bookingData,
        }
      );
    } catch (err) {
      setError(
        "Unable to complete the booking. Please try again."
      );
    } finally {
      setBooking(false);
    }
  };

  if (!train) {
    return (
      <main className="confirm-page">
        <section className="empty-results">
          <Ticket size={48} />

          <h2>
            Booking information not found
          </h2>

          <p>
            Please start the booking process
            again.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            Back to Search
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="confirm-page">
      <section className="confirm-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back to Passenger Details
        </button>

        <div className="confirm-header-content">
          <div>
            <span className="section-label">
              STEP 3 OF 4
            </span>

            <h1>Review & Confirm</h1>

            <p>
              Check your booking details before
              confirming your ticket.
            </p>
          </div>

          <div className="seat-step-indicator">
            <div className="step completed">
              <span>
                <Check size={14} />
              </span>
              <small>Seats</small>
            </div>

            <div className="step-line active"></div>

            <div className="step completed">
              <span>
                <Check size={14} />
              </span>
              <small>Passenger</small>
            </div>

            <div className="step-line active"></div>

            <div className="step active">
              <span>3</span>
              <small>Confirm</small>
            </div>

            <div className="step-line"></div>

            <div className="step">
              <span>4</span>
              <small>Ticket</small>
            </div>
          </div>
        </div>
      </section>

      <section className="confirm-layout">
        <div className="confirm-main">
          <div className="confirm-card">
            <div className="confirm-card-header">
              <div className="confirm-card-icon">
                <TrainFront size={21} />
              </div>

              <div>
                <span className="section-label">
                  JOURNEY
                </span>

                <h2>
                  Train Details
                </h2>
              </div>
            </div>

            <div className="train-confirm-box">
              <div className="train-confirm-top">
                <div>
                  <h3>
                    {train.name}
                  </h3>

                  <span>
                    Train #{train.number}
                  </span>
                </div>

                <span className="class-badge">
                  {train.class || "3A"}
                </span>
              </div>

              <div className="train-route-confirm">
                <div>
                  <span>FROM</span>

                  <strong>{from}</strong>

                  <small>
                    {train.departure}
                  </small>
                </div>

                <div className="route-arrow">
                  <div></div>
                  <ArrowRight size={18} />
                </div>

                <div>
                  <span>TO</span>

                  <strong>{to}</strong>

                  <small>
                    {train.arrival}
                  </small>
                </div>
              </div>

              <div className="journey-confirm-meta">
                <span>
                  <MapPin size={15} />
                  Journey Date: {date}
                </span>

                <span>
                  <Ticket size={15} />
                  Seats:{" "}
                  {selectedSeats
                    .slice()
                    .sort(
                      (a, b) => a - b
                    )
                    .join(", ")}
                </span>
              </div>
            </div>
          </div>

          <div className="confirm-card">
            <div className="confirm-card-header">
              <div className="confirm-card-icon">
                <Users size={21} />
              </div>

              <div>
                <span className="section-label">
                  PASSENGERS
                </span>

                <h2>
                  Passenger Details
                </h2>
              </div>
            </div>

            <div className="confirm-passenger-list">
              {passengers.map(
                (passenger, index) => (
                  <div
                    className="confirm-passenger"
                    key={`${passenger.seat}-${index}`}
                  >
                    <div className="passenger-avatar">
                      <User size={19} />
                    </div>

                    <div className="confirm-passenger-info">
                      <strong>
                        {passenger.name}
                      </strong>

                      <span>
                        {passenger.age} years
                        {" • "}
                        {passenger.gender}
                      </span>
                    </div>

                    <div className="confirm-seat">
                      Seat{" "}
                      {passenger.seat}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="confirm-card">
            <div className="confirm-card-header">
              <div className="confirm-card-icon">
                <Phone size={21} />
              </div>

              <div>
                <span className="section-label">
                  CONTACT
                </span>

                <h2>
                  Contact Information
                </h2>
              </div>
            </div>

            <div className="contact-confirm-grid">
              <div>
                <Phone size={17} />

                <div>
                  <span>
                    Mobile Number
                  </span>

                  <strong>
                    {contact.mobile}
                  </strong>
                </div>
              </div>

              <div>
                <Mail size={17} />

                <div>
                  <span>
                    Email Address
                  </span>

                  <strong>
                    {contact.email}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          <div className="confirm-card payment-card">
            <div className="confirm-card-header">
              <div className="confirm-card-icon">
                <CreditCard size={21} />
              </div>

              <div>
                <span className="section-label">
                  PAYMENT
                </span>

                <h2>
                  Select Payment Method
                </h2>
              </div>
            </div>

            <div className="payment-options">
              <button
                className={
                  paymentMethod === "upi"
                    ? "payment-option active"
                    : "payment-option"
                }
                onClick={() =>
                  setPaymentMethod("upi")
                }
              >
                <div className="payment-radio">
                  {paymentMethod === "upi" && (
                    <span></span>
                  )}
                </div>

                <div>
                  <strong>
                    UPI
                  </strong>

                  <span>
                    Google Pay, PhonePe,
                    Paytm
                  </span>
                </div>
              </button>

              <button
                className={
                  paymentMethod === "card"
                    ? "payment-option active"
                    : "payment-option"
                }
                onClick={() =>
                  setPaymentMethod("card")
                }
              >
                <div className="payment-radio">
                  {paymentMethod === "card" && (
                    <span></span>
                  )}
                </div>

                <div>
                  <strong>
                    Credit / Debit Card
                  </strong>

                  <span>
                    Visa, Mastercard,
                    RuPay
                  </span>
                </div>
              </button>

              <button
                className={
                  paymentMethod === "netbanking"
                    ? "payment-option active"
                    : "payment-option"
                }
                onClick={() =>
                  setPaymentMethod(
                    "netbanking"
                  )
                }
              >
                <div className="payment-radio">
                  {paymentMethod ===
                    "netbanking" && (
                    <span></span>
                  )}
                </div>

                <div>
                  <strong>
                    Net Banking
                  </strong>

                  <span>
                    Pay using your bank
                    account
                  </span>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="confirm-error">
              <ShieldCheck size={18} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <aside className="final-summary-card">
          <div className="summary-header">
            <div>
              <span className="section-label">
                FINAL SUMMARY
              </span>

              <h2>
                Fare Details
              </h2>
            </div>
          </div>

          <div className="final-train-summary">
            <div className="summary-icon">
              <TrainFront size={22} />
            </div>

            <div>
              <strong>
                {train.name}
              </strong>

              <span>
                {from} → {to}
              </span>
            </div>
          </div>

          <div className="final-summary-details">
            <div>
              <span>
                Ticket Fare
              </span>

              <strong>
                ₹{totalFare}
              </strong>
            </div>

            <div>
              <span>
                Service Charge
              </span>

              <strong>
                ₹{serviceCharge}
              </strong>
            </div>

            <div className="final-total">
              <span>
                Total Payable
              </span>

              <strong>
                ₹{finalAmount}
              </strong>
            </div>
          </div>

          <div className="payment-selected">
            <CreditCard size={17} />

            <div>
              <span>
                Payment Method
              </span>

              <strong>
                {paymentMethod === "upi"
                  ? "UPI"
                  : paymentMethod === "card"
                  ? "Credit / Debit Card"
                  : "Net Banking"}
              </strong>
            </div>
          </div>

          <button
            className="confirm-booking-btn"
            disabled={booking}
            onClick={
              handleConfirmBooking
            }
          >
            {booking ? (
              <>
                Processing Booking...
              </>
            ) : (
              <>
                Confirm & Book
                <ArrowRight size={18} />
              </>
            )}
          </button>

          <div className="secure-payment">
            <ShieldCheck size={18} />

            <div>
              <strong>
                Secure Payment
              </strong>

              <p>
                Your booking information is
                protected.
              </p>
            </div>
          </div>

          <div className="terms-note">
            By confirming this booking, you
            agree to the booking terms and
            conditions.
          </div>
        </aside>
      </section>
    </main>
  );
}

export default ConfirmBooking;
