import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Search,
  CalendarDays,
  MapPin,
  TrainFront,
  Sparkles,
  Clock3,
  IndianRupee,
  Armchair,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Zap,
  Lightbulb,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function Home() {
  const navigate = useNavigate();

  const [from, setFrom] = useState("Bhopal");
  const [to, setTo] = useState("New Delhi");
  const [date, setDate] = useState("");

  const [preference, setPreference] = useState("balanced");
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");

  const searchTrains = () => {
    if (!from.trim() || !to.trim()) {
      return;
    }

    navigate(
      `/search?source=${encodeURIComponent(
        from
      )}&destination=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`
    );
  };

  const getRecommendations = async () => {
    if (!from.trim() || !to.trim()) {
      setRecommendationError("Please enter source and destination.");
      return;
    }

    try {
      setLoadingRecommendations(true);
      setRecommendationError("");

      const response = await axios.get(
        `${API_URL}/recommendations/trains`,
        {
          params: {
            source: from,
            destination: to,
            preference,
          },
        }
      );

      setRecommendations(response.data.trains || []);
    } catch (error) {
      console.error(error);

      setRecommendations([]);

      setRecommendationError(
        error.response?.data?.detail ||
          "Unable to load AI recommendations. Please start the backend."
      );
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSelectRecommendation = (train) => {
    navigate("/seat-selection", {
      state: {
        train,
        from,
        to,
        date,
      },
    });
  };

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            AI-Powered Railway Booking
          </div>

          <h1>
            Travel Smarter.
            <span> Book Better.</span>
          </h1>

          <p>
            Find trains, compare routes and get AI-powered recommendations
            based on your travel preferences.
          </p>

          {/* SEARCH CARD */}
          <div className="booking-card">
            <div className="booking-field">
              <MapPin size={20} />
              <div>
                <label>FROM</label>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Departure city"
                />
              </div>
            </div>

            <div className="booking-field">
              <MapPin size={20} />
              <div>
                <label>TO</label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Destination city"
                />
              </div>
            </div>

            <div className="booking-field">
              <CalendarDays size={20} />
              <div>
                <label>JOURNEY DATE</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <button className="search-btn" onClick={searchTrains}>
              <Search size={20} />
              Search Trains
            </button>
          </div>

          <div className="hero-trust">
            <span>
              <ShieldCheck size={16} />
              Secure Booking
            </span>

            <span>
              <Zap size={16} />
              Fast Search
            </span>

            <span>
              <BrainCircuit size={16} />
              AI Recommendations
            </span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section">
        <div className="stat-card">
          <TrainFront size={26} />
          <div>
            <strong>100+</strong>
            <span>Train Routes</span>
          </div>
        </div>

        <div className="stat-card">
          <BrainCircuit size={26} />
          <div>
            <strong>AI</strong>
            <span>Smart Recommendations</span>
          </div>
        </div>

        <div className="stat-card">
          <ShieldCheck size={26} />
          <div>
            <strong>100%</strong>
            <span>Secure Booking</span>
          </div>
        </div>

        <div className="stat-card">
          <Zap size={26} />
          <div>
            <strong>24/7</strong>
            <span>Booking Access</span>
          </div>
        </div>
      </section>

      {/* AI RECOMMENDATIONS */}
      <section className="ai-section" id="ai">
        <div className="section-heading">
          <div className="section-icon">
            <Sparkles size={24} />
          </div>

          <div>
            <span className="section-label">INTELLIGENT TRAVEL</span>
            <h2>AI Train Recommendations</h2>
            <p>
              Our AI analyzes price, duration, availability, speed and comfort
              to suggest suitable trains for your journey.
            </p>
          </div>
        </div>

        <div className="preference-row">
          <span>What matters most?</span>

          <button
            className={preference === "balanced" ? "active" : ""}
            onClick={() => setPreference("balanced")}
          >
            Balanced
          </button>

          <button
            className={preference === "cheapest" ? "active" : ""}
            onClick={() => setPreference("cheapest")}
          >
            Cheapest
          </button>

          <button
            className={preference === "fastest" ? "active" : ""}
            onClick={() => setPreference("fastest")}
          >
            Fastest
          </button>

          <button
            className="ai-find-btn"
            onClick={getRecommendations}
            disabled={loadingRecommendations}
          >
            <Sparkles size={16} />

            {loadingRecommendations
              ? "Finding..."
              : "Find AI Recommendations"}
          </button>
        </div>

        {recommendationError && (
          <div className="error-message">
            {recommendationError}
          </div>
        )}

        {!loadingRecommendations &&
          !recommendationError &&
          recommendations.length === 0 && (
            <div className="ai-empty">
              <BrainCircuit size={42} />

              <h3>Ready to find your ideal train?</h3>

              <p>
                Enter your journey details above and let AI compare the
                available trains for you.
              </p>
            </div>
          )}

        <div className="recommendation-grid">
          {recommendations.map((train) => (
            <div className="recommendation-card" key={train.id}>
              <div className="recommendation-top">
                <div>
                  <span className="train-number">
                    #{train.number}
                  </span>

                  <h3>{train.name}</h3>

                  <p>
                    {train.source} → {train.destination}
                  </p>
                </div>

                <div className="ai-score">
                  <Sparkles size={14} />
                  <strong>{train.ai_score}</strong>
                  <span>AI Score</span>
                </div>
              </div>

              <div className="recommendation-route">
                <div>
                  <strong>{train.departure}</strong>
                  <span>{train.source}</span>
                </div>

                <div className="route-line">
                  <ArrowRight size={20} />
                  <span>{train.duration}</span>
                </div>

                <div>
                  <strong>{train.arrival}</strong>
                  <span>{train.destination}</span>
                </div>
              </div>

              {/* AI EXPLANATION */}
              {train.ai_reason && (
                <div className="ai-reason">
                  <Lightbulb size={17} />
                  <span>{train.ai_reason}</span>
                </div>
              )}

              <div className="recommendation-info">
                <span>
                  <Clock3 size={16} />
                  {train.type}
                </span>

                <span>
                  <Armchair size={16} />
                  {train.seats} seats
                </span>

                <span>
                  <IndianRupee size={16} />
                  ₹{train.price}
                </span>
              </div>

              <div className="recommendation-bottom">
                <div>
                  <small>Class</small>
                  <strong>{train.class}</strong>
                </div>

                <button
                  onClick={() => handleSelectRecommendation(train)}
                >
                  Select Train
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-heading centered">
          <span className="section-label">WHY RAILCONNECT AI</span>
          <h2>Everything You Need for Smarter Travel</h2>
          <p>
            A modern railway booking experience powered by automation,
            data and machine learning.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <BrainCircuit size={24} />
            </div>

            <h3>AI Recommendations</h3>

            <p>
              Get train suggestions based on price, travel time,
              availability and comfort.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Armchair size={24} />
            </div>

            <h3>Live Seat Selection</h3>

            <p>
              Check available seats and select your preferred seat
              before booking.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <ShieldCheck size={24} />
            </div>

            <h3>Secure Booking</h3>

            <p>
              Passenger details and booking information are processed
              through the backend system.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={24} />
            </div>

            <h3>Fast Experience</h3>

            <p>
              Search trains, select seats and complete bookings through
              a simple modern interface.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div>
          <h3>RailConnect AI</h3>
          <p>AI-Powered Train Ticket Booking & Recommendation System</p>
        </div>

        <span>Built with React • FastAPI • PostgreSQL • Machine Learning</span>
      </footer>
    </main>
  );
}

export default Home;
