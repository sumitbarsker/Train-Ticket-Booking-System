import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  Clock3,
  IndianRupee,
  MapPin,
  TrainFront,
  Users,
  Sparkles,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";

  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrains = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `${API_URL}/search/trains`,
          {
            params: {
              source: from,
              destination: to,
            },
          }
        );

        setTrains(response.data.trains);
      } catch (requestError) {
        console.error("Train search failed:", requestError);

        setError(
          requestError.response?.data?.detail ||
            "Unable to search trains."
        );
      } finally {
        setLoading(false);
      }
    };

    if (from && to) {
      fetchTrains();
    } else {
      setLoading(false);
    }
  }, [from, to]);

  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "Selected journey date";

  const handleSelectTrain = (train) => {
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
    <main className="search-results-page">
      <div className="results-header">
        <div>
          <span className="small-label">
            AVAILABLE TRAINS
          </span>

          <h1>
            {from}

            <ArrowRight size={28} />

            {to}
          </h1>

          <p>
            Journey date: {formattedDate}
          </p>
        </div>

        <button
          className="modify-search-btn"
          onClick={() => navigate("/")}
        >
          Modify Search
        </button>
      </div>

      <div className="results-layout">
        <aside className="filter-card">
          <h3>Filter Trains</h3>

          <div className="filter-group">
            <span>Departure Time</span>

            <label>
              <input type="checkbox" />
              Morning
            </label>

            <label>
              <input type="checkbox" />
              Afternoon
            </label>

            <label>
              <input type="checkbox" />
              Evening
            </label>

            <label>
              <input type="checkbox" />
              Night
            </label>
          </div>

          <div className="filter-group">
            <span>Class</span>

            <label>
              <input type="checkbox" />
              AC First Class
            </label>

            <label>
              <input type="checkbox" />
              2A
            </label>

            <label>
              <input type="checkbox" />
              3A
            </label>

            <label>
              <input type="checkbox" />
              Sleeper
            </label>
          </div>

          <div className="filter-group">
            <span>Sort By</span>

            <label>
              <input type="radio" name="sort" />
              Cheapest
            </label>

            <label>
              <input type="radio" name="sort" />
              Fastest
            </label>

            <label>
              <input type="radio" name="sort" />
              Departure
            </label>
          </div>
        </aside>

        <section className="train-list">
          <div className="results-top">
            <span>
              {loading
                ? "Searching trains..."
                : `${trains.length} trains found`}
            </span>

            <div className="ai-match">
              <Sparkles size={14} />
              AI recommendations enabled
            </div>
          </div>

          {loading && (
            <div className="empty-state">
              <TrainFront size={42} />
              <h2>Finding available trains...</h2>
              <p>
                Searching our railway database.
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="empty-state">
              <TrainFront size={42} />
              <h2>Search failed</h2>
              <p>{error}</p>

              <button
                className="select-train-btn"
                onClick={() => navigate("/")}
              >
                Back to Search
              </button>
            </div>
          )}

          {!loading &&
            !error &&
            trains.length === 0 && (
              <div className="empty-state">
                <TrainFront size={42} />
                <h2>No trains found</h2>
                <p>
                  No trains are currently available for
                  this route.
                </p>

                <button
                  className="select-train-btn"
                  onClick={() => navigate("/")}
                >
                  Modify Search
                </button>
              </div>
            )}

          {!loading &&
            !error &&
            trains.map((train) => (
              <article
                className="train-card"
                key={train.id}
              >
                <div className="train-main">
                  <div className="train-info">
                    <div className="train-icon">
                      <TrainFront size={23} />
                    </div>

                    <div>
                      <h2>{train.name}</h2>

                      <span>
                        Train No. {train.number}
                      </span>
                    </div>
                  </div>

                  <div className="journey-time">
                    <div>
                      <strong>
                        {train.departure}
                      </strong>

                      <span>
                        {train.source}
                      </span>
                    </div>

                    <div className="journey-line">
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
                </div>

                <div className="train-bottom">
                  <div className="train-meta">
                    <span>
                      <Clock3 size={15} />
                      {train.duration}
                    </span>

                    <span>
                      <Users size={15} />
                      {train.seats} seats
                    </span>

                    <span>
                      <MapPin size={15} />
                      {train.class}
                    </span>

                    <span>
                      {train.type}
                    </span>
                  </div>

                  <div className="price-section">
                    <div>
                      <small>Starting from</small>

                      <strong>
                        <IndianRupee size={17} />
                        {train.price}
                      </strong>
                    </div>

                    <button
                      className="select-train-btn"
                      onClick={() =>
                        handleSelectTrain(train)
                      }
                    >
                      Select Train
                    </button>
                  </div>
                </div>
              </article>
            ))}
        </section>
      </div>
    </main>
  );
}

export default SearchResults;
