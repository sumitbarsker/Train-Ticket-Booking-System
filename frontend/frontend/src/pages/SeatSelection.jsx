import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Armchair,
  CalendarDays,
  CheckCircle2,
  TrainFront,
  Users,
} from "lucide-react";

const COACH_LAYOUTS = {
  "3A": {
    rows: 8,
    seatsPerRow: 6,
    prefix: "A",
  },
  "2A": {
    rows: 6,
    seatsPerRow: 4,
    prefix: "B",
  },
  CC: {
    rows: 8,
    seatsPerRow: 6,
    prefix: "C",
  },
  SL: {
    rows: 8,
    seatsPerRow: 6,
    prefix: "S",
  },
};

function SeatSelection() {
  const navigate = useNavigate();
  const location = useLocation();

  const train = location.state?.train;
  const from = location.state?.from || "";
  const to = location.state?.to || "";
  const date = location.state?.date || "";

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [activeClass, setActiveClass] = useState(
    train?.class || "3A"
  );

  const layout =
    COACH_LAYOUTS[activeClass] ||
    COACH_LAYOUTS["3A"];

  const availableSeatCount = Number(
    train?.available_seats || 0
  );

  const seatPrice = Number(
    train?.price || 0
  );

  const seats = useMemo(() => {
    const generatedSeats = [];

    for (
      let row = 1;
      row <= layout.rows;
      row++
    ) {
      for (
        let seat = 1;
        seat <= layout.seatsPerRow;
        seat++
      ) {
        generatedSeats.push({
          id: `${layout.prefix}${row}-${seat}`,
          row,
          seat,
        });
      }
    }

    return generatedSeats;
  }, [layout]);

  const unavailableSeats = useMemo(() => {
    const totalSeats = seats.length;

    const availableSeats = Math.min(
      availableSeatCount,
      totalSeats
    );

    return new Set(
      seats
        .slice(availableSeats)
        .map((seat) => seat.id)
    );
  }, [seats, availableSeatCount]);

  const toggleSeat = (seatId) => {
    if (unavailableSeats.has(seatId)) {
      return;
    }

    setSelectedSeats((current) => {
      if (current.includes(seatId)) {
        return current.filter(
          (id) => id !== seatId
        );
      }

      if (current.length >= 6) {
        return current;
      }

      return [...current, seatId];
    });
  };

  const totalAmount =
    selectedSeats.length * seatPrice;

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      return;
    }

    navigate("/passenger-details", {
      state: {
        train,
        from,
        to,
        date,
        seats: selectedSeats,
        seatClass: activeClass,
        totalAmount,
      },
    });
  };

  if (!train) {
    return (
      <main className="booking-page">
        <section className="empty-results">
          <TrainFront size={46} />

          <h2>No train selected</h2>

          <p>
            Please select a train before choosing
            your seats.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            Go to Search
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
          Back to Trains
        </button>

        <div className="booking-heading">
          <div>
            <span className="section-label">
              STEP 1 OF 3
            </span>

            <h1>Select Your Seats</h1>

            <p>
              Choose your preferred seats for the
              journey.
            </p>
          </div>

          <div className="booking-train-card">
            <div className="train-icon">
              <TrainFront size={22} />
            </div>

            <div>
              <strong>{train.name}</strong>

              <span>
                #{train.number} · {train.type}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="step-indicator">
        <div className="step active">
          <span>1</span>
          <strong>Seats</strong>
        </div>

        <div className="step-line"></div>

        <div className="step">
          <span>2</span>
          <strong>Passenger</strong>
        </div>

        <div className="step-line"></div>

        <div className="step">
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
          <Users size={18} />

          <div>
            <span>Available Seats</span>
            <strong>
              {availableSeatCount}
            </strong>
          </div>
        </div>
      </section>

      <section className="seat-selection-layout">
        <div className="seat-selection-main">
          <div className="class-selector">
            <div>
              <span className="section-label">
                COACH CLASS
              </span>

              <h2>Select Class</h2>
            </div>

            <div className="class-tabs">
              {[
                "3A",
                "2A",
                "CC",
                "SL",
              ].map((className) => (
                <button
                  key={className}
                  className={
                    activeClass === className
                      ? "class-tab active"
                      : "class-tab"
                  }
                  onClick={() => {
                    setActiveClass(
                      className
                    );
                    setSelectedSeats([]);
                  }}
                >
                  {className}
                </button>
              ))}
            </div>
          </div>

          <div className="seat-card">
            <div className="seat-card-header">
              <div>
                <h2>
                  Coach {layout.prefix}1
                </h2>

                <p>
                  {activeClass} · Choose up to
                  6 seats
                </p>
              </div>

              <div className="seat-price">
                <span>Fare per seat</span>
                <strong>
                  ₹{seatPrice}
                </strong>
              </div>
            </div>

            <div className="seat-legend">
              <div>
                <span className="legend-seat available"></span>
                Available
              </div>

              <div>
                <span className="legend-seat selected"></span>
                Selected
              </div>

              <div>
                <span className="legend-seat occupied"></span>
                Occupied
              </div>
            </div>

            <div className="coach-wrapper">
              <div className="coach-label">
                <TrainFront size={20} />
                <span>ENTRY</span>
              </div>

              <div className="seat-map">
                {seats.map((seat) => {
                  const unavailable =
                    unavailableSeats.has(
                      seat.id
                    );

                  const selected =
                    selectedSeats.includes(
                      seat.id
                    );

                  return (
                    <button
                      key={seat.id}
                      type="button"
                      className={[
                        "seat",
                        unavailable
                          ? "occupied"
                          : "",
                        selected
                          ? "selected"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      disabled={unavailable}
                      onClick={() =>
                        toggleSeat(
                          seat.id
                        )
                      }
                      title={
                        unavailable
                          ? "Seat occupied"
                          : `Seat ${seat.id}`
                      }
                    >
                      <Armchair size={16} />

                      <span>
                        {seat.seat}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="coach-exit">
                <span>EXIT</span>
              </div>
            </div>

            <div className="seat-note">
              <CheckCircle2 size={17} />

              <span>
                Selected seats:{" "}
                <strong>
                  {selectedSeats.length
                    ? selectedSeats.join(
                        ", "
                      )
                    : "None"}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <aside className="booking-summary-card">
          <div className="summary-card-header">
            <span className="section-label">
              BOOKING SUMMARY
            </span>

            <h2>Your Journey</h2>
          </div>

          <div className="summary-route">
            <div>
              <span>FROM</span>
              <strong>{from}</strong>
            </div>

            <div className="summary-arrow">
              <ArrowRight size={18} />
            </div>

            <div>
              <span>TO</span>
              <strong>{to}</strong>
            </div>
          </div>

          <div className="summary-details">
            <div>
              <span>Train</span>
              <strong>{train.name}</strong>
            </div>

            <div>
              <span>Journey Date</span>
              <strong>{date}</strong>
            </div>

            <div>
              <span>Class</span>
              <strong>{activeClass}</strong>
            </div>

            <div>
              <span>Seats</span>
              <strong>
                {selectedSeats.length
                  ? selectedSeats.join(", ")
                  : "Not selected"}
              </strong>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="fare-row">
            <span>Base Fare</span>

            <strong>
              ₹
              {selectedSeats.length *
                seatPrice}
            </strong>
          </div>

          <div className="fare-row">
            <span>Convenience Fee</span>

            <strong>
              ₹
              {selectedSeats.length
                ? 20
                : 0}
            </strong>
          </div>

          <div className="fare-row total">
            <span>Total Amount</span>

            <strong>
              ₹
              {totalAmount +
                (selectedSeats.length
                  ? 20
                  : 0)}
            </strong>
          </div>

          <button
            className={
              selectedSeats.length
                ? "continue-btn"
                : "continue-btn disabled"
            }
            disabled={
              selectedSeats.length === 0
            }
            onClick={handleContinue}
          >
            Continue

            <ArrowRight size={18} />
          </button>

          <p className="secure-note">
            Your seat selection is temporary
            until booking confirmation.
          </p>
        </aside>
      </section>
    </main>
  );
}

export default SeatSelection;
