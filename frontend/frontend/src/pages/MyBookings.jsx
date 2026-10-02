import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  MapPin,
  Search,
  Ticket,
  TrainFront,
  User,
  Users,
} from "lucide-react";

const STORAGE_KEY = "railconnect_bookings";

function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] =
    useState("");
  const [activeFilter, setActiveFilter] =
    useState("all");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = () => {
    try {
      const savedBookings =
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEY
          )
        ) || [];

      setBookings(savedBookings);
    } catch {
      setBookings([]);
    }
  };

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (activeFilter === "upcoming") {
      result = result.filter(
        (booking) =>
          booking.status !== "Cancelled"
      );
    }

    if (activeFilter === "cancelled") {
      result = result.filter(
        (booking) =>
          booking.status === "Cancelled"
      );
    }

    if (searchTerm.trim()) {
      const search =
        searchTerm.toLowerCase();

      result = result.filter(
        (booking) => {
          return (
            String(
              booking.pnr || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              booking.bookingId || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              booking.train?.name || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              booking.from || ""
            )
              .toLowerCase()
              .includes(search) ||
            String(
              booking.to || ""
            )
              .toLowerCase()
              .includes(search)
          );
        }
      );
    }

    return result;
  }, [
    bookings,
    searchTerm,
    activeFilter,
  ]);

  const handleViewTicket = (booking) => {
    navigate("/booking-success", {
      state: {
        train: booking.train,
        from: booking.from,
        to: booking.to,
        date: booking.date,
        seats: booking.seats || [],
        seatClass:
          booking.seatClass || "3A",
        passengers:
          booking.passengers || [],
        contact:
          booking.contact || {},
        totalAmount:
          booking.totalAmount || 0,
        paymentMethod:
          booking.paymentMethod ||
          "upi",
        pnr:
          booking.pnr,
        bookingId:
          booking.bookingId,
      },
    });
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <main className="my-bookings-page">
      <section className="my-bookings-hero">
        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Back to Home
        </button>

        <div className="my-bookings-heading">
          <div>
            <span className="section-label">
              MY JOURNEYS
            </span>

            <h1>My Bookings</h1>

            <p>
              View and manage your RailConnect
              AI train bookings.
            </p>
          </div>

          <div className="booking-count-card">
            <Ticket size={23} />

            <div>
              <strong>
                {bookings.length}
              </strong>

              <span>
                Total Booking
                {bookings.length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="bookings-toolbar">
        <div className="booking-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by PNR, train, city or booking ID..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
          />
        </div>

        <div className="booking-filters">
          <button
            className={
              activeFilter === "all"
                ? "booking-filter active"
                : "booking-filter"
            }
            onClick={() =>
              setActiveFilter("all")
            }
          >
            All
          </button>

          <button
            className={
              activeFilter === "upcoming"
                ? "booking-filter active"
                : "booking-filter"
            }
            onClick={() =>
              setActiveFilter("upcoming")
            }
          >
            Active
          </button>

          <button
            className={
              activeFilter === "cancelled"
                ? "booking-filter active"
                : "booking-filter"
            }
            onClick={() =>
              setActiveFilter("cancelled")
            }
          >
            Cancelled
          </button>
        </div>
      </section>

      {filteredBookings.length === 0 ? (
        <section className="no-bookings">
          <div className="no-bookings-icon">
            <Ticket size={34} />
          </div>

          <span className="section-label">
            NO BOOKINGS
          </span>

          <h2>
            {bookings.length === 0
              ? "No bookings yet"
              : "No matching bookings"}
          </h2>

          <p>
            {bookings.length === 0
              ? "Your confirmed train tickets will appear here."
              : "Try a different search term or filter."}
          </p>

          <button
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            <TrainFront size={17} />
            Book a Train
          </button>
        </section>
      ) : (
        <section className="bookings-list">
          {filteredBookings.map(
            (booking, index) => {
              const train =
                booking.train || {};

              const passengers =
                booking.passengers || [];

              const seats =
                booking.seats || [];

              const status =
                booking.status ||
                "Confirmed";

              return (
                <article
                  className="booking-history-card"
                  key={
                    booking.bookingId ||
                    `${booking.pnr}-${index}`
                  }
                >
                  <div className="booking-history-top">
                    <div className="booking-history-train">
                      <div className="train-icon">
                        <TrainFront
                          size={23}
                        />
                      </div>

                      <div>
                        <h2>
                          {train.name ||
                            "Train"}
                        </h2>

                        <span>
                          #
                          {train.number ||
                            "N/A"}{" "}
                          ·{" "}
                          {train.type ||
                            "Express"}
                        </span>
                      </div>
                    </div>

                    <div
                      className={
                        status ===
                        "Cancelled"
                          ? "booking-status cancelled"
                          : "booking-status"
                      }
                    >
                      <CheckCircle2
                        size={16}
                      />

                      {status}
                    </div>
                  </div>

                  <div className="booking-history-route">
                    <div>
                      <span>
                        {train.departure ||
                          "--:--"}
                      </span>

                      <strong>
                        {booking.from}
                      </strong>

                      <small>
                        Departure
                      </small>
                    </div>

                    <div className="booking-history-line">
                      <span>
                        {train.duration ||
                          "--"}
                      </span>

                      <div></div>
                    </div>

                    <div>
                      <span>
                        {train.arrival ||
                          "--:--"}
                      </span>

                      <strong>
                        {booking.to}
                      </strong>

                      <small>
                        Arrival
                      </small>
                    </div>
                  </div>

                  <div className="booking-history-details">
                    <div>
                      <CalendarDays
                        size={17}
                      />

                      <div>
                        <span>
                          Journey Date
                        </span>

                        <strong>
                          {booking.date}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <MapPin size={17} />

                      <div>
                        <span>
                          Class
                        </span>

                        <strong>
                          {booking.seatClass ||
                            "3A"}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <Users size={17} />

                      <div>
                        <span>
                          Passengers
                        </span>

                        <strong>
                          {
                            passengers.length
                          }
                        </strong>
                      </div>
                    </div>

                    <div>
                      <Clock3 size={17} />

                      <div>
                        <span>
                          Seats
                        </span>

                        <strong>
                          {seats.join(
                            ", "
                          ) ||
                            "Not available"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="booking-history-bottom">
                    <div className="booking-identifiers">
                      <div>
                        <span>
                          PNR
                        </span>

                        <strong>
                          {booking.pnr ||
                            "N/A"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Booking ID
                        </span>

                        <strong>
                          {booking.bookingId ||
                            "N/A"}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Amount
                        </span>

                        <strong>
                          ₹
                          {booking.totalAmount ||
                            0}
                        </strong>
                      </div>
                    </div>

                    <div className="booking-actions">
                      <button
                        className="booking-action secondary"
                        onClick={() =>
                          handleDownload()
                        }
                      >
                        <Download
                          size={16}
                        />
                        Download
                      </button>

                      <button
                        className="booking-action primary"
                        onClick={() =>
                          handleViewTicket(
                            booking
                          )
                        }
                      >
                        View Ticket
                        <ArrowRightIcon />
                      </button>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}

      <section className="booking-help">
        <div>
          <User size={21} />

          <div>
            <strong>
              Need to make another booking?
            </strong>

            <span>
              Search trains and plan your next
              journey with RailConnect AI.
            </span>
          </div>
        </div>

        <button
          className="primary-btn"
          onClick={() => navigate("/")}
        >
          Search Trains
        </button>
      </section>
    </main>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default MyBookings;
