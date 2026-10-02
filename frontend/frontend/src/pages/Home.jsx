import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  Armchair,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Lightbulb,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  TrainFront,
  Zap,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function Home() {
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];

  const [from, setFrom] = useState("Bhopal");
  const [to, setTo] = useState("New Delhi");
  const [date, setDate] = useState(today);

  const [preference, setPreference] = useState("balanced");

  const [recommendations, setRecommendations] = useState([]);
  const [recommendationLoading, setRecommendationLoading] =
    useState(false);
  const [recommendationError, setRecommendationError] =
    useState("");

  const [searchError, setSearchError] = useState("");

  // --------------------------------------------------
  // SEARCH TRAINS
  // --------------------------------------------------

  const handleSearch = (event) => {
    event.preventDefault();

    const source = from.trim();
    const destination = to.trim();

    if (!source || !destination) {
      setSearchError(
        "Please enter both source and destination."
      );
      return;
    }

    if (!date) {
      setSearchError(
        "Please select a journey date."
      );
      return;
    }

    if (source.toLowerCase() === destination.toLowerCase()) {
      setSearchError(
        "Source and destination cannot be the same."
      );
      return;
    }

    setSearchError("");

    navigate(
      `/search?source=${encodeURIComponent(
        source
      )}&destination=${encodeURIComponent(
        destination
      )}&date=${encodeURIComponent(date)}`
    );
  };

  // --------------------------------------------------
  // AI RECOMMENDATIONS
  // --------------------------------------------------

  const getRecommendations = async () => {
    const source = from.trim();
    const destination = to.trim();

    if (!source || !destination) {
      setRecommendationError(
        "Please enter source and destination first."
      );
      return;
    }

    if (!date) {
      setRecommendationError(
        "Please select a journey date first."
      );
      return;
    }

    if (source.toLowerCase() === destination.toLowerCase()) {
      setRecommendationError(
        "Source and destination cannot be the same."
      );
      return;
    }

    try {
      setRecommendationLoading(true);
      setRecommendationError("");
      setRecommendations([]);

      const response = await axios.get(
        `${API_URL}/recommendations/trains`,
        {
          params: {
            source,
            destination,
            preference,
          },
        }
      );

      setRecommendations(
        response.data.trains || []
      );
    } catch (error) {
      setRecommendationError(
        error.response?.data?.detail ||
          "Unable to load AI recommendations."
      );
    } finally {
      setRecommendationLoading(false);
    }
  };

  // --------------------------------------------------
  // SELECT AI RECOMMENDATION
  // --------------------------------------------------

  const handleSelectRecommendation = (train) => {
    navigate("/seat-selection", {
      state: {
        train,
        from: from.trim(),
        to: to.trim(),
        date,
      },
    });
  };

  // --------------------------------------------------
  // SWAP SOURCE / DESTINATION
  // --------------------------------------------------

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setRecommendations([]);
    setRecommendationError("");
    setSearchError("");
  };

  return (
    <main>
      {/* ==================================================
          HERO SECTION
      ================================================== */}

      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-glow hero-glow-one"></div>
          <div className="hero-glow hero-glow-two"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={16} />
            AI-Powered Railway Booking
          </div>

          <h1>
            Travel Smarter.
            <span>Book Better.</span>
          </h1>

          <p className="hero-description">
            Search trains, choose your seat and get
            intelligent train recommendations — all in
            one simple platform.
          </p>

          {/* ==================================================
              SEARCH CARD
          ================================================== */}

          <form
            className="search-card"
            onSubmit={handleSearch}
          >
            <div className="search-fields">
              <div className="search-field">
                <label>
                  <MapPin size={15} />
                  FROM
                </label>

                <input
                  type="text"
                  value={from}
                  placeholder="Departure city"
                  onChange={(event) => {
                    setFrom(event.target.value);
                    setSearchError("");
                  }}
                />
              </div>

              <button
                type="button"
                className="swap-btn"
                onClick={handleSwap}
                title="Swap stations"
              >
                ⇄
              </button>

              <div className="search-field">
                <label>
                  <MapPin size={15} />
                  TO
                </label>

                <input
                  type="text"
                  value={to}
                  placeholder="Destination city"
                  onChange={(event) => {
                    setTo(event.target.value);
                    setSearchError("");
                  }}
                />
              </div>

              <div className="search-field">
                <label>
                  <CalendarDays size={15} />
                  JOURNEY DATE
                </label>

                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(event) => {
                    setDate(event.target.value);
                    setSearchError("");
                    setRecommendationError("");
                  }}
                />
              </div>

              <button
                type="submit"
                className="search-btn"
              >
                <Search size={19} />
                Search Trains
              </button>
            </div>

            {searchError && (
              <div className="form-error">
                {searchError}
              </div>
            )}
          </form>

          <div className="hero-trust">
            <span>
              <CheckCircle2 size={15} />
              Easy Booking
            </span>

            <span>
              <CheckCircle2 size={15} />
              Smart Recommendations
            </span>

            <span>
              <CheckCircle2 size={15} />
              Real-Time Seat Status
            </span>
          </div>
        </div>
      </section>

      {/* ==================================================
          STATS
      ================================================== */}

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <TrainFront size={22} />
            </div>

            <div>
              <strong>5+</strong>
              <span>Train Routes</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <BrainCircuit size={22} />
            </div>

            <div>
              <strong>AI</strong>
              <span>Smart Recommendations</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Armchair size={22} />
            </div>

            <div>
              <strong>Live</strong>
              <span>Seat Availability</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <ShieldCheck size={22} />
            </div>

            <div>
              <strong>Secure</strong>
              <span>Booking System</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          AI RECOMMENDATION SECTION
      ================================================== */}

      <section
        className="ai-section"
        id="ai"
      >
        <div className="section-heading">
          <div className="section-icon">
            <Sparkles size={22} />
          </div>

          <div>
            <span className="section-label">
              INTELLIGENT TRAVEL
            </span>

            <h2>Let AI Find Your Best Train</h2>

            <p>
              Our recommendation engine considers
              journey time, price, available seats and
              train comfort to suggest suitable options.
            </p>
          </div>
        </div>

        {/* AI PREFERENCE */}

        <div className="ai-controls">
          <div className="preference-label">
            <span>What matters most to you?</span>
          </div>

          <div className="preference-options">
            <button
              type="button"
              className={
                preference === "balanced"
                  ? "preference-btn active"
                  : "preference-btn"
              }
              onClick={() =>
                setPreference("balanced")
              }
            >
              <BrainCircuit size={17} />
              Balanced
            </button>

            <button
              type="button"
              className={
                preference === "cheapest"
                  ? "preference-btn active"
                  : "preference-btn"
              }
              onClick={() =>
                setPreference("cheapest")
              }
            >
              <IndianRupee size={17} />
              Cheapest
            </button>

            <button
              type="button"
              className={
                preference === "fastest"
                  ? "preference-btn active"
                  : "preference-btn"
              }
              onClick={() =>
                setPreference("fastest")
              }
            >
              <Zap size={17} />
              Fastest
            </button>

            <button
              type="button"
              className={
                preference === "comfort"
                  ? "preference-btn active"
                  : "preference-btn"
              }
              onClick={() =>
                setPreference("comfort")
              }
            >
              <Armchair size={17} />
              Comfort
            </button>
          </div>

          <button
            type="button"
            className="recommend-btn"
            onClick={getRecommendations}
            disabled={recommendationLoading}
          >
            <Sparkles size={18} />

            {recommendationLoading
              ? "Finding Trains..."
              : "Get AI Recommendations"}

            {!recommendationLoading && (
              <ArrowRight size={17} />
            )}
          </button>
        </div>

        {/* AI ERROR */}

        {recommendationError && (
          <div className="form-error ai-error">
            {recommendationError}
          </div>
        )}

        {/* AI LOADING */}

        {recommendationLoading && (
          <div className="loading-card">
            <div className="loading-spinner"></div>

            <h3>
              AI is analyzing available trains...
            </h3>

            <p>
              Comparing price, speed, comfort and
              availability.
            </p>
          </div>
        )}

        {/* AI RESULTS */}

        {!recommendationLoading &&
          recommendations.length > 0 && (
            <div className="recommendation-results">
              <div className="results-heading">
                <div>
                  <span className="section-label">
                    AI RESULTS
                  </span>

                  <h3>
                    Recommended Trains for You
                  </h3>
                </div>

                <span className="result-count">
                  {recommendations.length} options
                </span>
              </div>

              <div className="recommendation-grid">
                {recommendations.map((train, index) => (
                  <article
                    className="recommendation-card"
                    key={train.id}
                  >
                    <div className="recommendation-top">
                      <div className="train-icon">
                        <TrainFront size={22} />
                      </div>

                      <div className="train-title">
                        <h3>{train.name}</h3>

                        <span>
                          #{train.number}
                        </span>
                      </div>

                      <div className="ai-score">
                        <Sparkles size={13} />
                        {Number(
                          train.ai_score || 0
                        ).toFixed(1)}
                      </div>
                    </div>

                    <div className="recommendation-route">
                      <div>
                        <strong>
                          {train.departure}
                        </strong>

                        <span>
                          {train.source}
                        </span>
                      </div>

                      <div className="route-line">
                        <span></span>
                        <ArrowRight size={16} />
                        <span></span>
                      </div>

                      <div>
                        <strong>
                          {train.arrival}
                        </strong>

                        <span>
                          {train.destination}
                        </span>
                      </div>
                    </div>

                    <div className="train-meta">
                      <span>
                        <Clock3 size={14} />
                        {train.duration}
                      </span>

                      <span>
                        <Armchair size={14} />
                        {train.class}
                      </span>

                      <span>
                        <IndianRupee size={14} />
                        {train.price}
                      </span>
                    </div>

                    {train.ai_reason && (
                      <div className="ai-reason">
                        <Lightbulb size={17} />

                        <span>
                          {train.ai_reason}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      className="select-train-btn"
                      onClick={() =>
                        handleSelectRecommendation(
                          train
                        )
                      }
                    >
                      Select Train
                      <ArrowRight size={16} />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          )}
      </section>

      {/* ==================================================
          FEATURES
      ================================================== */}

      <section
        className="features-section"
        id="features"
      >
        <div className="section-heading centered">
          <span className="section-label">
            WHY RAILCONNECT AI
          </span>

          <h2>Everything You Need for a Better Journey</h2>

          <p>
            A modern railway booking experience built
            around convenience and intelligent technology.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <BrainCircuit size={24} />
            </div>

            <h3>AI Recommendations</h3>

            <p>
              Get train suggestions based on your
              preferences, journey duration, price and
              comfort.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Armchair size={24} />
            </div>

            <h3>Smart Seat Selection</h3>

            <p>
              View available and booked seats for your
              selected journey date.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <ShieldCheck size={24} />
            </div>

            <h3>Secure Booking</h3>

            <p>
              Passenger details and booking information
              are handled through the backend API.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Zap size={24} />
            </div>

            <h3>Fast Search</h3>

            <p>
              Quickly find trains between supported
              source and destination stations.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          HOW IT WORKS
      ================================================== */}

      <section className="how-section">
        <div className="section-heading centered">
          <span className="section-label">
            SIMPLE PROCESS
          </span>

          <h2>Book Your Journey in 4 Steps</h2>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>

            <Search size={22} />

            <h3>Search</h3>

            <p>
              Enter your source, destination and journey
              date.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>

            <BrainCircuit size={22} />

            <h3>Choose</h3>

            <p>
              Compare trains or let AI recommend suitable
              options.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>

            <Armchair size={22} />

            <h3>Select Seat</h3>

            <p>
              Select an available seat for your journey.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>

            <CheckCircle2 size={22} />

            <h3>Book</h3>

            <p>
              Enter passenger details and confirm your
              ticket.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="footer">
        <div className="footer-brand">
          <div className="brand-icon">
            <TrainFront size={22} />
          </div>

          <div>
            <h3>RailConnect AI</h3>

            <p>
              AI-Powered Train Ticket Booking &
              Recommendation System
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © 2026 RailConnect AI
          </span>

          <span>
            Built with React, FastAPI, PostgreSQL &
            Machine Learning
          </span>
        </div>
      </footer>
    </main>
  );
}

export default Home;
