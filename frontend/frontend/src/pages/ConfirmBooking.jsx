import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Smartphone,
  WalletCards,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function ConfirmBooking() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state;

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!booking) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>Booking details not found</h2>
          <p>Please start the booking process again.</p>

          <button
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const {
    train,
    from,
    to,
    date,
    seats = [],
    seatClass,
    passengers = [],
    contact = {},
    totalAmount = 0,
  } = booking;

  const handleConfirmBooking = async () => {
    setError("");
    setProcessing(true);

    try {
      const payload = {
        train_id: Number(train.id),
        from_station: from,
        to_station: to,
        journey_date: date,
        seat_class: seatClass,
        seats: seats,
        passengers: passengers.map((passenger) => ({
          name: passenger.name,
          age: Number(passenger.age),
          gender: passenger.gender,
          seat: passenger.seat,
        })),
        total_amount: Number(totalAmount),
        payment_method: paymentMethod,
        contact_email: contact.email,
        contact_phone: contact.phone,
      };

      const response = await axios.post(
        `${API_URL}/bookings/`,
        payload
      );

      const backendBooking = response.data;

      navigate("/booking-success", {
        state: {
          ...booking,
          backendBooking,
          bookingId:
            backendBooking.booking_id ||
            backendBooking.bookingId,
          pnr: backendBooking.pnr,
          paymentMethod,
          totalAmount:
            backendBooking.total_amount || totalAmount,
        },
      });
    } catch (err) {
      console.error("Booking error:", err);

      const message =
        err.response?.data?.detail ||
        "Unable to confirm booking. Please try again.";

      setError(
        Array.isArray(message)
          ? message.map((item) => item.msg).join(", ")
          : message
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page-container">
      <div className="booking-page-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div>
          <h1>Confirm Booking</h1>
          <p>Review your journey and complete the payment.</p>
        </div>
      </div>

      <div className="booking-layout">
        {/* LEFT SIDE */}
        <div className="booking-main">
          <div className="booking-card">
            <div className="card-header">
              <div>
                <span className="card-label">TRAIN</span>
                <h2>{train.name}</h2>
              </div>

              <span className="train-number">
                {train.number}
              </span>
            </div>

            <div className="route-summary">
              <div>
                <span className="route-time">
                  {train.departure}
                </span>
                <strong>{from}</strong>
              </div>

              <div className="route-line">
                <span>{train.duration}</span>
                <div className="route-dash"></div>
              </div>

              <div>
                <span className="route-time">
                  {train.arrival}
                </span>
                <strong>{to}</strong>
              </div>
            </div>

            <div className="booking-info-grid">
              <div>
                <span>Journey Date</span>
                <strong>{date}</strong>
              </div>

              <div>
                <span>Class</span>
                <strong>{seatClass}</strong>
              </div>

              <div>
                <span>Seats</span>
                <strong>{seats.join(", ")}</strong>
              </div>

              <div>
                <span>Passengers</span>
                <strong>{passengers.length}</strong>
              </div>
            </div>
          </div>

          {/* PASSENGERS */}
          <div className="booking-card">
            <div className="card-title-row">
              <h2>Passenger Details</h2>
              <CheckCircle2 size={20} />
            </div>

            <div className="passenger-summary-list">
              {passengers.map((passenger, index) => (
                <div
                  className="passenger-summary"
                  key={`${passenger.seat}-${index}`}
                >
                  <div className="passenger-number">
                    {index + 1}
                  </div>

                  <div>
                    <strong>{passenger.name}</strong>
                    <span>
                      {passenger.age} years • {passenger.gender}
                    </span>
                  </div>

                  <div className="passenger-seat">
                    Seat {passenger.seat}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTACT */}
          <div className="booking-card">
            <div className="card-title-row">
              <h2>Contact Information</h2>
            </div>

            <div className="contact-summary">
              <div>
                <span>Email</span>
                <strong>{contact.email}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{contact.phone}</strong>
              </div>
            </div>
          </div>

          {/* PAYMENT */}
          <div className="booking-card">
            <div className="card-title-row">
              <h2>Payment Method</h2>
              <ShieldCheck size={20} />
            </div>

            <div className="payment-options">
              <button
                className={`payment-option ${
                  paymentMethod === "UPI" ? "selected" : ""
                }`}
                onClick={() => setPaymentMethod("UPI")}
              >
                <Smartphone size={22} />
                <div>
                  <strong>UPI</strong>
                  <span>Google Pay, PhonePe, Paytm</span>
                </div>
              </button>

              <button
                className={`payment-option ${
                  paymentMethod === "Card" ? "selected" : ""
                }`}
                onClick={() => setPaymentMethod("Card")}
              >
                <CreditCard size={22} />
                <div>
                  <strong>Card</strong>
                  <span>Credit or Debit Card</span>
                </div>
              </button>

              <button
                className={`payment-option ${
                  paymentMethod === "Wallet" ? "selected" : ""
                }`}
                onClick={() => setPaymentMethod("Wallet")}
              >
                <WalletCards size={22} />
                <div>
                  <strong>Wallet</strong>
                  <span>Digital Wallet</span>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <strong>Booking failed:</strong> {error}
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <aside className="booking-sidebar">
          <div className="fare-card">
            <h2>Fare Summary</h2>

            <div className="fare-row">
              <span>Base Fare</span>
              <strong>
                ₹{Math.max(Number(totalAmount) - 20, 0)}
              </strong>
            </div>

            <div className="fare-row">
              <span>Convenience Fee</span>
              <strong>₹20</strong>
            </div>

            <div className="fare-divider"></div>

            <div className="fare-total">
              <span>Total Amount</span>
              <strong>₹{totalAmount}</strong>
            </div>

            <button
              className="confirm-payment-btn"
              onClick={handleConfirmBooking}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2
                    size={19}
                    className="spin"
                  />
                  Confirming Booking...
                </>
              ) : (
                <>
                  <ShieldCheck size={19} />
                  Pay ₹{totalAmount}
                </>
              )}
            </button>

            <p className="secure-note">
              🔒 Your booking information is securely processed.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default ConfirmBooking;
