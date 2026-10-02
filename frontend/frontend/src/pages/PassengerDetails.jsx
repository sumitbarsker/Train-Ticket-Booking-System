import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
  Phone,
  ShieldCheck,
  TrainFront,
  User,
  Users,
} from "lucide-react";

function PassengerDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    train,
    from,
    to,
    date,
    selectedSeats = [],
    totalFare = 0,
  } = location.state || {};

  const [passengers, setPassengers] =
    useState(() =>
      selectedSeats.map((seat, index) => ({
        seat,
        name: "",
        age: "",
        gender: "",
      }))
    );

  const [contact, setContact] = useState({
    mobile: "",
    email: "",
  });

  const [errors, setErrors] = useState({});

  const serviceCharge =
    selectedSeats.length > 0 ? 20 : 0;

  const finalAmount =
    totalFare + serviceCharge;

  const isValidMobile = (mobile) => {
    return /^[6-9]\d{9}$/.test(mobile);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email
    );
  };

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

    setErrors((current) => ({
      ...current,
      [`passenger-${index}-${field}`]:
        "",
    }));
  };

  const updateContact = (
    field,
    value
  ) => {
    setContact((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    passengers.forEach(
      (passenger, index) => {
        if (
          !passenger.name.trim()
        ) {
          newErrors[
            `passenger-${index}-name`
          ] = "Enter passenger name.";
        }

        if (!passenger.age) {
          newErrors[
            `passenger-${index}-age`
          ] = "Enter passenger age.";
        } else if (
          Number(passenger.age) < 1 ||
          Number(passenger.age) > 120
        ) {
          newErrors[
            `passenger-${index}-age`
          ] = "Enter a valid age.";
        }

        if (!passenger.gender) {
          newErrors[
            `passenger-${index}-gender`
          ] = "Select gender.";
        }
      }
    );

    if (!contact.mobile) {
      newErrors.mobile =
        "Enter mobile number.";
    } else if (
      !isValidMobile(contact.mobile)
    ) {
      newErrors.mobile =
        "Enter a valid 10-digit mobile number.";
    }

    if (!contact.email) {
      newErrors.email =
        "Enter email address.";
    } else if (
      !isValidEmail(contact.email)
    ) {
      newErrors.email =
        "Enter a valid email address.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    navigate(
      "/confirm-booking",
      {
        state: {
          train,
          from,
          to,
          date,
          selectedSeats,
          passengers,
          contact,
          totalFare,
          serviceCharge,
          finalAmount,
        },
      }
    );
  };

  const passengerCountText =
    selectedSeats.length === 1
      ? "1 passenger"
      : `${selectedSeats.length} passengers`;

  if (!train) {
    return (
      <main className="passenger-page">
        <section className="empty-results">
          <TrainFront size={48} />

          <h2>
            Booking information not found
          </h2>

          <p>
            Please select a train and seats
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
    <main className="passenger-page">
      <section className="passenger-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back to Seats
        </button>

        <div className="passenger-header-content">
          <div>
            <span className="section-label">
              STEP 2 OF 4
            </span>

            <h1>Passenger Details</h1>

            <p>
              Enter the details of all passengers
              travelling with you.
            </p>
          </div>

          <div className="seat-step-indicator">
            <div className="step completed">
              <span>
                <Check size={14} />
              </span>
              <small>Seats</small>
            </div>

            <div className="step-line active"></div>

            <div className="step active">
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

      <section className="passenger-layout">
        <div className="passenger-main">
          <div className="form-card">
            <div className="form-card-header">
              <div className="form-card-icon">
                <Users size={21} />
              </div>

              <div>
                <span className="section-label">
                  PASSENGERS
                </span>

                <h2>
                  Passenger information
                </h2>

                <p>
                  {passengerCountText} selected
                </p>
              </div>
            </div>

            <div className="passenger-list">
              {passengers.map(
                (passenger, index) => (
                  <div
                    className="passenger-form"
                    key={passenger.seat}
                  >
                    <div className="passenger-form-header">
                      <div>
                        <span className="passenger-number">
                          Passenger {index + 1}
                        </span>

                        <h3>
                          Seat {passenger.seat}
                        </h3>
                      </div>

                      <div className="seat-tag">
                        Seat {passenger.seat}
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-field full-width">
                        <label>
                          Full Name
                        </label>

                        <div className="input-wrapper">
                          <User size={17} />

                          <input
                            type="text"
                            placeholder="Enter passenger name"
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
                          `passenger-${index}-name`
                        ] && (
                          <small className="field-error">
                            {
                              errors[
                                `passenger-${index}-name`
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
                          `passenger-${index}-age`
                        ] && (
                          <small className="field-error">
                            {
                              errors[
                                `passenger-${index}-age`
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
                          `passenger-${index}-gender`
                        ] && (
                          <small className="field-error">
                            {
                              errors[
                                `passenger-${index}-gender`
                              ]
                            }
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="form-card">
            <div className="form-card-header">
              <div className="form-card-icon">
                <Phone size={21} />
              </div>

              <div>
                <span className="section-label">
                  CONTACT DETAILS
                </span>

                <h2>
                  Booking contact
                </h2>

                <p>
                  Your ticket information will
                  be sent here.
                </p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>
                  Mobile Number
                </label>

                <div className="input-wrapper">
                  <Phone size={17} />

                  <input
                    type="tel"
                    maxLength="10"
                    placeholder="10-digit mobile number"
                    value={contact.mobile}
                    onChange={(event) =>
                      updateContact(
                        "mobile",
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />
                </div>

                {errors.mobile && (
                  <small className="field-error">
                    {errors.mobile}
                  </small>
                )}
              </div>

              <div className="form-field">
                <label>
                  Email Address
                </label>

                <div className="input-wrapper">
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
            </div>
          </div>

          <div className="privacy-note">
            <ShieldCheck size={19} />

            <div>
              <strong>
                Your information is secure
              </strong>

              <p>
                Passenger and contact details
                are used only for processing
                your booking.
              </p>
            </div>
          </div>
        </div>

        <aside className="passenger-summary">
          <div className="summary-header">
            <div>
              <span className="section-label">
                JOURNEY SUMMARY
              </span>

              <h2>
                Booking Details
              </h2>
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
                #{train.number}
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

            <div>
              <span>Seats</span>

              <strong>
                {selectedSeats
                  .slice()
                  .sort(
                    (a, b) => a - b
                  )
                  .join(", ")}
              </strong>
            </div>
          </div>

          <div className="fare-breakdown">
            <div>
              <span>
                Ticket Fare
              </span>

              <strong>
                ₹{totalFare}
              </strong>
            </div>

            <div>
              <span>
                Service Charge
              </span>

              <strong>
                ₹{serviceCharge}
              </strong>
            </div>

            <div className="fare-total">
              <span>
                Total Amount
              </span>

              <strong>
                ₹{finalAmount}
              </strong>
            </div>
          </div>

          <button
            className="continue-btn"
            onClick={handleContinue}
          >
            Review Booking
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

export default PassengerDetails;
