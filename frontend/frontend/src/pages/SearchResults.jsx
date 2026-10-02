import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  ArrowLeft,
  Clock3,
  IndianRupee,
  Armchair,
  TrainFront,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const source = searchParams.get("source") || "";
  const destination = searchParams.get("destination") || "";
  const date = searchParams.get("date") || "";

  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortBy, setSortBy] = useState("recommended");
  const [classFilter, setClassFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/search/trains`,
          {
            params: {
              source,
              destination,
            },
          }
        );

        setTrains(response.data.trains || []);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Unable to load trains. Please start the backend."
        );
      } finally {
        setLoading(false);
      }
    };

    if (source && destination) {
      fetchTrains();
    } else {
      setLoading(false);
      setError("Source and destination are required.");
    }
  }, [source, destination]);

  const filteredAndSortedTrains = useMemo(() => {
    let result = [...trains];

    if (classFilter !== "all") {
      result = result.filter(
        (train) =>
          train.class?.toLowerCase() === classFilter.toLowerCase()
      );
    }

    if (typeFilter !== "all") {
      result = result.filter(
        (train) =>
          train.type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "duration") {
      result.sort((a, b) => {
        const getMinutes = (duration) => {
          const match = duration?.match(
            /(\d+)h\s*(\d+)?m?/
          );

          if (!match) return Number.MAX_SAFE_INTEGER;

          const hours = Number(match[1]) || 0;
          const minutes = Number(match[2]) || 0;

          return hours * 60 + minutes;
        };

        return (
          getMinutes(a.duration) -
          getMinutes(b.duration)
        );
      });
    }

    if (sortBy === "seats") {
      result.sort((a, b) => b.seats - a.seats);
    }

    return result;
  }, [trains, sortBy, classFilter, typeFilter]);

  const handleSelectTrain = (train) => {
    navigate("/seat-selection", {
      state: {
        train,
        from: source,
        to: destination,
        date,
      },
    });
  };

  return (
    <main className="search-page">
      <section className="search-header">
        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div>
          <span className="section-label">TRAIN SEARCH</span>

          <h1>
            {source} <ArrowRight size={24} /> {destination}
          </h1>

          {date && (
            <p>Journey Date: {date}</p>
          )}
        </div>
      </section>

      <section className="search-layout">
        {/* FILTER SIDEBAR */}
        <aside className="filter-panel">
          <div className="filter-title">
            <SlidersHorizontal size={20} />
            <h3>Filters & Sort</h3>
          </div>

          <div className="filter-group">
            <label>Sort By</label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recommended">
                Recommended
              </option>

              <option value="price-low">
                Price: Low to High
              </option>

              <option value="price-high">
                Price: High to Low
              </option>

              <option value="duration">
                Shortest Duration
              </option>

              <option value="seats">
                Most Available Seats
              </option>
            </select>
          </div>

          <div className="filter-group">
            <label>Class</label>

            <select
              value={classFilter}
              onChange={(e) =>
                setClassFilter(e.target.value)
              }
            >
              <option value="all">All Classes</option>
              <option value="3A">3A</option>
              <option value="2A">2A</option>
              <option value="CC">CC</option>
              <option value="SL">SL</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Train Type</label>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
            >
              <option value="all">All Types</option>
              <option value="Express">Express</option>
              <option value="Superfast">Superfast</option>
              <option value="Rajdhani">Rajdhani</option>
              <option value="Intercity">Intercity</option>
            </select>
          </div>

          <button
            className="clear-filter-btn"
            onClick={() => {
              setSortBy("recommended");
              setClassFilter("all");
              setTypeFilter("all");
            }}
          >
            Clear Filters
          </button>
        </aside>

        {/* RESULTS */}
        <section className="results-section">
          <div className="results-heading">
            <div>
              <span className="section-label">
                AVAILABLE TRAINS
              </span>

              <h2>
                {loading
                  ? "Finding trains..."
                  : `${filteredAndSortedTrains.length} Trains Found`}
              </h2>
            </div>

            <div className="route-badge">
              <TrainFront size={18} />
              {source} → {destination}
            </div>
          </div>

          {loading && (
            <div className="loading-card">
              <Sparkles size={28} />
              <p>Searching available trains...</p>
            </div>
          )}

          {!loading && error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {!loading &&
            !error &&
            filteredAndSortedTrains.length === 0 && (
              <div className="empty-results">
                <TrainFront size={42} />

                <h3>No trains found</h3>

                <p>
                  Try changing your filters or search for
                  another route.
                </p>
              </div>
            )}

          <div className="train-results">
            {filteredAndSortedTrains.map((train) => (
              <article
                className="train-result-card"
                key={train.id}
              >
                <div className="train-main">
                  <div className="train-info">
                    <span className="train-number">
                      #{train.number}
                    </span>

                    <h3>{train.name}</h3>

                    <span className="train-type">
                      {train.type}
                    </span>
                  </div>

                  <div className="journey-times">
                    <div>
                      <strong>
                        {train.departure}
                      </strong>
                      <span>{train.source}</span>
                    </div>

                    <div className="journey-line">
                      <ArrowRight size={20} />
                      <span>{train.duration}</span>
                    </div>

                    <div>
                      <strong>
                        {train.arrival}
                      </strong>
                      <span>{train.destination}</span>
                    </div>
                  </div>
                </div>

                <div className="train-details">
                  <div>
                    <Clock3 size={17} />
                    <span>{train.duration}</span>
                  </div>

                  <div>
                    <Armchair size={17} />
                    <span>
                      {train.seats} seats
                    </span>
                  </div>

                  <div>
                    <TrainFront size={17} />
                    <span>{train.class}</span>
                  </div>

                  <div className="train-price">
                    <IndianRupee size={17} />
                    <strong>{train.price}</strong>
                  </div>

                  <button
                    className="select-train-btn"
                    onClick={() =>
                      handleSelectTrain(train)
                    }
                  >
                    Select Train
                    <ArrowRight size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

export default SearchResults;
