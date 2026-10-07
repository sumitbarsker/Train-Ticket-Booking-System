import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  TrainFront,
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const PAYMENT_METHODS = [
  {
    id: "UPI",
    name: "UPI",
    description: "Google Pay, PhonePe, Paytm",
    icon: Smartphone,
  },
  {
    id: "Card",
    name: "Credit / Debit Card",
    description: "Visa, Mastercard, RuPay",
    icon: CreditCard,
  },
  {
    id: "Wallet",
    name: "Wallet",
    description: "Paytm, Amazon Pay & more",
    icon: Wallet,
  },
];

export default function ConfirmBooking() {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state;

  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");

  if (!booking?.train || !booking?.passengers || !booking?.seats) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>Booking information not found</h2>
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
    seats,
    seatClass,
    passengers,
    contact,
    totalAmount,
  } = booking;

  const baseFare = Number(totalAmount || 0);
  const convenienceFee = 20;
  const finalAmount = baseFare;

  const handleConfirmBooking = async () => {
    setError("");
    setIsBooking(true);

    try {
      const payload = {
        train_id: Number(train.id),
        from_station: from,
        to_station: to,
        journey_date: date,
        seat_class: seatClass,
        seats: seats,

        passengers: passengers.map((passenger, index) => ({
          name: passenger.name,
          age: Number(passenger.age),
          gender: passenger.gender,
          seat: seats[index],
        })),

        total_amount: finalAmount,
        payment_method: paymentMethod,

        contact_email: contact?.email || "",
        contact_phone: contact?.phone || "",
      };

      const response = await axios.post(
        `${API_URL}/bookings/`,
        payload
      );

      /*
       * Backend returns:
       * {
       *   message: "...",
       *   booking: {...},
       *   booking_id: "...",
       *   pnr: "...",
       *   status: "Confirmed",
       *   total_amount: ...
       * }
       *
       * So we use response.data.booking first.
       * The fallback keeps this compatible if the API
       * later returns the booking object directly.
       */
      const apiResponse = response.data;
      const backendBooking = apiResponse.booking || apiResponse;

      navigate("/booking-success", {
        state: {
          ...booking,

          backendBooking,

          bookingId:
            apiResponse.booking_id ||
            backendBooking.booking_id ||
            backendBooking.bookingId,

          pnr:
            apiResponse.pnr ||
            backendBooking.pnr,

          paymentMethod,

          totalAmount:
            apiResponse.total_amount ??
            backendBooking.total_amount ??
            finalAmount,
        },
      });
    } catch (err) {
      console.error("Booking error:", err);

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Unable to confirm booking. Please try again.";

      setError(
        Array.isArray(message)
          ? message.map((item) => item.msg || String(item)).join(", ")
          : String(message)
      );
    } finally {
      setIsBooking(false);
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
          <p>Review your journey and complete the booking.</p>
        </div>
      </div>

      <div className="booking-layout">
        <div className="booking-main">
          {/* Journey Summary */}
          <section className="booking-card">
            <div className="booking-card-header">
              <div>
                <span className="section-label">Journey Details</span>
                <h2>
                  <TrainFront size={22} />
                  {train.name}
                </h2>
              </div>

              <span className="train-number">
                #{train.number}
              </span>
            </div>

            <div className="journey-summary">
              <div className="journey-location">
                <span className="journey-time">
                  {train.departure}
                </span>
                <strong>{from}</strong>
              </div>

              <div className="journey-line">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="journey-location right">
                <span className="journey-time">
                  {train.arrival}
                </span>
                <strong>{to}</strong>
              </div>
            </div>

            <div className="booking-info-grid">
              <div>
                <CalendarDays size={18} />
                <div>
                  <small>Journey Date</small>
                  <strong>{date}</strong>
                </div>
              </div>

              <div>
                <MapPin size={18} />
                <div>
                  <small>Route</small>
                  <strong>
                    {from} → {to}
                  </strong>
                </div>
              </div>

              <div>
                <TrainFront size={18} />
                <div>
                  <small>Class</small>
                  <strong>{seatClass}</strong>
                </div>
              </div>

              <div>
                <Users size={18} />
                <div>
                  <small>Seats</small>
                  <strong>{seats.join(", ")}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* Passenger Details */}
          <section className="booking-card">
            <div className="booking-card-header">
              <div>
                <span className="section-label">
                  Passenger Details
                </span>
                <h2>
                  <Users size={22} />
                  {passengers.length} Passenger
                  {passengers.length > 1 ? "s" : ""}
                </h2>
              </div>
            </div>

            <div className="passenger-list">
              {passengers.map((passenger, index) => (
                <div
                  className="passenger-summary"
                  key={`${passenger.name}-${index}`}
                >
                  <div className="passenger-number">
                    {index + 1}
                  </div>

                  <div className="passenger-summary-info">
                    <strong>{passenger.name}</strong>
                    <span>
                      Age {passenger.age} • {passenger.gender}
                    </span>
                  </div>

                  <div className="passenger-seat">
                    <small>Seat</small>
                    <strong>{seats[index]}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Payment */}
          <section className="booking-card">
            <div className="booking-card-header">
              <div>
                <span className="section-label">
                  Payment Method
                </span>
                <h2>Choose Payment Method</h2>
              </div>
            </div>

            <div className="payment-options">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon;
                const selected = paymentMethod === method.id;

                return (
                  <button
                    type="button"
                    key={method.id}
                    className={`payment-option ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() =>
                      setPaymentMethod(method.id)
                    }
                  >
                    <div className="payment-icon">
                      <Icon size={22} />
                    </div>

                    <div className="payment-info">
                      <strong>{method.name}</strong>
                      <span>{method.description}</span>
                    </div>

                    <div className="payment-radio">
                      {selected && <CheckCircle2 size={20} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="secure-payment">
              <ShieldCheck size={20} />
              <div>
                <strong>Secure Payment</strong>
                <span>
                  Your payment information is securely processed.
                </span>
              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="booking-error">
              <strong>Booking failed</strong>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Price Summary */}
        <aside className="booking-sidebar">
          <div className="fare-card">
            <div className="fare-header">
              <h2>Fare Summary</h2>
              <span>{seatClass}</span>
            </div>

            <div className="fare-row">
              <span>
                Base Fare × {seats.length}
              </span>
              <strong>
                ₹{Math.max(0, baseFare - convenienceFee).toLocaleString()}
              </strong>
            </div>

            <div className="fare-row">
              <span>Convenience Fee</span>
              <strong>₹{convenienceFee}</strong>
            </div>

            <div className="fare-divider"></div>

            <div className="fare-total">
              <span>Total Amount</span>
              <strong>
                ₹{finalAmount.toLocaleString()}
              </strong>
            </div>

            <button
              className="confirm-booking-btn"
              onClick={handleConfirmBooking}
              disabled={isBooking}
            >
              {isBooking ? (
                <>
                  <span className="loading-spinner"></span>
                  Confirming Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 size={19} />
                  Confirm & Book
                </>
              )}
            </button>

            <p className="booking-note">
              By confirming, you agree to the booking terms and
              conditions.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
