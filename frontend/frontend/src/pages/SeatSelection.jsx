import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Check,
  TrainFront,
  Users,
  Armchair,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const seatLayout = [
  { id: "A1", row: 1, number: 1 },
  { id: "A2", row: 1, number: 2 },
  { id: "A3", row: 1, number: 3 },
  { id: "A4", row: 1, number: 4 },

  { id: "B1", row: 2, number: 1 },
  { id: "B2", row: 2, number: 2 },
  { id: "B3", row: 2, number: 3 },
  { id: "B4", row: 2, number: 4 },

  { id: "C1", row: 3, number: 1 },
  { id: "C2", row: 3, number: 2 },
  { id: "C3", row: 3, number: 3 },
  { id: "C4", row: 3, number: 4 },

  { id: "D1", row: 4, number: 1 },
  { id: "D2", row: 4, number: 2 },
  { id: "D3", row: 4, number: 3 },
  { id: "D4", row: 4, number: 4 },

  { id: "E1", row: 5, number: 1 },
  { id: "E2", row: 5, number: 2 },
  { id: "E3", row: 5, number: 3 },
  { id: "E4", row: 5, number: 4 },
];

function SeatSelection() {
  const navigate = useNavigate();
  const location = useLocation();

  const train = location.state?.train;
  const from = location.state?.from;
  const to = location.state?.to;
  const date = location.state?.date;

  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSeats = async () => {
      if (!train?.id) return;

      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `${API_URL}/seats/${train.id}`
        );

        setBookedSeats(response.data.booked_seats || []);
        setAvailableSeats(response.data.available_seats || 0);
      } catch (requestError) {
        console.error("Seat availability failed:", requestError);

        setError(
          requestError.response?.data?.detail ||
            "Unable to load seat availability."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, [train?.id]);

  if (!train) {
    return (
      <main className="seat-page">
        <div className="empty-state">
          <TrainFront size={42} />

          <h2>No train selected</h2>

          <p>
            Please select a train before choosing your seat.
          </p>

          <button
            className="select-train-btn"
            onClick={() => navigate("/")}
          >
            Back to Search
          </button>
        </div>
      </main>
    );
  }

  const handleSeatClick = (seat) => {
    if (bookedSeats.includes(seat.id)) {
      return;
    }

    setSelectedSeat(seat.id);
  };

  const handleContinue = () => {
    if (!selectedSeat) {
      alert("Please select a seat first.");
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

  return (
    <main className="seat-page">
      <div className="seat-container">

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="seat-header">
          <div>
            <span className="small-label">
              SELECT YOUR SEAT
            </span>

            <h1>Choose your preferred seat</h1>

            <p>
              {train.name} • Train No. {train.number}
            </p>
          </div>

          <div className="seat-train-info">
            <TrainFront size={22} />

            <div>
              <strong>
                {train.source} → {train.destination}
              </strong>

              <span>
                {train.departure} - {train.arrival}
              </span>
            </div>
          </div>
        </div>

        <div className="seat-layout-wrapper">

          <div className="seat-main-card">

            <div className="coach-header">
              <div>
                <span>Coach</span>
                <strong>{train.class || "3A"}</strong>
              </div>

              <div className="available-count">
                <Users size={18} />
                <span>
                  {availableSeats} seats available
                </span>
              </div>
            </div>

            {loading && (
              <div className="empty-state">
                <Armchair size={40} />

                <h2>Loading seats...</h2>

                <p>
                  Checking real-time seat availability.
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="empty-state">
                <Armchair size={40} />

                <h2>Unable to load seats</h2>

                <p>{error}</p>

                <button
                  className="select-train-btn"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="seat-legend">
                  <div>
                    <span className="legend-box available"></span>
                    Available
                  </div>

                  <div>
                    <span className="legend-box selected"></span>
                    Selected
                  </div>

                  <div>
                    <span className="legend-box booked"></span>
                    Booked
                  </div>
                </div>

                <div className="coach-body">

                  <div className="coach-label">
                    <TrainFront size={20} />
                    <span>Front</span>
                  </div>

                  <div className="seat-grid">
                    {seatLayout.map((seat) => {
                      const isBooked = bookedSeats.includes(
                        seat.id
                      );

                      const isSelected =
                        selectedSeat === seat.id;

                      return (
                        <button
                          key={seat.id}
                          className={`seat ${
                            isBooked
                              ? "booked"
                              : isSelected
                              ? "selected"
                              : "available"
                          }`}
                          disabled={isBooked}
                          onClick={() =>
                            handleSeatClick(seat)
                          }
                          title={
                            isBooked
                              ? "Seat already booked"
                              : `Select seat ${seat.id}`
                          }
                        >
                          {isSelected ? (
                            <Check size={18} />
                          ) : (
                            <Armchair size={18} />
                          )}

                          <span>{seat.id}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="coach-label bottom">
                    <span>Back</span>
                  </div>

                </div>

                <div className="selected-seat-info">
                  <div>
                    <span>Selected Seat</span>

                    <strong>
                      {selectedSeat || "None"}
                    </strong>
                  </div>

                  <button
                    className="continue-btn"
                    onClick={handleContinue}
                    disabled={!selectedSeat}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}

          </div>

          <aside className="seat-summary-card">

            <div className="summary-icon">
              <TrainFront size={24} />
            </div>

            <h3>Journey Summary</h3>

            <div className="summary-row">
              <span>Train</span>
              <strong>{train.name}</strong>
            </div>

            <div className="summary-row">
              <span>Train Number</span>
              <strong>{train.number}</strong>
            </div>

            <div className="summary-row">
              <span>Route</span>
              <strong>
                {train.source} → {train.destination}
              </strong>
            </div>

            <div className="summary-row">
              <span>Class</span>
              <strong>{train.class}</strong>
            </div>

            <div className="summary-row">
              <span>Fare</span>
              <strong>₹{train.price}</strong>
            </div>

            {date && (
              <div className="summary-row">
                <span>Journey Date</span>
                <strong>{date}</strong>
              </div>
            )}

          </aside>

        </div>
      </div>
    </main>
  );
}

export default SeatSelection;
