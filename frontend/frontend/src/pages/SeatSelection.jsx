import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Armchair,
  CheckCircle2,
  LoaderCircle,
  Lock,
  TrainFront,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function SeatSelection() {
  const location = useLocation();
  const navigate = useNavigate();

  const { train, from, to, date } = location.state || {};

  const [bookedSeats, setBookedSeats] = useState([]);
  const [totalSeats, setTotalSeats] = useState(60);
  const [selectedSeat, setSelectedSeat] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!train || !date) {
      setError("Train or journey date is missing.");
      setLoading(false);
      return;
    }

    const fetchSeats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/seats/${train.id}`,
          {
            params: {
              journey_date: date,
            },
          }
        );

        setBookedSeats(response.data.booked_seats || []);
        setTotalSeats(response.data.total_seats || 60);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to load seat availability."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [train, date]);

  const seats = useMemo(() => {
    return Array.from(
      { length: totalSeats },
      (_, index) => {
        const row = Math.floor(index / 4);
        const position = index % 4;

        const letters = ["A", "B", "C", "D"];

        return `${letters[position]}${row + 1}`;
      }
    );
  }, [totalSeats]);

  const isBooked = (seat) => bookedSeats.includes(seat);

  const handleContinue = () => {
    if (!selectedSeat) {
      setError("Please select a seat before continuing.");
      return;
    }

    navigate("/passenger-details", {
      state: {
        train,
        seat: selectedSeat,
        from,
        to,
        date,
      },
    });
  };

  if (!train || !date) {
    return (
      <main className="page-container">
        <div className="error-card">
          <h2>Booking information missing</h2>
          <p>Please return to train search and select a train again.</p>

          <button
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="booking-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div>
          <span className="section-label">STEP 1 OF 3</span>
          <h1>Select Your Seat</h1>
          <p>
            Choose an available seat for your journey.
          </p>
        </div>
      </div>

      <section className="journey-summary">
        <div className="summary-icon">
          <TrainFront size={24} />
        </div>

        <div>
          <h3>{train.name}</h3>
          <p>
            {from} → {to}
          </p>
        </div>

        <div className="journey-date">
          <span>Journey Date</span>
          <strong>{date}</strong>
        </div>
      </section>

      {loading ? (
        <div className="loading-card">
          <LoaderCircle
            size={28}
            className="loading-icon"
          />
          <p>Loading seat availability...</p>
        </div>
      ) : error ? (
        <div className="error-card">
          <h3>Something went wrong</h3>
          <p>{error}</p>

          <button
            className="primary-btn"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      ) : (
        <section className="seat-selection-layout">
          <div className="seat-panel">
            <div className="seat-panel-header">
              <div>
                <h2>Choose a Seat</h2>
                <p>
                  {totalSeats - bookedSeats.length} seats
                  available
                </p>
              </div>

              <div className="seat-legend">
                <span>
                  <i className="legend available"></i>
                  Available
                </span>

                <span>
                  <i className="legend selected"></i>
                  Selected
                </span>

                <span>
                  <i className="legend booked"></i>
                  Booked
                </span>
              </div>
            </div>

            <div className="train-coach">
              <div className="coach-header">
                <TrainFront size={20} />
                <span>TRAIN COACH</span>
              </div>

              <div className="seat-grid">
                {seats.map((seat) => {
                  const booked = isBooked(seat);
                  const selected = selectedSeat === seat;

                  return (
                    <button
                      key={seat}
                      disabled={booked}
                      className={`seat ${
                        booked ? "booked" : ""
                      } ${selected ? "selected" : ""}`}
                      onClick={() => {
                        if (!booked) {
                          setSelectedSeat(seat);
                          setError("");
                        }
                      }}
                    >
                      {booked ? (
                        <Lock size={16} />
                      ) : selected ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        <Armchair size={17} />
                      )}

                      <span>{seat}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="seat-summary">
            <h2>Booking Summary</h2>

            <div className="summary-train">
              <TrainFront size={20} />

              <div>
                <strong>{train.name}</strong>
                <span>Train #{train.number}</span>
              </div>
            </div>

            <div className="summary-route">
              <div>
                <span>From</span>
                <strong>{from}</strong>
              </div>

              <div>
                <span>To</span>
                <strong>{to}</strong>
              </div>
            </div>

            <div className="summary-row">
              <span>Journey Date</span>
              <strong>{date}</strong>
            </div>

            <div className="summary-row">
              <span>Class</span>
              <strong>{train.class}</strong>
            </div>

            <div className="summary-row">
              <span>Selected Seat</span>
              <strong>
                {selectedSeat || "Not selected"}
              </strong>
            </div>

            <div className="summary-row">
              <span>Fare</span>
              <strong>₹{train.price}</strong>
            </div>

            <button
              className="continue-btn"
              onClick={handleContinue}
              disabled={!selectedSeat}
            >
              Continue to Passenger Details
            </button>
          </aside>
        </section>
      )}
    </main>
  );
}

export default SeatSelection;
