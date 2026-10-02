import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Mail,
  Phone,
  User,
} from "lucide-react";

function PassengerDetails() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    train,
    seat,
    from,
    to,
    date,
  } = location.state || {};

  const [passenger, setPassenger] = useState({
    name: "",
    age: "",
    gender: "",
    mobile: "",
    email: "",
  });

  const [error, setError] = useState("");

  if (!train || !seat || !date) {
    return (
      <main className="passenger-page">
        <div className="empty-results">
          <User size={42} />

          <h3>Booking information is missing</h3>

          <p>
            Please select a train and seat before entering
            passenger details.
          </p>

          <button
            className="select-train-btn"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>
        </div>
      </main>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setPassenger((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !passenger.name.trim() ||
      !passenger.age ||
      !passenger.gender ||
      !passenger.mobile.trim() ||
      !passenger.email.trim()
    ) {
      return "Please fill in all passenger details.";
    }

    const age = Number(passenger.age);

    if (
      !Number.isInteger(age) ||
      age < 1 ||
      age > 120
    ) {
      return "Please enter a valid age.";
    }

    if (!/^\d{10}$/.test(passenger.mobile)) {
      return "Mobile number must contain exactly 10 digits.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        passenger.email
      )
    ) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const handleContinue = () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    navigate("/confirm-booking", {
      state: {
        train,
        seat,
        from,
        to,
        date,
        passenger: {
          ...passenger,
          age: Number(passenger.age),
        },
      },
    });
  };

  return (
    <main className="passenger-page">
      <div className="passenger-container">
        {/* HEADER */}
        <div className="passenger-header">
          <button
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div>
            <span className="section-label">
              PASSENGER DETAILS
            </span>

            <h1>Enter Passenger Information</h1>

            <p>
              Provide the details required to complete
              your booking.
            </p>
          </div>
        </div>

        <div className="passenger-layout">
          {/* FORM */}
          <section className="passenger-form-card">
            <div className="form-title">
              <User size={22} />

              <div>
                <h2>Passenger Information</h2>
                <p>All fields are required.</p>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group full">
                <label>Full Name</label>

                <div className="input-with-icon">
                  <User size={18} />

                  <input
                    type="text"
                    name="name"
                    value={passenger.name}
                    onChange={handleChange}
                    placeholder="Enter passenger name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Age</label>

                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  value={passenger.age}
                  onChange={handleChange}
                  placeholder="Age"
                />
              </div>

              <div className="form-group">
                <label>Gender</label>

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

              <div className="form-group">
                <label>Mobile Number</label>

                <div className="input-with-icon">
                  <Phone size={18} />

                  <input
                    type="tel"
                    name="mobile"
                    value={passenger.mobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address</label>

                <div className="input-with-icon">
                  <Mail size={18} />

                  <input
                    type="email"
                    name="email"
                    value={passenger.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                  />
                </div>
              </div>
            </div>

            <button
              className="continue-btn"
              onClick={handleContinue}
            >
              Continue to Confirmation
              <ArrowRight size={18} />
            </button>
          </section>

          {/* JOURNEY SUMMARY */}
          <aside className="passenger-summary">
            <span className="section-label">
              JOURNEY SUMMARY
            </span>

            <h2>{train.name}</h2>

            <p className="train-number">
              Train #{train.number}
            </p>

            <div className="summary-route">
              <strong>{from}</strong>
              <ArrowRight size={18} />
              <strong>{to}</strong>
            </div>

            <div className="summary-row">
              <span>
                <CalendarDays size={16} />
                Journey Date
              </span>

              <strong>{date}</strong>
            </div>

            <div className="summary-row">
              <span>Departure</span>
              <strong>{train.departure}</strong>
            </div>

            <div className="summary-row">
              <span>Arrival</span>
              <strong>{train.arrival}</strong>
            </div>

            <div className="summary-row">
              <span>Class</span>
              <strong>{train.class}</strong>
            </div>

            <div className="summary-row">
              <span>Selected Seat</span>
              <strong>{seat}</strong>
            </div>

            <div className="summary-row total">
              <span>Total Fare</span>
              <strong>₹{train.price}</strong>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default PassengerDetails;
