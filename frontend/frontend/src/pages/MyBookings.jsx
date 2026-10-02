import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Search,
  Ticket,
  TrainFront,
  XCircle,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [pnr, setPnr] = useState("");
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/bookings/`
      );

      setBookings(response.data || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!pnr.trim()) {
      setError("Please enter a PNR.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await axios.get(
        `${API_URL}/bookings/${pnr.trim().toUpperCase()}`
      );

      setBookings([response.data]);
    } catch (err) {
      setBookings([]);

      setError(
        err.response?.data?.detail ||
          "Booking not found."
      );
    }
  };

  const handleCancel = async (bookingPnr) => {
    const confirmed = window.confirm(
      `Cancel ticket with PNR ${bookingPnr}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(bookingPnr);
      setError("");
      setSuccess("");

      await axios.patch(
        `${API_URL}/bookings/${bookingPnr}/cancel`
      );

      setSuccess(
        `Ticket ${bookingPnr} has been cancelled successfully.`
      );

      await fetchBookings();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to cancel booking."
      );
    } finally {
      setCancelling("");
    }
  };

  return (
    <main className="page-container">
      <div className="booking-header">
        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Home
        </button>

        <div>
          <span className="section-label">
            BOOKING MANAGEMENT
          </span>

          <h1>My Bookings</h1>

          <p>
            View and manage your train tickets.
          </p>
        </div>
      </div>

      <form
        className="booking-search"
        onSubmit={handleSearch}
      >
        <div className="booking-search-input">
          <Search size={18} />

          <input
            type="text"
            value={pnr}
            placeholder="Enter PNR number"
            onChange={(event) =>
              setPnr(event.target.value)
            }
          />
        </div>

        <button
          type="submit"
          className="search-btn"
        >
          Search Booking
        </button>

        <button
          type="button"
          className="secondary-btn"
          onClick={fetchBookings}
        >
          Show All
        </button>
      </form>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {loading ? (
        <div className="loading-card">
          <LoaderCircle
            size={28}
            className="loading-icon"
          />

          <p>Loading your bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-results">
          <Ticket size={42} />

          <h2>No bookings found</h2>

          <p>
            Your confirmed tickets will appear here.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            Book a Train
          </button>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <article
              className="booking-card"
              key={booking.pnr}
            >
              <div className="booking-card-header">
                <div className="pnr-section">
                  <span>PNR</span>
                  <strong>{booking.pnr}</strong>
                </div>

                <div
                  className={
                    booking.status === "Confirmed"
                      ? "booking-status confirmed"
                      : "booking-status cancelled"
                  }
                >
                  {booking.status === "Confirmed" ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <XCircle size={15} />
                  )}

                  {booking.status}
                </div>
              </div>

              <div className="booking-train">
                <div className="booking-train-icon">
                  <TrainFront size={24} />
                </div>

                <div>
                  <h3>
                    {booking.train.name}
                  </h3>

                  <span>
                    Train #{booking.train.number}
                  </span>
                </div>
              </div>

              <div className="booking-route">
                <div>
                  <span>From</span>

                  <strong>
                    {booking.train.source}
                  </strong>

                  <small>
                    {booking.train.departure}
                  </small>
                </div>

                <div className="booking-route-line">
                  <span>→</span>
                </div>

                <div>
                  <span>To</span>

                  <strong>
                    {booking.train.destination}
                  </strong>

                  <small>
                    {booking.train.arrival}
                  </small>
                </div>
              </div>

              <div className="booking-details-grid">
                <div>
                  <CalendarDays size={16} />

                  <span>Journey</span>

                  <strong>
                    {booking.journey_date}
                  </strong>
                </div>

                <div>
                  <Ticket size={16} />

                  <span>Seat</span>

                  <strong>
                    {booking.seat}
                  </strong>
                </div>

                <div>
                  <TrainFront size={16} />

                  <span>Class</span>

                  <strong>
                    {booking.train.class}
                  </strong>
                </div>

                <div>
                  <Clock3 size={16} />

                  <span>Booking ID</span>

                  <strong>
                    {booking.booking_id}
                  </strong>
                </div>
              </div>

              <div className="passenger-summary">
                <div>
                  <span>Passenger</span>

                  <strong>
                    {booking.passenger.name}
                  </strong>
                </div>

                <div>
                  <span>Age</span>

                  <strong>
                    {booking.passenger.age}
                  </strong>
                </div>

                <div>
                  <span>Mobile</span>

                  <strong>
                    {booking.passenger.mobile}
                  </strong>
                </div>
              </div>

              <div className="booking-card-footer">
                <div className="booking-fare">
                  <span>Total Fare</span>

                  <strong>
                    ₹{booking.fare}
                  </strong>
                </div>

                {booking.status === "Confirmed" && (
                  <button
                    className="cancel-booking-btn"
                    disabled={
                      cancelling === booking.pnr
                    }
                    onClick={() =>
                      handleCancel(booking.pnr)
                    }
                  >
                    {cancelling === booking.pnr
                      ? "Cancelling..."
                      : "Cancel Ticket"}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

export default MyBookings;
