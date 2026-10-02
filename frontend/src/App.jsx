import { useState } from "react";
import {
  TrainFront,
  Search,
  CalendarDays,
  MapPin,
  Sparkles,
  ArrowRightLeft,
  Clock3,
  ShieldCheck,
  Ticket,
} from "lucide-react";

function App() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    if (!from || !to || !date) {
      alert("Please enter source, destination and journey date.");
      return;
    }

    alert(`Searching trains from ${from} to ${to}`);
  };

  const swapStations = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <TrainFront size={24} />
          </div>

          <div>
            <h2>RailConnect AI</h2>
            <span>Smart Railway Booking</span>
          </div>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#ai">AI Recommendations</a>
          <a href="#bookings">My Bookings</a>
        </div>

        <button className="login-btn">Login</button>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="ai-badge">
              <Sparkles size={16} />
              AI-Powered Railway Experience
            </div>

            <h1>
              Travel Smarter.
              <br />
              <span>Book Better.</span>
            </h1>

            <p>
              Search trains, reserve your seat and get personalized
              AI-powered train recommendations in one place.
            </p>
          </div>

          <div className="booking-card">
            <div className="booking-heading">
              <div>
                <span className="small-label">PLAN YOUR JOURNEY</span>
                <h2>Find Your Train</h2>
              </div>

              <div className="ticket-icon">
                <Ticket size={22} />
              </div>
            </div>

            <form onSubmit={handleSearch}>
              <div className="station-row">
                <div className="input-group">
                  <label>
                    <MapPin size={17} />
                    From
                  </label>

                  <input
                    type="text"
                    placeholder="Departure station"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="swap-btn"
                  onClick={swapStations}
                  title="Swap stations"
                >
                  <ArrowRightLeft size={18} />
                </button>

                <div className="input-group">
                  <label>
                    <MapPin size={17} />
                    To
                  </label>

                  <input
                    type="text"
                    placeholder="Arrival station"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>
                    <CalendarDays size={17} />
                    Journey Date
                  </label>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <button type="submit" className="search-btn">
                  <Search size={19} />
                  Search Trains
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="stats-section">
          <div className="stat-card">
            <TrainFront size={25} />
            <div>
              <strong>500+</strong>
              <span>Trains</span>
            </div>
          </div>

          <div className="stat-card">
            <Clock3 size={25} />
            <div>
              <strong>24/7</strong>
              <span>Booking</span>
            </div>
          </div>

          <div className="stat-card">
            <Sparkles size={25} />
            <div>
              <strong>AI</strong>
              <span>Recommendations</span>
            </div>
          </div>

          <div className="stat-card">
            <ShieldCheck size={25} />
            <div>
              <strong>Secure</strong>
              <span>Payments</span>
            </div>
          </div>
        </section>

        <section className="ai-section" id="ai">
          <div className="section-heading">
            <div className="ai-title">
              <Sparkles size={22} />
              <span>AI SMART TRAVEL</span>
            </div>

            <h2>Personalized Train Recommendations</h2>

            <p>
              Our AI will analyze your travel preferences and booking history
              to suggest trains that match your journey.
            </p>
          </div>

          <div className="recommendation-placeholder">
            <Sparkles size={28} />
            <h3>Your AI recommendations will appear here</h3>
            <p>
              Search for a train to start getting personalized suggestions.
            </p>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <span className="small-label">WHY RAILCONNECT AI?</span>
            <h2>Everything You Need for Your Journey</h2>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Search size={23} />
              </div>
              <h3>Smart Search</h3>
              <p>
                Quickly find available trains based on your source,
                destination and travel date.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Ticket size={23} />
              </div>
              <h3>Easy Booking</h3>
              <p>
                Select your preferred seat, add passenger details and get
                your digital ticket.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Sparkles size={23} />
              </div>
              <h3>AI Recommendations</h3>
              <p>
                Get intelligent train suggestions based on your preferences
                and previous travel patterns.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <ShieldCheck size={23} />
              </div>
              <h3>Secure Booking</h3>
              <p>
                Keep passenger and booking information organized with a
                secure booking workflow.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="brand">
          <div className="brand-icon">
            <TrainFront size={20} />
          </div>

          <div>
            <h3>RailConnect AI</h3>
            <span>Smart Railway Booking System</span>
          </div>
        </div>

        <p>Built with React, C++ and AI/ML.</p>
      </footer>
    </div>
  );
}

export default App;
