import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  TrainFront,
  Users,
  Armchair,
} from "lucide-react";

const seats = [
  { id: "A1", row: 1, number: 1, status: "available" },
  { id: "A2", row: 1, number: 2, status: "available" },
  { id: "A3", row: 1, number: 3, status: "booked" },
  { id: "A4", row: 1, number: 4, status: "available" },

  { id: "B1", row: 2, number: 1, status: "available" },
  { id: "B2", row: 2, number: 2, status: "available" },
  { id: "B3", row: 2, number: 3, status: "available" },
  { id: "B4", row: 2, number: 4, status: "booked" },

  { id: "C1", row: 3, number: 1, status: "booked" },
  { id: "C2", row: 3, number: 2, status: "available" },
  { id: "C3", row: 3, number: 3, status: "available" },
  { id: "C4", row: 3, number: 4, status: "available" },

  { id: "D1", row: 4, number: 1, status: "available" },
  { id: "D2", row: 4, number: 2, status: "available" },
  { id: "D3", row: 4, number: 3, status: "available" },
  { id: "D4", row: 4, number: 4, status: "available" },

  { id: "E1", row: 5, number: 1, status: "available" },
  { id: "E2", row: 5, number: 2, status: "booked" },
  { id: "E3", row: 5, number: 3, status: "available" },
  { id: "E4", row: 5, number: 4, status: "available" },
];

function SeatSelection() {
  const navigate = useNavigate();
  const location = useLocation();

  const train = location.state?.train;

  const [selectedSeat, setSelectedSeat] = useState(null);

  if (!train) {
    return (
      <main className="seat-page">
        <div className="empty-state">
          <TrainFront size={42} />
          <h2>No train selected</h2>
          <p>Please select a train before choosing your seat.</p>

          <button
            className="select-train-btn"
            onClick={() => navigate("/search")}
          >
            Back to Trains
          </button>
        </div>
      </main>
    );
  }

  const handleSeatClick = (seat) => {
    if (seat.status === "booked") {
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
      },
    });
  };

  return (
    <main className="seat-page">
      <div className="seat-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div>
          <span className="small-label">STEP 1 OF 3</span>
          <h1>Select Your Seat</h1>
          <p>
            Choose your preferred seat for your journey.
          </p>
        </div>
      </div>

      <section className="selected-train-card">
        <div className="train-info">
          <div className="train-icon">
            <TrainFront size={24} />
          </div>

          <div>
            <h2>{train.name}</h2>
            <span>{train.number}</span>
          </div>
        </div>

        <div className="seat-route">
          <strong>
            {train.source} → {train.destination}
          </strong>

          <span>
            {train.departure} - {train.arrival}
          </span>
        </div>
      </section>

      <div className="seat-layout">
        <section className="seat-card">
          <div className="coach-header">
            <div>
              <span className="small-label">COACH</span>
              <h2>3A Coach</h2>
            </div>

            <div className="coach-icon">
              <Armchair size={22} />
            </div>
          </div>

          <div className="seat-legend">
            <span>
              <i className="legend-box available"></i>
              Available
            </span>

            <span>
              <i className="legend-box selected"></i>
              Selected
            </span>

            <span>
              <i className="legend-box booked"></i>
              Booked
            </span>
          </div>

          <div className="seat-map">
            <div className="seat-column-labels">
              <span>Window</span>
              <span>Middle</span>
              <span>Aisle</span>
              <span>Window</span>
            </div>

            {seats.map((seat) => {
              const isSelected = selectedSeat === seat.id;
              const isBooked = seat.status === "booked";

              return (
                <button
                  key={seat.id}
                  className={`seat ${
                    isSelected ? "selected" : ""
                  } ${isBooked ? "booked" : ""}`}
                  disabled={isBooked}
                  onClick={() => handleSeatClick(seat)}
                  title={
                    isBooked
                      ? "Seat already booked"
                      : `Select ${seat.id}`
                  }
                >
                  {isSelected ? (
                    <Check size={18} />
                  ) : (
                    seat.id
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="booking-summary">
          <div className="summary-icon">
            <Users size={23} />
          </div>

          <span className="small-label">BOOKING SUMMARY</span>

          <h2>Your Journey</h2>

          <div className="summary-route">
            <strong>{train.source}</strong>
            <span>↓</span>
            <strong>{train.destination}</strong>
          </div>

          <div className="summary-row">
            <span>Train</span>
            <strong>{train.name}</strong>
          </div>

          <div className="summary-row">
            <span>Class</span>
            <strong>{train.class}</strong>
          </div>

          <div className="summary-row">
            <span>Seat</span>
            <strong>
              {selectedSeat || "Not selected"}
            </strong>
          </div>

          <div className="summary-row">
            <span>Fare</span>
            <strong>₹{train.price}</strong>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-total">
            <span>Total</span>
            <strong>₹{train.price}</strong>
          </div>

          <button
            className="continue-btn"
            onClick={handleContinue}
          >
            Continue
          </button>
        </aside>
      </div>
    </main>
  );
}

export default SeatSelection;
