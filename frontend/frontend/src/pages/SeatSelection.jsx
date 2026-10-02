import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Info,
  LoaderCircle,
  MapPin,
  TrainFront,
  Users,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function SeatSelection() {
  const navigate = useNavigate();
  const location = useLocation();

  const train = location.state?.train;
  const from = location.state?.from || train?.source || "";
  const to = location.state?.to || train?.destination || "";
  const date = location.state?.date || "";

  const [seatData, setSeatData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!train) {
      setError("Train information is missing.");
      setLoading(false);
      return;
    }

    fetchSeatAvailability();
  }, [train?.id, date]);

  const fetchSeatAvailability = async () => {
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

      setSeatData(response.data);
    } catch (err) {
      /*
       * Fallback keeps the frontend usable even when
       * the backend seat endpoint has not been connected yet.
       */
      const availableSeats = Number(
        train.available_seats || 0
      );

      const fallbackSeats = createFallbackSeats(
        availableSeats
      );

      setSeatData({
        train_id: train.id,
        journey_date: date,
        seats: fallbackSeats,
      });
    } finally {
      setLoading(false);
    }
  };

  const createFallbackSeats = (availableSeats) => {
    const totalSeats = Math.max(
      40,
      availableSeats
    );

    return Array.from(
      { length: totalSeats },
      (_, index) => ({
        seat_number: index + 1,
        status:
          index < availableSeats
            ? "available"
            : "booked",
      })
    );
  };

  const seats = useMemo(() => {
    return seatData?.seats || [];
  }, [seatData]);

  const availableSeats = useMemo(() => {
    return seats.filter(
      (seat) =>
        String(seat.status).toLowerCase() ===
        "available"
    );
  }, [seats]);

  const bookedSeats = useMemo(() => {
    return seats.filter(
      (seat) =>
        String(seat.status).toLowerCase() !==
        "available"
    );
  }, [seats]);

  const totalFare =
    selectedSeats.length *
    Number(train?.price || 0);

  const toggleSeat = (seat) => {
    const seatNumber = seat.seat_number;

    if (
      String(seat.status).toLowerCase() !==
      "available"
    ) {
      return;
    }

    setSelectedSeats((currentSeats) => {
      if (currentSeats.includes(seatNumber)) {
        return currentSeats.filter(
          (number) => number !== seatNumber
        );
      }

      return [
        ...currentSeats,
        seatNumber,
      ];
    });
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      setError(
        "Please select at least one seat to continue."
      );
      return;
    }

    navigate(
      "/passenger-details",
      {
        state: {
          train,
          from,
          to,
          date,
          selectedSeats,
          totalFare,
        },
      }
    );
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!train) {
    return (
      <main className="seat-page">
        <section className="empty-results">
          <TrainFront size={48} />

          <h2>Train information not found</h2>

          <p>
            Please go back and select a train
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
    <main className="seat-page">
      <section className="seat-header">
        <button
          className="back-btn"
          onClick={handleBack}
        >
          <ArrowLeft size={18} />
          Back to Trains
        </button>

        <div className="seat-header-content">
          <div>
            <span className="section-label">
              STEP 1 OF 4
            </span>

            <h1>Select Your Seats</h1>

            <p>
              Choose available seats for your
              journey.
            </p>
          </div>

          <div className="seat-step-indicator">
            <div className="step active">
              <span>1</span>
              <small>Seats</small>
            </div>

            <div className="step-line"></div>

            <div className="step">
              <span>2</span>
              <small>Passenger</small>
            </div>

            <div className="step-line"></div>

            <div className="step">
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

      <section className="seat-layout">
        <div className="seat-main-card">
          <div className="journey-summary">
            <div className="journey-train-icon">
              <TrainFront size={25} />
            </div>

            <div className="journey-summary-info">
              <div className="journey-train-name">
                <h3>{train.name}</h3>

                <span>
                  #{train.number}
                </span>
              </div>

              <div className="journey-route">
                <span>{from}</span>

                <ArrowRight size={16} />

                <span>{to}</span>

                <span className="journey-date">
                  {date}
                </span>
              </div>
            </div>

            <div className="journey-price">
              <span>Starting fare</span>
              <strong>₹{train.price}</strong>
            </div>
          </div>

          <div className="seat-card-header">
            <div>
              <span className="section-label">
                SEAT MAP
              </span>

              <h2>
                Select seats
              </h2>

              <p>
                {availableSeats.length} seats
                currently available
              </p>
            </div>

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
          </div>

          {loading ? (
            <div className="loading-card seat-loading">
              <LoaderCircle
                size={34}
                className="loading-icon"
              />

              <h3>
                Loading seat availability...
              </h3>

              <p>
                Checking seats for {date}
              </p>
            </div>
          ) : (
            <div className="seat-map-wrapper">
              <div className="coach-label">
                <span>ENTRY</span>
                <strong>
                  Coach {train.class || "3A"}
                </strong>
              </div>

              <div className="seat-map">
                {seats.map((seat) => {
                  const seatNumber =
                    seat.seat_number;

                  const isBooked =
                    String(
                      seat.status
                    ).toLowerCase() !==
                    "available";

                  const isSelected =
                    selectedSeats.includes(
                      seatNumber
                    );

                  let seatClass =
                    "seat";

                  if (isBooked) {
                    seatClass +=
                      " booked";
                  } else if (isSelected) {
                    seatClass +=
                      " selected";
                  } else {
                    seatClass +=
                      " available";
                  }

                  return (
                    <button
                      key={seatNumber}
                      className={seatClass}
                      disabled={isBooked}
                      onClick={() =>
                        toggleSeat(seat)
                      }
                      title={
                        isBooked
                          ? `Seat ${seatNumber} is booked`
                          : `Select seat ${seatNumber}`
                      }
                    >
                      {isSelected ? (
                        <Check size={17} />
                      ) : (
                        seatNumber
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="coach-end">
                <span>
                  <MapPin size={15} />
                  Coach End
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="seat-error">
              <Info size={17} />
              <span>{error}</span>
            </div>
          )}
        </div>

        <aside className="booking-summary-card">
          <div className="summary-header">
            <div>
              <span className="section-label">
                BOOKING SUMMARY
              </span>

              <h2>Your Journey</h2>
            </div>
          </div>

          <div className="summary-train">
            <div className="summary-icon">
              <TrainFront size={22} />
            </div>

            <div>
              <strong>
                {train.name}
              </strong>

              <span>
                Train #{train.number}
              </span>
            </div>
          </div>

          <div className="summary-route">
            <div>
              <span>FROM</span>
              <strong>{from}</strong>
            </div>

            <ArrowRight size={17} />

            <div>
              <span>TO</span>
              <strong>{to}</strong>
            </div>
          </div>

          <div className="summary-info-list">
            <div>
              <span>Journey Date</span>
              <strong>{date}</strong>
            </div>

            <div>
              <span>Class</span>
              <strong>
                {train.class || "3A"}
              </strong>
            </div>

            <div>
              <span>Passengers</span>
              <strong>
                {selectedSeats.length}
              </strong>
            </div>
          </div>

          <div className="selected-seat-box">
            <div className="selected-seat-title">
              <Users size={17} />

              <span>
                Selected Seats
              </span>
            </div>

            {selectedSeats.length === 0 ? (
              <p>
                No seats selected yet.
              </p>
            ) : (
              <div className="selected-seat-list">
                {selectedSeats
                  .sort(
                    (a, b) => a - b
                  )
                  .map((seat) => (
                    <span key={seat}>
                      Seat {seat}
                    </span>
                  ))}
              </div>
            )}
          </div>

          <div className="fare-breakdown">
            <div>
              <span>
                Base fare
              </span>

              <strong>
                ₹{train.price} ×{" "}
                {selectedSeats.length}
              </strong>
            </div>

            <div>
              <span>
                Service charge
              </span>

              <strong>
                ₹
                {selectedSeats.length > 0
                  ? 20
                  : 0}
              </strong>
            </div>

            <div className="fare-total">
              <span>
                Total Amount
              </span>

              <strong>
                ₹
                {totalFare +
                  (selectedSeats.length > 0
                    ? 20
                    : 0)}
              </strong>
            </div>
          </div>

          <button
            className="continue-btn"
            disabled={
              selectedSeats.length === 0
            }
            onClick={handleContinue}
          >
            Continue to Passenger Details
            <ArrowRight size={18} />
          </button>

          <div className="secure-note">
            <Check size={15} />
            Secure booking experience
          </div>
        </aside>
      </section>
    </main>
  );
}

export default SeatSelection;
