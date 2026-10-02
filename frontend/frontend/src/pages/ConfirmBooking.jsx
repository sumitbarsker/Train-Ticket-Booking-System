import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  TrainFront,
  User,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function ConfirmBooking() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    train,
    seat,
    from,
    to,
    date,
    passenger,
  } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!train || !seat || !passenger || !date) {
    return (
      <main className="confirm-page">
        <div className="empty-results">
          <TrainFront size={42} />

          <h3>Booking information is missing</h3>

          <p>
            Please complete the previous booking steps first.
          </p>

          <button
            className="select-train-btn"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>
        </div>
      </main>
    );
  }

  const handleConfirmBooking = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/bookings/`,
        {
          train_id: train.id,
          journey_date: date,
          seat: seat,

          passenger_name: passenger.name,
          age: Number(passenger.age),
          gender: passenger.gender,
          mobile: passenger.mobile,
          email: passenger.email,
        }
      );

      navigate("/booking-success", {
        state: {
          train,
          seat,
          from,
          to,
          date,
          passenger,
          booking: response.data.booking,
        },
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to confirm booking. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="confirm-page">
      <div className="confirm-container">
        {/* HEADER */}
        <div className="confirm-header">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div>
            <span className="section-label">
              FINAL STEP
            </span>

            <h1>Confirm Your Booking</h1>

            <p>
              Review your journey and passenger details
              before confirming.
            </p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="confirm-layout">
          {/* JOURNEY DETAILS */}
          <section className="confirm-card">
            <div className="confirm-card-title">
              <TrainFront size={22} />

              <div>
                <h2>Journey Details</h2>
                <p>Your selected train and seat</p>
              </div>
            </div>

            <div className="train-confirm-header">
              <div>
                <span className="train-number">
                  #{train.number}
                </span>

                <h3>{train.name}</h3>

                <span>{train.type}</span>
              </div>

              <div className="confirm-price">
                <small>Total Fare</small>

                <strong>
                  <IndianRupee size={18} />
                  {train.price}
                </strong>
              </div>
            </div>

            <div className="confirm-route">
              <div>
                <small>FROM</small>
                <strong>{from}</strong>
                <span>{train.departure}</span>
              </div>

              <div className="confirm-route-line">
                <ArrowRight size={20} />
                <span>{train.duration}</span>
              </div>

              <div>
                <small>TO</small>
                <strong>{to}</strong>
                <span>{train.arrival}</span>
              </div>
            </div>

            <div className="confirm-info-grid">
              <div>
                <CalendarDays size={18} />
                <span>
                  <small>Journey Date</small>
                  <strong>{date}</strong>
                </span>
              </div>

              <div>
                <TrainFront size={18} />
                <span>
                  <small>Class</small>
                  <strong>{train.class}</strong>
                </span>
              </div>

              <div>
                <CheckCircle2 size={18} />
                <span>
                  <small>Seat</small>
                  <strong>{seat}</strong>
                </span>
              </div>
            </div>
          </section>

          {/* PASSENGER DETAILS */}
          <section className="confirm-card">
            <div className="confirm-card-title">
              <User size={22} />

              <div>
                <h2>Passenger Details</h2>
                <p>Booking passenger information</p>
              </div>
            </div>

            <div className="passenger-confirm-details">
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

              <div>
                <span>Email</span>
                <strong>{passenger.email}</strong>
              </div>
            </div>
          </section>

          {/* FINAL ACTION */}
          <aside className="confirm-action-card">
            <span className="section-label">
              READY TO BOOK
            </span>

            <h2>Confirm Ticket</h2>

            <p>
              Your seat will be reserved after the booking
              is successfully processed.
            </p>

            <div className="final-fare">
              <span>Payable Amount</span>

              <strong>₹{train.price}</strong>
            </div>

            <button
              className="confirm-booking-btn"
              onClick={handleConfirmBooking}
              disabled={loading}
            >
              {loading
                ? "Confirming Booking..."
                : "Confirm & Book Ticket"}

              {!loading && <CheckCircle2 size={19} />}
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default ConfirmBooking;
