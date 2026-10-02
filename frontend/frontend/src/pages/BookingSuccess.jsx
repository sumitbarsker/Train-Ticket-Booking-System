import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Mail,
  MapPin,
  Phone,
  Printer,
  ShieldCheck,
  TrainFront,
  User,
} from "lucide-react";

function BookingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    train,
    from,
    to,
    date,
    seats = [],
    seatClass = "3A",
    passengers = [],
    contact = {},
    totalAmount = 0,
    paymentMethod = "upi",
  } = location.state || {};

  const pnr = useMemo(() => {
    const randomPart = Math.floor(
      100000 + Math.random() * 900000
    );

    return String(randomPart);
  }, []);

  const bookingId = useMemo(() => {
    const randomPart = Math.floor(
      100000 + Math.random() * 900000
    );

    return `RC${randomPart}`;
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  if (!train || seats.length === 0) {
    return (
      <main className="booking-page">
        <section className="empty-results">
          <TrainFront size={46} />

          <h2>Booking not found</h2>

          <p>
            No completed booking information is
            available.
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            Book a Train
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="booking-page success-page">
      <section className="success-hero">
        <div className="success-icon">
          <CheckCircle2 size={52} />
        </div>

        <span className="section-label">
          BOOKING CONFIRMED
        </span>

        <h1>Your Ticket is Confirmed!</h1>

        <p>
          Your train booking has been successfully
          created. Have a safe journey.
        </p>

        <div className="success-actions">
          <button
            className="secondary-action-btn"
            onClick={handlePrint}
          >
            <Printer size={17} />
            Print Ticket
          </button>

          <button
            className="primary-action-btn"
            onClick={handleDownload}
          >
            <Download size={17} />
            Download Ticket
          </button>
        </div>
      </section>

      <section className="ticket-wrapper">
        <div className="ticket-card">
          <div className="ticket-header">
            <div className="ticket-brand">
              <div className="ticket-brand-icon">
                <TrainFront size={24} />
              </div>

              <div>
                <h2>RailConnect AI</h2>

                <span>
                  Smart Railway Booking
                </span>
              </div>
            </div>

            <div className="ticket-status">
              <CheckCircle2 size={17} />
              Confirmed
            </div>
          </div>

          <div className="ticket-divider"></div>

          <div className="ticket-identifiers">
            <div>
              <span>PNR NUMBER</span>

              <strong>{pnr}</strong>
            </div>

            <div>
              <span>BOOKING ID</span>

              <strong>{bookingId}</strong>
            </div>

            <div>
              <span>PAYMENT</span>

              <strong>
                {paymentMethod.toUpperCase()}
              </strong>
            </div>
          </div>

          <div className="ticket-route">
            <div className="station">
              <span className="station-time">
                {train.departure}
              </span>

              <strong>{from}</strong>

              <small>
                Departure
              </small>
            </div>

            <div className="route-middle">
              <span>
                {train.duration}
              </span>

              <div className="route-track">
                <span></span>
              </div>

              <small>
                {train.type}
              </small>
            </div>

            <div className="station destination">
              <span className="station-time">
                {train.arrival}
              </span>

              <strong>{to}</strong>

              <small>
                Arrival
              </small>
            </div>
          </div>

          <div className="ticket-details-grid">
            <div className="ticket-detail">
              <CalendarDays size={18} />

              <div>
                <span>Journey Date</span>
                <strong>{date}</strong>
              </div>
            </div>

            <div className="ticket-detail">
              <TrainFront size={18} />

              <div>
                <span>Train</span>
                <strong>
                  {train.name}
                </strong>
              </div>
            </div>

            <div className="ticket-detail">
              <Clock3 size={18} />

              <div>
                <span>Duration</span>
                <strong>
                  {train.duration}
                </strong>
              </div>
            </div>

            <div className="ticket-detail">
              <MapPin size={18} />

              <div>
                <span>Class</span>
                <strong>
                  {seatClass}
                </strong>
              </div>
            </div>
          </div>

          <div className="ticket-section">
            <div className="ticket-section-title">
              <User size={19} />

              <h3>
                Passenger Details
              </h3>
            </div>

            <div className="ticket-passenger-table">
              <div className="ticket-table-head">
                <span>#</span>
                <span>Passenger</span>
                <span>Age</span>
                <span>Gender</span>
                <span>Seat</span>
              </div>

              {passengers.map(
                (passenger, index) => (
                  <div
                    className="ticket-table-row"
                    key={
                      passenger.seat ||
                      index
                    }
                  >
                    <span>
                      {index + 1}
                    </span>

                    <strong>
                      {passenger.name}
                    </strong>

                    <span>
                      {passenger.age}
                    </span>

                    <span>
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

          <div className="ticket-section fare-section">
            <div className="ticket-section-title">
              <span className="fare-symbol">
                ₹
              </span>

              <h3>
                Fare Details
              </h3>
            </div>

            <div className="ticket-fare-row">
              <span>
                Ticket Fare
              </span>

              <strong>
                ₹
                {Math.max(
                  0,
                  totalAmount - 20
                )}
              </strong>
            </div>

            <div className="ticket-fare-row">
              <span>
                Convenience Fee
              </span>

              <strong>
                ₹20
              </strong>
            </div>

            <div className="ticket-fare-total">
              <span>
                Total Paid
              </span>

              <strong>
                ₹{totalAmount}
              </strong>
            </div>
          </div>

          <div className="ticket-contact">
            <div>
              <Mail size={17} />

              <span>
                {contact.email}
              </span>
            </div>

            <div>
              <Phone size={17} />

              <span>
                +91 {contact.phone}
              </span>
            </div>
          </div>

          <div className="ticket-footer">
            <ShieldCheck size={18} />

            <span>
              This is a digitally generated ticket
              from RailConnect AI.
            </span>
          </div>
        </div>
      </section>

      <section className="after-booking">
        <div className="after-booking-card">
          <div>
            <span className="section-label">
              YOUR BOOKINGS
            </span>

            <h2>
              Want to view this booking later?
            </h2>

            <p>
              Open My Bookings to manage and
              review your tickets.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={() =>
              navigate("/my-bookings")
            }
          >
            View My Bookings
          </button>
        </div>

        <button
          className="back-home-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={17} />
          Back to Home
        </button>
      </section>
    </main>
  );
}

export default BookingSuccess;
