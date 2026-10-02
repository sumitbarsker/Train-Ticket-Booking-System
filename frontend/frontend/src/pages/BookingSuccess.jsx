import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Download,
  Mail,
  MapPin,
  Phone,
  Share2,
  Ticket,
  TrainFront,
  User,
  Users,
} from "lucide-react";

function BookingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const [booking, setBooking] =
    useState(location.state || null);

  useEffect(() => {
    if (!booking) {
      const savedBooking =
        localStorage.getItem(
          "railconnect_last_booking"
        );

      if (savedBooking) {
        try {
          setBooking(
            JSON.parse(savedBooking)
          );
        } catch {
          setBooking(null);
        }
      }
    }
  }, [booking]);

  const formatBookingDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatBookedAt = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (!booking) {
      return;
    }

    const shareText =
      `RailConnect AI Booking\n` +
      `PNR: ${booking.bookingId}\n` +
      `${booking.from} → ${booking.to}\n` +
      `Train: ${booking.train?.name || "-"}\n` +
      `Date: ${formatBookingDate(
        booking.date
      )}`;

    try {
      if (
        navigator.share
      ) {
        await navigator.share({
          title:
            "RailConnect AI Booking",
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(
          shareText
        );

        alert(
          "Booking details copied to clipboard."
        );
      }
    } catch {
      // User cancelled the share dialog.
    }
  };

  if (!booking || !booking.train) {
    return (
      <main className="success-page">
        <section className="empty-results">
          <Ticket size={48} />

          <h2>
            Booking details not found
          </h2>

          <p>
            Your booking details could not
            be loaded.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </section>
      </main>
    );
  }

  const train = booking.train;

  const passengers =
    booking.passengers || [];

  const selectedSeats =
    booking.selectedSeats || [];

  return (
    <main className="success-page">
      <section className="success-hero">
        <div className="success-check">
          <Check size={42} />
        </div>

        <span className="success-label">
          BOOKING CONFIRMED
        </span>

        <h1>
          Your ticket is booked!
        </h1>

        <p>
          Your journey with RailConnect AI
          has been successfully confirmed.
        </p>

        <div className="pnr-badge">
          <span>PNR / BOOKING ID</span>

          <strong>
            {booking.bookingId}
          </strong>
        </div>
      </section>

      <section className="success-actions">
        <button
          className="success-action-btn"
          onClick={handlePrint}
        >
          <Download size={17} />
          Print / Save Ticket
        </button>

        <button
          className="success-action-btn"
          onClick={handleShare}
        >
          <Share2 size={17} />
          Share Ticket
        </button>

        <Link
          to="/my-bookings"
          className="success-action-btn"
        >
          <Ticket size={17} />
          My Bookings
        </Link>
      </section>

      <section className="ticket-wrapper">
        <div className="ticket-card">
          <div className="ticket-top">
            <div className="ticket-brand">
              <div className="ticket-brand-icon">
                <TrainFront size={24} />
              </div>

              <div>
                <strong>
                  RailConnect AI
                </strong>

                <span>
                  Smart Railway Booking
                </span>
              </div>
            </div>

            <div className="ticket-status">
              <Check size={15} />
              Confirmed
            </div>
          </div>

          <div className="ticket-route">
            <div className="ticket-station">
              <span>
                {booking.from}
              </span>

              <strong>
                {train.departure ||
                  "--:--"}
              </strong>

              <small>
                Departure
              </small>
            </div>

            <div className="ticket-route-line">
              <span>
                {train.duration ||
                  "Journey"}
              </span>

              <div className="ticket-line">
                <span></span>
              </div>

              <TrainFront size={19} />
            </div>

            <div className="ticket-station destination">
              <span>
                {booking.to}
              </span>

              <strong>
                {train.arrival ||
                  "--:--"}
              </strong>

              <small>
                Arrival
              </small>
            </div>
          </div>

          <div className="ticket-info-grid">
            <div>
              <CalendarDays size={17} />

              <div>
                <span>
                  Journey Date
                </span>

                <strong>
                  {formatBookingDate(
                    booking.date
                  )}
                </strong>
              </div>
            </div>

            <div>
              <TrainFront size={17} />

              <div>
                <span>
                  Train
                </span>

                <strong>
                  {train.name}
                </strong>
              </div>
            </div>

            <div>
              <Ticket size={17} />

              <div>
                <span>
                  Train Number
                </span>

                <strong>
                  #{train.number}
                </strong>
              </div>
            </div>

            <div>
              <Users size={17} />

              <div>
                <span>
                  Class
                </span>

                <strong>
                  {train.class ||
                    "3A"}
                </strong>
              </div>
            </div>
          </div>

          <div className="ticket-divider"></div>

          <div className="ticket-passenger-section">
            <div className="ticket-section-title">
              <Users size={18} />

              <h3>
                Passenger Details
              </h3>
            </div>

            <div className="ticket-passenger-table">
              <div className="ticket-table-header">
                <span>
                  Passenger
                </span>

                <span>
                  Age / Gender
                </span>

                <span>
                  Seat
                </span>
              </div>

              {passengers.map(
                (
                  passenger,
                  index
                ) => (
                  <div
                    className="ticket-table-row"
                    key={`${passenger.seat}-${index}`}
                  >
                    <div className="ticket-passenger-name">
                      <div className="mini-avatar">
                        <User size={15} />
                      </div>

                      <strong>
                        {passenger.name}
                      </strong>
                    </div>

                    <span>
                      {passenger.age}{" "}
                      /{" "}
                      {passenger.gender}
                    </span>

                    <strong>
                      {passenger.seat}
                    </strong>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="ticket-divider"></div>

          <div className="ticket-bottom-grid">
            <div>
              <div className="ticket-section-title">
                <MapPin size={17} />

                <h3>
                  Route
                </h3>
              </div>

              <strong>
                {booking.from} →{" "}
                {booking.to}
              </strong>
            </div>

            <div>
              <div className="ticket-section-title">
                <Ticket size={17} />

                <h3>
                  Seats
                </h3>
              </div>

              <strong>
                {selectedSeats
                  .slice()
                  .sort(
                    (a, b) => a - b
                  )
                  .join(", ")}
              </strong>
            </div>

            <div>
              <div className="ticket-section-title">
                <Clock3 size={17} />

                <h3>
                  Booked At
                </h3>
              </div>

              <strong>
                {formatBookedAt(
                  booking.bookedAt
                )}
              </strong>
            </div>
          </div>

          <div className="ticket-divider"></div>

          <div className="ticket-contact">
            <div>
              <Phone size={16} />

              <span>
                {booking.contact?.mobile ||
                  "-"}
              </span>
            </div>

            <div>
              <Mail size={16} />

              <span>
                {booking.contact?.email ||
                  "-"}
              </span>
            </div>
          </div>

          <div className="ticket-footer">
            <div>
              <span>
                Total Paid
              </span>

              <strong>
                ₹{booking.finalAmount}
              </strong>
            </div>

            <div>
              <span>
                Payment
              </span>

              <strong>
                {booking.paymentMethod ===
                "upi"
                  ? "UPI"
                  : booking.paymentMethod ===
                    "card"
                  ? "Card"
                  : "Net Banking"}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="success-info-grid">
        <div className="success-info-card">
          <div className="success-info-icon">
            <Mail size={20} />
          </div>

          <div>
            <h3>
              Ticket information
            </h3>

            <p>
              Your booking details are
              available in My Bookings.
            </p>
          </div>
        </div>

        <div className="success-info-card">
          <div className="success-info-icon">
            <ShieldCheckIcon />
          </div>

          <div>
            <h3>
              Secure booking
            </h3>

            <p>
              Your passenger and booking
              information is securely stored.
            </p>
          </div>
        </div>
      </section>

      <section className="success-bottom">
        <button
          className="back-home-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          Back to Home
        </button>

        <Link
          to="/my-bookings"
          className="view-bookings-btn"
        >
          View My Bookings
          <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}

function ShieldCheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default BookingSuccess;
