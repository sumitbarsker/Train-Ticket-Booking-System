import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
  Search,
  Ticket,
  TrainFront,
  User,
  Users,
  XCircle,
} from "lucide-react";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedBooking, setExpandedBooking] =
    useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    try {
      const savedBookings =
        JSON.parse(
          localStorage.getItem(
            "railconnect_bookings"
          ) || "[]"
        );

      setBookings(
        Array.isArray(savedBookings)
          ? savedBookings
          : []
      );
    } catch {
      setBookings([]);
    }
  };

  const formatDate = (date) => {
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

  const formatTime = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const filteredBookings = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return bookings;
    }

    return bookings.filter((booking) => {
      const trainName =
        booking.train?.name || "";

      const trainNumber =
        booking.train?.number || "";

      const bookingId =
        booking.bookingId || "";

      const from =
        booking.from || "";

      const to =
        booking.to || "";

      return [
        trainName,
        trainNumber,
        bookingId,
        from,
        to,
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(query)
      );
    });
  }, [bookings, search]);

  const toggleBooking = (bookingId) => {
    setExpandedBooking((current) =>
      current === bookingId
        ? null
        : bookingId
    );
  };

  const removeBooking = (bookingId) => {
    const updatedBookings =
      bookings.filter(
        (booking) =>
          booking.bookingId !== bookingId
      );

    setBookings(updatedBookings);

    localStorage.setItem(
      "railconnect_bookings",
      JSON.stringify(updatedBookings)
    );

    if (
      expandedBooking === bookingId
    ) {
      setExpandedBooking(null);
    }
  };

  const clearAllBookings = () => {
    const shouldClear = window.confirm(
      "Are you sure you want to clear your local booking history?"
    );

    if (!shouldClear) {
      return;
    }

    setBookings([]);

    localStorage.removeItem(
      "railconnect_bookings"
    );

    localStorage.removeItem(
      "railconnect_last_booking"
    );
  };

  return (
    <main className="bookings-page">
      <section className="bookings-header">
        <div className="bookings-header-content">
          <div>
            <span className="section-label">
              YOUR TRAVEL HISTORY
            </span>

            <h1>My Bookings</h1>

            <p>
              View and manage your RailConnect
              AI train bookings.
            </p>
          </div>

          <div className="booking-count-card">
            <Ticket size={21} />

            <div>
              <strong>
                {bookings.length}
              </strong>

              <span>
                {bookings.length === 1
                  ? "Booking"
                  : "Bookings"}
              </span>
            </div>
          </div>
        </div>

        <div className="booking-toolbar">
          <div className="booking-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search by train, PNR or route..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>

          {bookings.length > 0 && (
            <button
              className="clear-bookings-btn"
              onClick={
                clearAllBookings
              }
            >
              Clear History
            </button>
          )}
        </div>
      </section>

      <section className="bookings-content">
        {bookings.length === 0 ? (
          <div className="no-bookings-card">
            <div className="no-bookings-icon">
              <Ticket size={36} />
            </div>

            <span className="section-label">
              NO BOOKINGS YET
            </span>

            <h2>
              Your journey starts here
            </h2>

            <p>
              You haven't made any train
              bookings yet. Search for a train
              and book your first journey.
            </p>

            <button
              className="primary-btn"
              onClick={() => navigate("/")}
            >
              Search Trains
              <ArrowRight size={17} />
            </button>
          </div>
        ) : filteredBookings.length ===
          0 ? (
          <div className="no-bookings-card">
            <div className="no-bookings-icon">
              <Search size={34} />
            </div>

            <span className="section-label">
              NO MATCHES
            </span>

            <h2>
              No booking found
            </h2>

            <p>
              Try searching with a different
              train name, PNR or route.
            </p>

            <button
              className="primary-btn"
              onClick={() => setSearch("")}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="booking-list">
            {filteredBookings.map(
              (booking) => {
                const isExpanded =
                  expandedBooking ===
                  booking.bookingId;

                const train =
                  booking.train || {};

                const passengers =
                  booking.passengers || [];

                const seats =
                  booking.selectedSeats || [];

                return (
                  <article
                    className="booking-card"
                    key={booking.bookingId}
                  >
                    <div className="booking-card-top">
                      <div className="booking-status">
                        <span className="status-dot"></span>
                        Confirmed
                      </div>

                      <div className="booking-pnr">
                        <span>
                          PNR / BOOKING ID
                        </span>

                        <strong>
                          {booking.bookingId}
                        </strong>
                      </div>
                    </div>

                    <div className="booking-main">
                      <div className="booking-train">
                        <div className="booking-train-icon">
                          <TrainFront
                            size={24}
                          />
                        </div>

                        <div>
                          <h2>
                            {train.name ||
                              "Train"}
                          </h2>

                          <span>
                            Train #
                            {train.number ||
                              "-"}
                          </span>
                        </div>
                      </div>

                      <div className="booking-route">
                        <div>
                          <span>
                            FROM
                          </span>

                          <strong>
                            {booking.from}
                          </strong>

                          <small>
                            {train.departure ||
                              "--:--"}
                          </small>
                        </div>

                        <div className="booking-route-line">
                          <span>
                            {train.duration ||
                              "Journey"}
                          </span>

                          <div></div>

                          <ArrowRight
                            size={17}
                          />
                        </div>

                        <div>
                          <span>
                            TO
                          </span>

                          <strong>
                            {booking.to}
                          </strong>

                          <small>
                            {train.arrival ||
                              "--:--"}
                          </small>
                        </div>
                      </div>

                      <div className="booking-date">
                        <CalendarDays
                          size={18}
                        />

                        <div>
                          <span>
                            Journey Date
                          </span>

                          <strong>
                            {formatDate(
                              booking.date
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="booking-meta">
                      <div>
                        <Ticket size={16} />

                        <span>
                          Class:{" "}
                          <strong>
                            {train.class ||
                              "3A"}
                          </strong>
                        </span>
                      </div>

                      <div>
                        <Users size={16} />

                        <span>
                          Seats:{" "}
                          <strong>
                            {seats
                              .slice()
                              .sort(
                                (a, b) =>
                                  a - b
                              )
                              .join(
                                ", "
                              )}
                          </strong>
                        </span>
                      </div>

                      <div>
                        <User size={16} />

                        <span>
                          Passengers:{" "}
                          <strong>
                            {
                              passengers.length
                            }
                          </strong>
                        </span>
                      </div>

                      <div className="booking-amount">
                        <span>
                          Total
                        </span>

                        <strong>
                          ₹
                          {
                            booking.finalAmount
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="booking-actions">
                      <button
                        className="view-booking-btn"
                        onClick={() =>
                          toggleBooking(
                            booking.bookingId
                          )
                        }
                      >
                        {isExpanded ? (
                          <>
                            Hide Details
                            <ChevronUp
                              size={17}
                            />
                          </>
                        ) : (
                          <>
                            View Details
                            <ChevronDown
                              size={17}
                            />
                          </>
                        )}
                      </button>

                      <button
                        className="delete-booking-btn"
                        onClick={() =>
                          removeBooking(
                            booking.bookingId
                          )
                        }
                      >
                        <XCircle
                          size={16}
                        />
                        Remove
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="booking-details">
                        <div className="details-divider"></div>

                        <div className="details-grid">
                          <div className="details-section">
                            <div className="details-title">
                              <Users
                                size={17}
                              />

                              <h3>
                                Passengers
                              </h3>
                            </div>

                            <div className="details-passengers">
                              {passengers.map(
                                (
                                  passenger,
                                  index
                                ) => (
                                  <div
                                    className="details-passenger"
                                    key={`${passenger.seat}-${index}`}
                                  >
                                    <div className="details-avatar">
                                      <User
                                        size={
                                          15
                                        }
                                      />
                                    </div>

                                    <div>
                                      <strong>
                                        {
                                          passenger.name
                                        }
                                      </strong>

                                      <span>
                                        {
                                          passenger.age
                                        }{" "}
                                        years
                                        {" • "}
                                        {
                                          passenger.gender
                                        }
                                      </span>
                                    </div>

                                    <b>
                                      Seat{" "}
                                      {
                                        passenger.seat
                                      }
                                    </b>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          <div className="details-section">
                            <div className="details-title">
                              <MapPin
                                size={
                                  17
                                }
                              />

                              <h3>
                                Journey
                              </h3>
                            </div>

                            <div className="journey-detail-list">
                              <div>
                                <span>
                                  Route
                                </span>

                                <strong>
                                  {
                                    booking.from
                                  }{" "}
                                  →{" "}
                                  {
                                    booking.to
                                  }
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Date
                                </span>

                                <strong>
                                  {formatDate(
                                    booking.date
                                  )}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Departure
                                </span>

                                <strong>
                                  {train.departure ||
                                    "--:--"}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Arrival
                                </span>

                                <strong>
                                  {train.arrival ||
                                    "--:--"}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Duration
                                </span>

                                <strong>
                                  {train.duration ||
                                    "-"}
                                </strong>
                              </div>
                            </div>
                          </div>

                          <div className="details-section">
                            <div className="details-title">
                              <Clock3
                                size={
                                  17
                                }
                              />

                              <h3>
                                Booking
                              </h3>
                            </div>

                            <div className="journey-detail-list">
                              <div>
                                <span>
                                  Booking ID
                                </span>

                                <strong>
                                  {
                                    booking.bookingId
                                  }
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

                              <div>
                                <span>
                                  Ticket Fare
                                </span>

                                <strong>
                                  ₹
                                  {
                                    booking.totalFare
                                  }
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Service Charge
                                </span>

                                <strong>
                                  ₹
                                  {
                                    booking.serviceCharge
                                  }
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Total Paid
                                </span>

                                <strong className="detail-total">
                                  ₹
                                  {
                                    booking.finalAmount
                                  }
                                </strong>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>

      {bookings.length > 0 && (
        <section className="bookings-footer-note">
          <Ticket size={17} />

          <span>
            Your booking history is currently
            stored locally in this browser.
          </span>
        </section>
      )}
    </main>
  );
}

export default MyBookings;
