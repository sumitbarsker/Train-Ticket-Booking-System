import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  TrainFront,
  User,
  CreditCard,
  CalendarDays,
  MapPin,
  Armchair,
} from "lucide-react";

function ConfirmBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  const train = location.state?.train;
  const seat = location.state?.seat;
  const passenger = location.state?.passenger;

  if (!train || !seat || !passenger) {
    return (
      <main className="confirm-page">
        <div className="empty-state">
          <TrainFront size={42} />

          <h2>Booking information not found</h2>

          <p>
            Please complete the train, seat and passenger
            selection before confirming your booking.
          </p>

          <button
            className="select-train-btn"
            onClick={() => navigate("/")}
          >
            Start New Booking
          </button>
        </div>
      </main>
    );
  }

  const handleConfirmBooking = () => {
    navigate("/booking-success", {
      state: {
        train,
        seat,
        passenger,
      },
    });
  };

  return (
    <main className="confirm-page">
      <div className="confirm-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div>
          <span className="small-label">
            STEP 3 OF 3
          </span>

          <h1>Confirm Your Booking</h1>

          <p>
            Review your journey and passenger details before
            confirming.
          </p>
        </div>
      </div>

      <div className="confirm-layout">
        <section className="confirm-card">
          <div className="confirm-card-heading">
            <div className="confirm-heading-icon">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <h2>Review Booking</h2>

              <p>
                Please verify all the details below.
              </p>
            </div>
          </div>

          <div className="review-section">
            <div className="review-title">
              <TrainFront size={18} />
              Journey Details
            </div>

            <div className="review-grid">
              <div>
                <span>Train</span>
                <strong>{train.name}</strong>
              </div>

              <div>
                <span>Train Number</span>
                <strong>{train.number}</strong>
              </div>

              <div>
                <span>From</span>
                <strong>{train.source}</strong>
              </div>

              <div>
                <span>To</span>
                <strong>{train.destination}</strong>
              </div>

              <div>
                <span>Departure</span>
                <strong>{train.departure}</strong>
              </div>

              <div>
                <span>Arrival</span>
                <strong>{train.arrival}</strong>
              </div>
            </div>
          </div>

          <div className="review-section">
            <div className="review-title">
              <User size={18} />
              Passenger Details
            </div>

            <div className="review-grid">
              <div>
                <span>Name</span>
                <strong>{passenger.name}</strong>
              </div>

              <div>
                <span>Age</span>
                <strong>{passenger.age}</strong>
              </div>

              <div>
                <span>Gender</span>
                <strong>{passenger.gender}</strong>
              </div>

              <div>
                <span>Mobile</span>
                <strong>{passenger.mobile}</strong>
              </div>

              <div className="review-full">
                <span>Email</span>
                <strong>{passenger.email}</strong>
              </div>
            </div>
          </div>

          <div className="review-section">
            <div className="review-title">
              <Armchair size={18} />
              Seat Details
            </div>

            <div className="seat-review">
              <div>
                <span>Class</span>
                <strong>{train.class}</strong>
              </div>

              <div>
                <span>Seat Number</span>
                <strong>{seat}</strong>
              </div>

              <div>
                <span>Journey Duration</span>
                <strong>{train.duration}</strong>
              </div>
            </div>
          </div>
        </section>

        <aside className="confirm-summary">
          <div className="payment-icon">
            <CreditCard size={23} />
          </div>

          <span className="small-label">
            FARE SUMMARY
          </span>

          <h2>Booking Total</h2>

          <div className="fare-row">
            <span>Base Fare</span>
            <strong>₹{train.price}</strong>
          </div>

          <div className="fare-row">
            <span>Seat</span>
            <strong>{seat}</strong>
          </div>

          <div className="fare-row">
            <span>Booking Fee</span>
            <strong>₹0</strong>
          </div>

          <div className="summary-divider"></div>

          <div className="fare-total">
            <span>Total Amount</span>
            <strong>₹{train.price}</strong>
          </div>

          <div className="secure-note">
            <CheckCircle2 size={16} />

            <span>
              Secure booking confirmation
            </span>
          </div>

          <button
            className="confirm-booking-btn"
            onClick={handleConfirmBooking}
          >
            <CheckCircle2 size={18} />
            Confirm Booking
          </button>

          <p className="payment-note">
            This is a demo booking system. No real payment
            will be processed.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default ConfirmBooking;
