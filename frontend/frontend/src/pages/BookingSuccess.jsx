import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  TrainFront,
  User,
  CalendarDays,
  MapPin,
  Armchair,
  Download,
  Home,
} from "lucide-react";

function BookingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const train = location.state?.train;
  const seat = location.state?.seat;
  const passenger = location.state?.passenger;

  const pnr = useMemo(() => {
    return Math.floor(
      1000000000 + Math.random() * 9000000000
    ).toString();
  }, []);

  const bookingId = useMemo(() => {
    return `RC${Date.now().toString().slice(-8)}`;
  }, []);

  const bookingDate = new Date().toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

  if (!train || !seat || !passenger) {
    return (
      <main className="success-page">
        <div className="empty-state">
          <TrainFront size={42} />

          <h2>Booking details not found</h2>

          <p>
            Please complete a booking before viewing the
            ticket.
          </p>

          <button
            className="select-train-btn"
            onClick={() => navigate("/")}
          >
            Start New Booking
          </button>
        </div>
      </main>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="success-page">
      <section className="success-container">
        <div className="success-icon">
          <CheckCircle2 size={42} />
        </div>

        <span className="success-label">
          BOOKING CONFIRMED
        </span>

        <h1>Your Ticket is Confirmed!</h1>

        <p className="success-message">
          Your train booking has been successfully created.
          Keep your PNR handy for future reference.
        </p>

        <div className="ticket-card">
          <div className="ticket-top">
            <div className="ticket-brand">
              <div className="brand-icon">
                <TrainFront size={22} />
              </div>

              <div>
                <h2>RailConnect AI</h2>
                <span>Digital E-Ticket</span>
              </div>
            </div>

            <div className="ticket-status">
              <CheckCircle2 size={16} />
              Confirmed
            </div>
          </div>

          <div className="ticket-divider"></div>

          <div className="pnr-section">
            <div>
              <span>PNR NUMBER</span>
              <strong>{pnr}</strong>
            </div>

            <div>
              <span>BOOKING ID</span>
              <strong>{bookingId}</strong>
            </div>

            <div>
              <span>BOOKED ON</span>
              <strong>{bookingDate}</strong>
            </div>
          </div>

          <div className="ticket-route">
            <div>
              <span>{train.source}</span>
              <strong>{train.departure}</strong>
            </div>

            <div className="route-middle">
              <span>{train.duration}</span>
              <div className="route-line"></div>
              <TrainFront size={20} />
            </div>

            <div>
              <span>{train.destination}</span>
              <strong>{train.arrival}</strong>
            </div>
          </div>

          <div className="ticket-details">
            <div className="ticket-detail">
              <MapPin size={17} />
              <div>
                <span>Train</span>
                <strong>
                  {train.name}
                </strong>
              </div>
            </div>

            <div className="ticket-detail">
              <TrainFront size={17} />
              <div>
                <span>Train Number</span>
                <strong>
                  {train.number}
                </strong>
              </div>
            </div>

            <div className="ticket-detail">
              <User size={17} />
              <div>
                <span>Passenger</span>
                <strong>
                  {passenger.name}
                </strong>
              </div>
            </div>

            <div className="ticket-detail">
              <Armchair size={17} />
              <div>
                <span>Seat / Class</span>
                <strong>
                  {seat} / {train.class}
                </strong>
              </div>
            </div>

            <div className="ticket-detail">
              <CalendarDays size={17} />
              <div>
                <span>Journey</span>
                <strong>
                  {train.departure} - {train.arrival}
                </strong>
              </div>
            </div>

            <div className="ticket-detail">
              <MapPin size={17} />
              <div>
                <span>Passenger Mobile</span>
                <strong>
                  {passenger.mobile}
                </strong>
              </div>
            </div>
          </div>

          <div className="ticket-fare">
            <span>Total Fare</span>

            <strong>
              ₹{train.price}
            </strong>
          </div>
        </div>

        <div className="success-actions">
          <button
            className="download-ticket-btn"
            onClick={handlePrint}
          >
            <Download size={18} />
            Print / Save Ticket
          </button>

          <button
            className="home-ticket-btn"
            onClick={() => navigate("/")}
          >
            <Home size={18} />
            Back to Home
          </button>
        </div>

        <p className="demo-note">
          This is a demonstration booking system. No real
          railway reservation or payment has been made.
        </p>
      </section>
    </main>
  );
}

export default BookingSuccess;
