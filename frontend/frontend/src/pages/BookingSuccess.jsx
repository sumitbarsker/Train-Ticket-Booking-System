import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Download,
  Home,
  CalendarDays,
  MapPin,
  TrainFront,
  Users,
  Ticket,
  Printer,
} from "lucide-react";

function BookingSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state;

  const backendBooking = state?.backendBooking;

  const booking = useMemo(() => {
    if (!state) return null;

    const train = state.train || backendBooking?.train || {};

    const rawSeats =
      state.seats ??
      (typeof backendBooking?.seats === "string"
        ? backendBooking.seats.split(",").map((seat) => seat.trim())
        : backendBooking?.seats ?? []);

    const seats = Array.isArray(rawSeats)
      ? rawSeats
      : [];

    const passengers =
      state.passengers ??
      backendBooking?.passengers ??
      [];

    return {
      bookingId:
        backendBooking?.booking_id ||
        state.bookingId ||
        `RC${Date.now()}`,

      pnr:
        backendBooking?.pnr ||
        state.pnr ||
        "Pending",

      train,

      from:
        state.from ||
        backendBooking?.from_station ||
        "",

      to:
        state.to ||
        backendBooking?.to_station ||
        "",

      date:
        state.date ||
        backendBooking?.journey_date ||
        "",

      seatClass:
        state.seatClass ||
        backendBooking?.seat_class ||
        "",

      seats,

      passengers,

      contact:
        state.contact || {
          email: backendBooking?.contact_email || "",
          phone: backendBooking?.contact_phone || "",
        },

      totalAmount:
        backendBooking?.total_amount ??
        state.totalAmount ??
        0,

      paymentMethod:
        backendBooking?.payment_method ||
        state.paymentMethod ||
        "",

      status:
        backendBooking?.status ||
        "Confirmed",

      createdAt: new Date().toISOString(),
    };
  }, [state, backendBooking]);

  useEffect(() => {
    if (!booking) return;

    try {
      const savedBookings = JSON.parse(
        localStorage.getItem("railconnect_bookings") || "[]"
      );

      const alreadySaved = savedBookings.some(
        (item) =>
          item.bookingId === booking.bookingId ||
          item.pnr === booking.pnr
      );

      if (!alreadySaved) {
        localStorage.setItem(
          "railconnect_bookings",
          JSON.stringify([booking, ...savedBookings])
        );
      }
    } catch (error) {
      console.error("Unable to save booking locally:", error);
    }
  }, [booking]);

  if (!booking) {
    return (
      <main className="page-container">
        <div className="empty-state">
          <h2>Booking details unavailable</h2>
          <p>
            Please check My Bookings or start a new booking.
          </p>

          <Link to="/" className="primary-btn">
            Go to Home
          </Link>
        </div>
      </main>
    );
  }

  const trainName = booking.train?.name || "Train";
  const trainNumber = booking.train?.number || "";

  const passengerNames = booking.passengers
    .map((passenger) => passenger.name)
    .filter(Boolean)
    .join(", ");

  const downloadTicket = () => {
    window.print();
  };

  const copyPNR = async () => {
    try {
      await navigator.clipboard.writeText(booking.pnr);
      window.alert("PNR copied successfully!");
    } catch {
      window.prompt("Copy your PNR:", booking.pnr);
    }
  };

  return (
    <main className="page-container success-page">
      <section className="success-header">
        <div className="success-icon">
          <CheckCircle2 size={48} />
        </div>

        <h1>Booking Confirmed!</h1>

        <p>
          Your booking has been processed successfully.
          Keep your PNR handy for future reference.
        </p>

        <div className="success-status">
          <CheckCircle2 size={16} />
          {booking.status}
        </div>
      </section>

      <section className="ticket-card" id="booking-ticket">
        <div className="ticket-top">
          <div className="ticket-brand">
            <div className="ticket-brand-icon">
              <TrainFront size={25} />
            </div>

            <div>
              <h2>RailConnect AI</h2>
              <p>Electronic Journey Ticket</p>
            </div>
          </div>

          <div className="ticket-status">
            <CheckCircle2 size={16} />
            Confirmed
          </div>
        </div>

        <div className="ticket-pnr-section">
          <div>
            <span>PNR NUMBER</span>
            <h2>{booking.pnr}</h2>
          </div>

          <button
            className="secondary-btn"
            onClick={copyPNR}
            type="button"
          >
            Copy PNR
          </button>
        </div>

        <div className="ticket-train-info">
          <div>
            <span>TRAIN NAME</span>
            <strong>{trainName}</strong>
            <small>{trainNumber}</small>
          </div>

          <div>
            <span>TRAVEL CLASS</span>
            <strong>{booking.seatClass || "—"}</strong>
          </div>

          <div>
            <span>JOURNEY DATE</span>
            <strong>{booking.date || "—"}</strong>
          </div>
        </div>

        <div className="ticket-route">
          <div className="ticket-station">
            <MapPin size={19} />
            <span>FROM</span>
            <h3>{booking.from || "—"}</h3>
            <small>{booking.train?.departure || ""}</small>
          </div>

          <div className="ticket-route-line">
            <TrainFront size={23} />
            <div />
            <span>{booking.train?.duration || "Journey"}</span>
          </div>

          <div className="ticket-station destination">
            <MapPin size={19} />
            <span>TO</span>
            <h3>{booking.to || "—"}</h3>
            <small>{booking.train?.arrival || ""}</small>
          </div>
        </div>

        <div className="ticket-divider">
          <span />
          <span />
        </div>

        <div className="ticket-details-grid">
          <div>
            <CalendarDays size={18} />
            <div>
              <span>Booking ID</span>
              <strong>{booking.bookingId}</strong>
            </div>
          </div>

          <div>
            <Ticket size={18} />
            <div>
              <span>Seat Numbers</span>
              <strong>
                {booking.seats.length
                  ? booking.seats.join(", ")
                  : "—"}
              </strong>
            </div>
          </div>

          <div>
            <Users size={18} />
            <div>
              <span>Passengers</span>
              <strong>{booking.passengers.length}</strong>
            </div>
          </div>

          <div>
            <CheckCircle2 size={18} />
            <div>
              <span>Payment Method</span>
              <strong>{booking.paymentMethod || "—"}</strong>
            </div>
          </div>
        </div>

        <div className="ticket-passengers">
          <h3>Passenger Details</h3>

          {booking.passengers.length ? (
            booking.passengers.map((passenger, index) => (
              <div
                className="ticket-passenger-row"
                key={`${passenger.seat || index}-${index}`}
              >
                <div className="passenger-number">
                  {index + 1}
                </div>

                <div className="ticket-passenger-name">
                  <strong>{passenger.name}</strong>
                  <span>
                    {passenger.age} years · {passenger.gender}
                  </span>
                </div>

                <div className="ticket-passenger-seat">
                  {passenger.seat || booking.seats[index] || "—"}
                </div>
              </div>
            ))
          ) : (
            <p>Passenger information is unavailable.</p>
          )}
        </div>

        <div className="ticket-total">
          <span>Total Amount Paid</span>
          <strong>₹{Number(booking.totalAmount).toLocaleString("en-IN")}</strong>
        </div>

        <div className="ticket-footer">
          <p>
            Contact: {booking.contact.email || "—"}
          </p>
          <p>
            Please verify your journey details before travelling.
          </p>
        </div>
      </section>

      <section className="success-actions">
        <button
          className="primary-btn"
          onClick={downloadTicket}
          type="button"
        >
          <Download size={18} />
          Download / Print Ticket
        </button>

        <button
          className="secondary-btn"
          onClick={() => navigate("/my-bookings")}
          type="button"
        >
          <Ticket size={18} />
          My Bookings
        </button>

        <button
          className="secondary-btn"
          onClick={() => navigate("/")}
          type="button"
        >
          <Home size={18} />
          Back to Home
        </button>
      </section>
    </main>
  );
}

export default BookingSuccess;
