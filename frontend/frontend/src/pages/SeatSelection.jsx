import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  TrainFront,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const CLASS_CONFIG = {
  SL: {
    label: "Sleeper",
    columns: 6,
  },
  "3A": {
    label: "AC 3 Tier",
    columns: 6,
  },
  "2A": {
    label: "AC 2 Tier",
    columns: 4,
  },
  CC: {
    label: "Chair Car",
    columns: 5,
  },
};

function SeatSelection() {
  const location = useLocation();
  const navigate = useNavigate();

  const { train, from, to, date } = location.state || {};

  const [seatClass, setSeatClass] = useState(
    train?.class || "3A"
  );

  const [seatData, setSeatData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const config =
    CLASS_CONFIG[seatClass] || CLASS_CONFIG["3A"];

  useEffect(() => {
    if (!train?.id) {
      setLoading(false);
      return;
    }

    fetchSeats();
  }, [train?.id, seatClass, date]);

  const fetchSeats = async () => {
    setLoading(true);
    setError("");
    setSelectedSeats([]);

    try {
      const response = await axios.get(
        `${API_URL}/seats/${train.id}`,
        {
          params: {
            journey_date: date,
            seat_class: seatClass,
          },
        }
      );

      setSeatData(response.data);
    } catch (err) {
      console.error("Seat loading error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load seat availability."
      );

      setSeatData(null);
    } finally {
      setLoading(false);
    }
  };

  const seats = useMemo(() => {
    if (!seatData?.seats) return [];

    return seatData.seats;
  }, [seatData]);

  const toggleSeat = (seat) => {
    if (seat.status === "booked") return;

    setSelectedSeats((current) => {
      if (current.includes(seat.seat_number)) {
        return current.filter(
          (number) => number !== seat.seat_number
        );
      }

      if (current.length >= 6) {
        return current;
      }

      return [...current, seat.seat_number];
    });
  };

  const pricePerSeat =
    Number(train?.price || 0);

  const baseFare =
    pricePerSeat * selectedSeats.length;

  const convenienceFee =
    selectedSeats.length > 0 ? 20 : 0;

  const totalAmount =
    baseFare + convenienceFee;

  const continueToPassengerDetails = async () => {
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat.");
      return;
    }

    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/seats/${train.id}/check`,
        {
          journey_date: date,
          seat_class: seatClass,
          seats: selectedSeats,
        }
      );

      if (!response.data?.available) {
        setError(
          response.data?.message ||
            "One or more selected seats are no longer available."
        );

        await fetchSeats();
        return;
      }

      navigate("/passenger-details", {
        state: {
          train,
          from,
          to,
          date,
          seats: selectedSeats,
          seatClass,
          totalAmount,
        },
      });
    } catch (err) {
      console.error("Seat validation error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to validate selected seats."
      );

      await fetchSeats();
    }
  };

  if (!train) {
    return (
      <main className="page-container">
        <div className="empty-state">
          <h2>Train details not found</h2>
          <p>
            Please select a train before choosing seats.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="booking-page-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div>
          <h1>Select Your Seat</h1>
          <p>
            Choose your preferred seat for the journey.
          </p>
        </div>

        <button
          className="refresh-btn"
          onClick={fetchSeats}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* TRAIN SUMMARY */}
      <section className="booking-card train-summary-card">
        <div className="train-summary-icon">
          <TrainFront size={25} />
        </div>

        <div className="train-summary-content">
          <h2>{train.name}</h2>

          <span>
            {train.number} • {from} → {to}
          </span>
        </div>

        <div className="train-summary-date">
          <span>Journey Date</span>
          <strong>{date}</strong>
        </div>
      </section>

      {/* CLASS SELECTOR */}
      <section className="class-selector">
        {Object.entries(CLASS_CONFIG).map(
          ([value, item]) => (
            <button
              key={value}
              className={
                seatClass === value
                  ? "class-option active"
                  : "class-option"
              }
              onClick={() => setSeatClass(value)}
            >
              <strong>{value}</strong>
              <span>{item.label}</span>
            </button>
          )
        )}
      </section>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="seat-selection-layout">
        {/* SEAT MAP */}
        <section className="seat-map-card">
          <div className="seat-map-header">
            <div>
              <h2>
                {seatClass} —{" "}
                {config.label}
              </h2>

              <p>
                {seatData?.available_seats ?? 0} seats
                available
              </p>
            </div>

            <div className="seat-legend">
              <span>
                <i className="seat-dot available" />
                Available
              </span>

              <span>
                <i className="seat-dot selected" />
                Selected
              </span>

              <span>
                <i className="seat-dot booked" />
                Booked
              </span>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <Loader2
                size={32}
                className="spin"
              />
              <p>Loading real seat availability...</p>
            </div>
          ) : seats.length === 0 ? (
            <div className="empty-state">
              <h3>No seat data available</h3>
              <p>
                Please refresh or try another class.
              </p>
            </div>
          ) : (
            <div className="seat-map">
              <div className="coach-label">
                Coach {seatData?.coach || "C1"}
              </div>

              <div
                className="seat-grid"
                style={{
                  gridTemplateColumns: `repeat(${config.columns}, minmax(42px, 1fr))`,
                }}
              >
                {seats.map((seat) => {
                  const isSelected =
                    selectedSeats.includes(
                      seat.seat_number
                    );

                  const isBooked =
                    seat.status === "booked";

                  return (
                    <button
                      key={seat.seat_number}
                      type="button"
                      disabled={isBooked}
                      className={[
                        "seat",
                        isBooked ? "booked" : "",
                        isSelected ? "selected" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() =>
                        toggleSeat(seat)
                      }
                      title={
                        isBooked
                          ? "Already booked"
                          : `Seat ${seat.seat_number}`
                      }
                    >
                      {isSelected ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        seat.seat_number
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* FARE SUMMARY */}
        <aside className="seat-summary-card">
          <h2>Booking Summary</h2>

          <div className="selected-train-mini">
            <strong>{train.name}</strong>
            <span>
              {from} → {to}
            </span>
          </div>

          <div className="summary-row">
            <span>Class</span>
            <strong>{seatClass}</strong>
          </div>

          <div className="summary-row">
            <span>Selected Seats</span>
            <strong>
              {selectedSeats.length
                ? selectedSeats.join(", ")
                : "None"}
            </strong>
          </div>

          <div className="summary-row">
            <span>Passengers</span>
            <strong>
              {selectedSeats.length}
            </strong>
          </div>

          <div className="fare-divider" />

          <div className="summary-row">
            <span>Base Fare</span>
            <strong>
              ₹{baseFare.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="summary-row">
            <span>Convenience Fee</span>
            <strong>
              ₹{convenienceFee}
            </strong>
          </div>

          <div className="fare-total">
            <span>Total</span>
            <strong>
              ₹{totalAmount.toLocaleString("en-IN")}
            </strong>
          </div>

          <button
            className="primary-btn continue-btn"
            disabled={
              loading ||
              selectedSeats.length === 0
            }
            onClick={
              continueToPassengerDetails
            }
          >
            Continue to Passenger Details
          </button>

          <p className="seat-note">
            Maximum 6 seats can be selected per
            booking.
          </p>
        </aside>
      </div>
    </main>
  );
}

export default SeatSelection;
