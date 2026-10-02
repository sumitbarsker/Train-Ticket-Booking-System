import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  CalendarDays,
  Users,
  TrainFront,
  CreditCard,
} from "lucide-react";

function PassengerDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const train = location.state?.train;
  const seat = location.state?.seat;

  const [passenger, setPassenger] = useState({
    name: "",
    age: "",
    gender: "",
    mobile: "",
    email: "",
  });

  if (!train || !seat) {
    return (
      <main className="passenger-page">
        <div className="empty-state">
          <User size={42} />

          <h2>Booking details not found</h2>

          <p>
            Please select a train and seat before entering
            passenger details.
          </p>

          <button
            className="select-train-btn"
            onClick={() => navigate("/search")}
          >
            Back to Trains
          </button>
        </div>
      </main>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;

    setPassenger((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !passenger.name ||
      !passenger.age ||
      !passenger.gender ||
      !passenger.mobile ||
      !passenger.email
    ) {
      alert("Please fill in all passenger details.");
      return;
    }

    if (passenger.mobile.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    navigate("/confirm-booking", {
      state: {
        train,
        seat,
        passenger,
      },
    });
  };

  return (
    <main className="passenger-page">
      <div className="passenger-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div>
          <span className="small-label">
            STEP 2 OF 3
          </span>

          <h1>Passenger Details</h1>

          <p>
            Enter the passenger information for your ticket.
          </p>
        </div>
      </div>

      <div className="passenger-layout">
        <section className="passenger-form-card">
          <div className="form-card-heading">
            <div className="form-heading-icon">
              <User size={22} />
            </div>

            <div>
              <h2>Passenger Information</h2>

              <p>
                Please enter accurate details for the passenger.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field full-width">
                <label>
                  <User size={15} />
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter passenger name"
                  value={passenger.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label>
                  <CalendarDays size={15} />
                  Age
                </label>

                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  placeholder="Enter age"
                  value={passenger.age}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label>
                  <Users size={15} />
                  Gender
                </label>

                <select
                  name="gender"
                  value={passenger.gender}
                  onChange={handleChange}
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
              </div>

              <div className="form-field">
                <label>
                  <Phone size={15} />
                  Mobile Number
                </label>

                <input
                  type="tel"
                  name="mobile"
                  maxLength="10"
                  placeholder="10-digit mobile number"
                  value={passenger.mobile}
                  onChange={(event) =>
                    setPassenger((previous) => ({
                      ...previous,
                      mobile: event.target.value.replace(
                        /\D/g,
                        ""
                      ),
                    }))
                  }
                />
              </div>

              <div className="form-field">
                <label>
                  <Mail size={15} />
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={passenger.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-note">
              <CreditCard size={17} />

              <span>
                Your passenger information will be used only
                for this booking.
              </span>
            </div>

            <button
              type="submit"
              className="continue-btn passenger-submit"
            >
              Continue to Booking
            </button>
          </form>
        </section>

        <aside className="booking-summary passenger-summary">
          <div className="summary-icon">
            <TrainFront size={23} />
          </div>

          <span className="small-label">
            JOURNEY SUMMARY
          </span>

          <h2>{train.name}</h2>

          <div className="summary-route">
            <strong>
              {train.source}
            </strong>

            <span>↓</span>

            <strong>
              {train.destination}
            </strong>
          </div>

          <div className="summary-row">
            <span>Train No.</span>

            <strong>
              {train.number}
            </strong>
          </div>

          <div className="summary-row">
            <span>Journey</span>

            <strong>
              {train.departure} - {train.arrival}
            </strong>
          </div>

          <div className="summary-row">
            <span>Class</span>

            <strong>
              {train.class}
            </strong>
          </div>

          <div className="summary-row">
            <span>Seat</span>

            <strong>
              {seat}
            </strong>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-total">
            <span>Total Fare</span>

            <strong>
              ₹{train.price}
            </strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default PassengerDetails;
