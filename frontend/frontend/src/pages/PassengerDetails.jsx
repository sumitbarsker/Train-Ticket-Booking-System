import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";

function PassengerDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    train,
    from,
    to,
    date,
    seats = [],
    seatClass = "3A",
    totalAmount = 0,
  } = location.state || {};

  const [passengers, setPassengers] = useState(
    seats.map((seat, index) => ({
      seat,
      name: "",
      age: "",
      gender: "",
    }))
  );

  const [contact, setContact] = useState({
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});

  const updatePassenger = (
    index,
    field,
    value
  ) => {
    setPassengers((current) =>
      current.map((passenger, passengerIndex) =>
        passengerIndex === index
          ? {
              ...passenger,
              [field]: value,
            }
          : passenger
      )
    );
  };

  const updateContact = (field, value) => {
    setContact((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    passengers.forEach(
      (passenger, index) => {
        if (!passenger.name.trim()) {
          newErrors[`name-${index}`] =
            "Enter passenger name.";
        }

        if (!passenger.age) {
          newErrors[`age-${index}`] =
            "Enter passenger age.";
        } else if (
          Number(passenger.age) < 1 ||
          Number(passenger.age) > 120
        ) {
          newErrors[`age-${index}`] =
            "Enter a valid age.";
        }

        if (!passenger.gender) {
          newErrors[`gender-${index}`] =
            "Select gender.";
        }
      }
    );

    if (!contact.email.trim()) {
      newErrors.email =
        "Enter your email address.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        contact.email
      )
    ) {
      newErrors.email =
        "Enter a valid email address.";
    }

    if (!contact.phone.trim()) {
      newErrors.phone =
        "Enter your mobile number.";
    } else if (
      !/^[6-9]\d{9}$/.test(
        contact.phone
      )
    ) {
      newErrors.phone =
        "Enter a valid 10-digit mobile number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    navigate("/confirm-booking", {
      state: {
        train,
        from,
        to,
        date,
        seats,
        seatClass,
        passengers,
        contact,
        totalAmount:
          totalAmount +
          (seats.length ? 20 : 0),
      },
    });
  };

  if (!train || seats.length === 0) {
    return (
      <main className="booking-page">
        <section className="empty-results">
          <User size={46} />

          <h2>Passenger details unavailable</h2>

          <p>
            Please select seats before entering
            passenger details.
          </p>

          <button
            className="primary-btn"
            onClick={() =>
              navigate("/")
            }
          >
            Start Booking
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
          Back to Seats
        </button>

        <div className="booking-heading">
          <div>
            <span className="section-label">
              STEP 2 OF 3
            </span>

            <h1>Passenger Details</h1>

            <p>
              Enter the details of every passenger
              travelling on this ticket.
            </p>
          </div>

          <div className="booking-train-card">
            <div className="train-icon">
              <User size={22} />
            </div>

            <div>
              <strong>
                {passengers.length} Passenger
                {passengers.length !== 1
                  ? "s"
                  : ""}
              </strong>

              <span>
                {train.name} · {seatClass}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="step-indicator">
        <div className="step completed">
          <span>
            <CheckCircle2 size={15} />
          </span>
          <strong>Seats</strong>
        </div>

        <div className="step-line active"></div>

        <div className="step active">
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
          <span>Seats</span>

          <strong>
            {seats.join(", ")}
          </strong>
        </div>
      </section>

      <section className="passenger-layout">
        <div className="passenger-main">
          <div className="passenger-section-header">
            <div>
              <span className="section-label">
                PASSENGER INFORMATION
              </span>

              <h2>Travellers</h2>

              <p>
                Make sure the details match the
                passenger's valid ID.
              </p>
            </div>
          </div>

          <div className="passenger-list">
            {passengers.map(
              (passenger, index) => (
                <article
                  className="passenger-card"
                  key={passenger.seat}
                >
                  <div className="passenger-card-header">
                    <div className="passenger-number">
                      {index + 1}
                    </div>

                    <div>
                      <h3>
                        Passenger{" "}
                        {index + 1}
                      </h3>

                      <span>
                        Seat {passenger.seat}
                      </span>
                    </div>
                  </div>

                  <div className="passenger-form">
                    <div className="form-field full">
                      <label>
                        Full Name
                      </label>

                      <div className="input-with-icon">
                        <User size={17} />

                        <input
                          type="text"
                          placeholder="Enter full name"
                          value={
                            passenger.name
                          }
                          onChange={(event) =>
                            updatePassenger(
                              index,
                              "name",
                              event.target.value
                            )
                          }
                        />
                      </div>

                      {errors[
                        `name-${index}`
                      ] && (
                        <small className="field-error">
                          {
                            errors[
                              `name-${index}`
                            ]
                          }
                        </small>
                      )}
                    </div>

                    <div className="form-field">
                      <label>
                        Age
                      </label>

                      <input
                        type="number"
                        min="1"
                        max="120"
                        placeholder="Age"
                        value={
                          passenger.age
                        }
                        onChange={(event) =>
                          updatePassenger(
                            index,
                            "age",
                            event.target.value
                          )
                        }
                      />

                      {errors[
                        `age-${index}`
                      ] && (
                        <small className="field-error">
                          {
                            errors[
                              `age-${index}`
                            ]
                          }
                        </small>
                      )}
                    </div>

                    <div className="form-field">
                      <label>
                        Gender
                      </label>

                      <select
                        value={
                          passenger.gender
                        }
                        onChange={(event) =>
                          updatePassenger(
                            index,
                            "gender",
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select gender
                        </option>

                        <option value="Male">
                          Male
                        </option>

                        <option value="Female">
                          Female
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>

                      {errors[
                        `gender-${index}`
                      ] && (
                        <small className="field-error">
                          {
                            errors[
                              `gender-${index}`
                            ]
                          }
                        </small>
                      )}
                    </div>
                  </div>
                </article>
              )
            )}
          </div>

          <div className="contact-section">
            <div className="passenger-section-header">
              <div>
                <span className="section-label">
                  CONTACT INFORMATION
                </span>

                <h2>Booking Contact</h2>

                <p>
                  We'll use these details for
                  booking confirmation.
                </p>
              </div>
            </div>

            <div className="contact-form">
              <div className="form-field">
                <label>
                  Email Address
                </label>

                <div className="input-with-icon">
                  <Mail size={17} />

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={contact.email}
                    onChange={(event) =>
                      updateContact(
                        "email",
                        event.target.value
                      )
                    }
                  />
                </div>

                {errors.email && (
                  <small className="field-error">
                    {errors.email}
                  </small>
                )}
              </div>

              <div className="form-field">
                <label>
                  Mobile Number
                </label>

                <div className="input-with-icon">
                  <Phone size={17} />

                  <input
                    type="tel"
                    maxLength="10"
                    placeholder="10-digit mobile number"
                    value={contact.phone}
                    onChange={(event) =>
                      updateContact(
                        "phone",
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />
                </div>

                {errors.phone && (
                  <small className="field-error">
                    {errors.phone}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="booking-summary-card">
          <div className="summary-card-header">
            <span className="section-label">
              BOOKING SUMMARY
            </span>

            <h2>Ticket Details</h2>
          </div>

          <div className="summary-route">
            <div>
              <span>FROM</span>
              <strong>{from}</strong>
            </div>

            <ArrowRight size={18} />

            <div>
              <span>TO</span>
              <strong>{to}</strong>
            </div>
          </div>

          <div className="summary-details">
            <div>
              <span>Train</span>
              <strong>
                {train.name}
              </strong>
            </div>

            <div>
              <span>Train Number</span>
              <strong>
                #{train.number}
              </strong>
            </div>

            <div>
              <span>Date</span>
              <strong>{date}</strong>
            </div>

            <div>
              <span>Class</span>
              <strong>
                {seatClass}
              </strong>
            </div>

            <div>
              <span>Passengers</span>
              <strong>
                {passengers.length}
              </strong>
            </div>

            <div>
              <span>Seats</span>
              <strong>
                {seats.join(", ")}
              </strong>
            </div>
          </div>

          <div className="summary-divider"></div>

          <div className="fare-row">
            <span>Ticket Fare</span>

            <strong>
              ₹
              {totalAmount - 20}
            </strong>
          </div>

          <div className="fare-row">
            <span>Convenience Fee</span>

            <strong>
              ₹20
            </strong>
          </div>

          <div className="fare-row total">
            <span>Total Amount</span>

            <strong>
              ₹{totalAmount}
            </strong>
          </div>

          <button
            className="continue-btn"
            onClick={handleContinue}
          >
            Continue to Confirmation

            <ArrowRight size={18} />
          </button>

          <div className="secure-note">
            <ShieldCheck size={17} />

            <span>
              Your passenger information is
              securely handled.
            </span>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default PassengerDetails;
