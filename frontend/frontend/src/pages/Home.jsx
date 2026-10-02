import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Search,
  Sparkles,
  TrainFront,
  Clock3,
  IndianRupee,
  Users,
  Zap,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function Home() {
  const navigate = useNavigate();

  const [from, setFrom] = useState("Bhopal");
  const [to, setTo] = useState("New Delhi");
  const [date, setDate] = useState("");

  const [preference, setPreference] = useState("balanced");
  const [recommendations, setRecommendations] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();

    if (!from || !to || !date) {
      alert("Please select source, destination and journey date.");
      return;
    }

    navigate(
      `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(
        to
      )}&date=${date}`
    );
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const getRecommendations = async () => {
    if (!from || !to) {
      setAiError("Please select source and destination first.");
      return;
    }

    setAiLoading(true);
    setAiError("");

    try {
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

      setRecommendations(
        response.data.recommendations || []
      );
    } catch (error) {
      console.error(
        "AI recommendation failed:",
        error
      );

      setAiError(
        error.response?.data?.detail ||
          "Unable to load AI recommendations."
      );
    } finally {
      setAiLoading(false);
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
      <section className="hero-section">
        <div className="hero-content">

          <div className="ai-badge">
            <Sparkles size={16} />
            AI-Powered Railway Booking
          </div>

          <h1>
            Your smarter way to
            <span> travel by train.</span>
          </h1>

          <p>
            Search trains, compare options, select your seat
            and book your journey with intelligent
            recommendations.
          </p>

          <form
            className="search-card"
            onSubmit={handleSearch}
          >
            <div className="search-field">
              <MapPin size={19} />

              <div>
                <label>From</label>

                <input
                  value={from}
                  onChange={(e) =>
                    setFrom(e.target.value)
                  }
                  placeholder="Departure station"
                />
              </div>
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
              <MapPin size={19} />

              <div>
                <label>To</label>

                <input
                  value={to}
                  onChange={(e) =>
                    setTo(e.target.value)
                  }
                  placeholder="Arrival station"
                />
              </div>
            </div>

            <div className="search-field">
              <CalendarDays size={19} />

              <div>
                <label>Journey Date</label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="search-btn"
            >
              <Search size={19} />
              Search Trains
            </button>
          </form>

        </div>
      </section>


      {/* STATS */}
      <section className="stats-section">

        <div className="stat-card">
          <TrainFront size={25} />
          <div>
            <strong>1000+</strong>
            <span>Train Routes</span>
          </div>
        </div>

        <div className="stat-card">
          <Users size={25} />
          <div>
            <strong>50K+</strong>
            <span>Happy Passengers</span>
          </div>
        </div>

        <div className="stat-card">
          <Zap size={25} />
          <div>
            <strong>AI Powered</strong>
            <span>Smart Recommendations</span>
          </div>
        </div>

        <div className="stat-card">
          <Clock3 size={25} />
          <div>
            <strong>24 × 7</strong>
            <span>Booking System</span>
          </div>
        </div>

      </section>


      {/* AI RECOMMENDATIONS */}
      <section
        className="ai-section"
        id="ai"
      >
        <div className="section-heading">

          <span className="small-label">
            SMART TRAVEL
          </span>

          <h2>
            Let AI find your
            <span> ideal train.</span>
          </h2>

          <p>
            Choose your preference and RailConnect AI
            will analyse available trains for your route.
          </p>

        </div>

        <div className="ai-control-card">

          <div className="ai-control-left">
            <div className="ai-icon">
              <Sparkles size={25} />
            </div>

            <div>
              <h3>AI Train Recommendation</h3>

              <p>
                Route: {from || "Select source"} →{" "}
                {to || "Select destination"}
              </p>
            </div>
          </div>

          <div className="ai-controls">

            <select
              value={preference}
              onChange={(e) =>
                setPreference(e.target.value)
              }
            >
              <option value="balanced">
                Balanced
              </option>

              <option value="cheapest">
                Cheapest
              </option>

              <option value="fastest">
                Fastest
              </option>
            </select>

            <button
              className="ai-recommend-btn"
              onClick={getRecommendations}
              disabled={aiLoading}
            >
              <Sparkles size={17} />

              {aiLoading
                ? "Analysing..."
                : "Get AI Recommendations"}
            </button>

          </div>

        </div>

        {aiError && (
          <div className="ai-error">
            {aiError}
          </div>
        )}

        {aiLoading && (
          <div className="ai-loading">
            <Sparkles size={25} />

            <h3>
              AI is analysing available trains...
            </h3>

            <p>
              Comparing price, duration and seat
              availability.
            </p>
          </div>
        )}

        {!aiLoading &&
          recommendations.length > 0 && (
            <div className="recommendation-grid">

              {recommendations.map((train, index) => (
                <article
                  className="recommendation-card"
                  key={train.id}
                >

                  {index === 0 && (
                    <div className="recommended-badge">
                      <Sparkles size={13} />
                      AI Recommended
                    </div>
                  )}

                  <div className="recommendation-top">

                    <div className="recommendation-train-icon">
                      <TrainFront size={21} />
                    </div>

                    <div>
                      <h3>{train.name}</h3>

                      <span>
                        Train No. {train.number}
                      </span>
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
                      <span>
                        {train.duration}
                      </span>

                      <div></div>
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

                  <div className="recommendation-meta">

                    <span>
                      <Clock3 size={14} />
                      {train.duration}
                    </span>

                    <span>
                      <Users size={14} />
                      {train.seats} seats
                    </span>

                    <span>
                      {train.class}
                    </span>

                  </div>

                  <div className="recommendation-bottom">

                    <div>
                      <small>
                        Starting from
                      </small>

                      <strong>
                        <IndianRupee size={16} />
                        {train.price}
                      </strong>
                    </div>

                    <div className="ai-score">
                      AI Score
                      <strong>
                        {train.ai_score}
                      </strong>
                    </div>

                    <button
                      className="select-train-btn"
                      onClick={() =>
                        handleSelectRecommendation(
                          train
                        )
                      }
                    >
                      Select
                      <ArrowRight size={16} />
                    </button>

                  </div>

                </article>
              ))}

            </div>
          )}

        {!aiLoading &&
          !aiError &&
          recommendations.length === 0 && (
            <div className="ai-empty">
              <Sparkles size={30} />

              <h3>
                Ready to find your train?
              </h3>

              <p>
                Select your preference above and let
                the recommendation engine analyse
                the available trains.
              </p>
            </div>
          )}

      </section>


      {/* FEATURES */}
      <section
        className="features-section"
        id="features"
      >
        <div className="section-heading">

          <span className="small-label">
            EVERYTHING YOU NEED
          </span>

          <h2>
            A complete digital
            <span> railway experience.</span>
          </h2>

        </div>

        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon">
              <Search size={22} />
            </div>

            <h3>Smart Search</h3>

            <p>
              Find trains quickly using source,
              destination and journey date.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <Sparkles size={22} />
            </div>

            <h3>AI Recommendations</h3>

            <p>
              Get intelligent suggestions based on
              your travel preferences.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <ArmchairIcon />
            </div>

            <h3>Live Seat Selection</h3>

            <p>
              View available and booked seats before
              confirming your journey.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <TrainFront size={22} />
            </div>

            <h3>Digital Booking</h3>

            <p>
              Complete your booking and receive a
              unique PNR instantly.
            </p>
          </div>

        </div>
      </section>


      {/* FOOTER */}
      <footer className="footer">
        <div>
          <strong>RailConnect AI</strong>
          <span>
            Smart railway booking & recommendation
            system.
          </span>
        </div>

        <span>
          © 2026 RailConnect AI
        </span>
      </footer>

    </main>
  );
}

function ArmchairIcon() {
  return <TrainFront size={22} />;
}

export default Home;
