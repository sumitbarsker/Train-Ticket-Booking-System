import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CalendarDays,
  ChevronRight,
  Loader2,
  MapPin,
  Search,
  Ticket,
  TrainFront,
  XCircle,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_URL}/bookings/`);

      const backendBookings = response.data?.bookings || [];

      setBookings(backendBookings);
    } catch (err) {
      console.error("Unable to fetch bookings:", err);

      // Local storage fallback
      try {
        const localBookings = JSON.parse(
          localStorage.getItem("railconnect_bookings") || "[]"
        );

        setBookings(localBookings);

        if (localBookings.length === 0) {
          setError(
            "Unable to connect to the booking server."
          );
        }
      } catch {
        setBookings([]);
        setError("Unable to load bookings.");
      }
    } finally {
      setLoading(false);
    }
  };

  const normalizedBookings = bookings.map((booking) => ({
    ...booking,

    bookingId:
      booking.booking_id ||
      booking.bookingId ||
      booking.id,

    pnr: booking.pnr || "—",

    train: booking.train || {},

    from:
      booking.from_station ||
      booking.from ||
      "",

    to:
      booking.to_station ||
      booking.to ||
      "",

    date:
      booking.journey_date ||
      booking.date ||
      "",

    seatClass:
      booking.seat_class ||
      booking.seatClass ||
      "",

    seats:
      typeof booking.seats === "string"
        ? booking.seats
            .split(",")
            .map((seat) => seat.trim())
        : booking.seats || [],

    totalAmount:
      booking.total_amount ??
      booking.totalAmount ??
      0,

    status: booking.status || "Confirmed",
  }));

  const filteredBookings = normalizedBookings.filter(
    (booking) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        String(booking.pnr)
          .toLowerCase()
          .includes(query) ||
        String(booking.bookingId)
          .toLowerCase()
          .includes(query) ||
        String(booking.train?.name || "")
          .toLowerCase()
          .includes(query) ||
        String(booking.from)
          .toLowerCase()
          .includes(query) ||
        String(booking.to)
          .toLowerCase()
          .includes(query);

      const status = String(
        booking.status
      ).toLowerCase();

      const matchesFilter =
        filter === "all" ||
        (filter === "active" &&
          status !== "cancelled") ||
        (filter === "cancelled" &&
          status === "cancelled");

      return matchesSearch && matchesFilter;
    }
  );

  const openBooking = (booking) => {
    navigate("/booking-success", {
      state: {
        bookingId: booking.bookingId,
        pnr: booking.pnr,
        train: booking.train,
        from: booking.from,
        to: booking.to,
        date: booking.date,
        seatClass: booking.seatClass,
        seats: booking.seats,
        passengers: booking.passengers || [],
        contact: {
          email: booking.contact_email || "",
          phone: booking.contact_phone || "",
        },
        totalAmount: booking.totalAmount,
        paymentMethod: booking.payment_method || "",
        backendBooking: booking,
      },
    });
  };

  if (loading) {
    return (
      <main className="page-container">
        <div className="loading-state">
          <Loader2 className="spin" size={32} />
          <p>Loading your bookings...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div className="bookings-header">
        <div>
          <h1>My Bookings</h1>
          <p>
            View and manage your RailConnect AI journeys.
          </p>
        </div>

        <Link to="/" className="primary-btn">
          <TrainFront size={18} />
          Book New Ticket
        </Link>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <section className="booking-toolbar">
        <div className="booking-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search by PNR, train or route..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        <div className="booking-filters">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>

          <button
            className={filter === "active" ? "active" : ""}
            onClick={() => setFilter("active")}
          >
            Active
          </button>

          <button
            className={
              filter === "cancelled" ? "active" : ""
            }
            onClick={() => setFilter("cancelled")}
          >
            Cancelled
          </button>
        </div>
      </section>

      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <Ticket size={45} />

          <h2>
            {bookings.length === 0
              ? "No bookings yet"
              : "No matching bookings"}
          </h2>

          <p>
            {bookings.length === 0
              ? "Your confirmed train journeys will appear here."
              : "Try changing your search or filter."}
          </p>

          {bookings.length === 0 && (
            <Link to="/" className="primary-btn">
              Search Trains
            </Link>
          )}
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking) => {
            const cancelled =
              String(booking.status).toLowerCase() ===
              "cancelled";

            return (
              <article
                className={`booking-card ${
                  cancelled ? "cancelled" : ""
                }`}
                key={
                  booking.bookingId ||
                  booking.pnr
                }
              >
                <div className="booking-card-top">
                  <div className="booking-train">
                    <div className="booking-train-icon">
                      <TrainFront size={22} />
                    </div>

                    <div>
                      <h2>
                        {booking.train?.name ||
                          "Train"}
                      </h2>

                      <span>
                        {booking.train?.number ||
                          ""}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`booking-status ${
                      cancelled
                        ? "cancelled"
                        : "confirmed"
                    }`}
                  >
                    {cancelled ? (
                      <XCircle size={16} />
                    ) : (
                      <Ticket size={16} />
                    )}

                    {booking.status}
                  </div>
                </div>

                <div className="booking-route">
                  <div>
                    <span>FROM</span>
                    <strong>{booking.from}</strong>
                    <small>
                      {booking.train?.departure ||
                        ""}
                    </small>
                  </div>

                  <div className="booking-route-middle">
                    <ChevronRight size={20} />
                  </div>

                  <div>
                    <span>TO</span>
                    <strong>{booking.to}</strong>
                    <small>
                      {booking.train?.arrival ||
                        ""}
                    </small>
                  </div>
                </div>

                <div className="booking-meta">
                  <div>
                    <CalendarDays size={17} />
                    <span>
                      {booking.date}
                    </span>
                  </div>

                  <div>
                    <MapPin size={17} />
                    <span>
                      {booking.seatClass}
                    </span>
                  </div>

                  <div>
                    <Ticket size={17} />
                    <span>
                      {booking.seats.join(", ") ||
                        "—"}
                    </span>
                  </div>

                  <div>
                    <strong>
                      ₹
                      {Number(
                        booking.totalAmount
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                <div className="booking-card-bottom">
                  <div>
                    <span>PNR</span>
                    <strong>{booking.pnr}</strong>
                  </div>

                  <div>
                    <span>Booking ID</span>
                    <strong>
                      {booking.bookingId}
                    </strong>
                  </div>

                  <button
                    className="secondary-btn"
                    onClick={() =>
                      openBooking(booking)
                    }
                  >
                    View Ticket
                    <ChevronRight size={17} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <button
        className="refresh-bookings-btn"
        onClick={fetchBookings}
      >
        Refresh Bookings
      </button>
    </main>
  );
}

export default MyBookings;
