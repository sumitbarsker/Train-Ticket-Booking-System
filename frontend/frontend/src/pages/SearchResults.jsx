import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Filter,
  LoaderCircle,
  Search,
  Ticket,
  TrainFront,
  Users,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";


function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const source =
    searchParams.get("source") || "";

  const destination =
    searchParams.get("destination") || "";

  const date =
    searchParams.get("date") || "";

  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortBy, setSortBy] =
    useState("recommended");

  const [classFilter, setClassFilter] =
    useState("all");

  const [typeFilter, setTypeFilter] =
    useState("all");


  // ------------------------------------------------
  // FETCH TRAINS
  // ------------------------------------------------

  useEffect(() => {
    fetchTrains();
  }, [source, destination, date]);


  const fetchTrains = async () => {
    if (!source || !destination || !date) {
      setError(
        "Search information is incomplete."
      );

      setLoading(false);

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/search/trains`,
        {
          params: {
            source,
            destination,
            journey_date: date,
          },
        }
      );

      setTrains(
        response.data.trains || []
      );

    } catch (err) {
      setTrains([]);

      setError(
        err.response?.data?.detail ||
          "Unable to search trains."
      );

    } finally {
      setLoading(false);
    }
  };


  // ------------------------------------------------
  // FILTER + SORT
  // ------------------------------------------------

  const filteredTrains = useMemo(() => {
    let result = [...trains];


    if (classFilter !== "all") {
      result = result.filter(
        (train) =>
          train.class === classFilter
      );
    }


    if (typeFilter !== "all") {
      result = result.filter(
        (train) =>
          train.type === typeFilter
      );
    }


    if (sortBy === "price-low") {
      result.sort(
        (a, b) => a.price - b.price
      );
    }


    if (sortBy === "price-high") {
      result.sort(
        (a, b) => b.price - a.price
      );
    }


    if (sortBy === "duration") {
      result.sort(
        (a, b) =>
          getDurationMinutes(a.duration) -
          getDurationMinutes(b.duration)
      );
    }


    if (sortBy === "seats") {
      result.sort(
        (a, b) =>
          b.available_seats -
          a.available_seats
      );
    }


    if (sortBy === "recommended") {
      result.sort(
        (a, b) => {
          const scoreA =
            getRecommendationScore(a);

          const scoreB =
            getRecommendationScore(b);

          return scoreB - scoreA;
        }
      );
    }


    return result;
  }, [
    trains,
    classFilter,
    typeFilter,
    sortBy,
  ]);


  // ------------------------------------------------
  // HELPERS
  // ------------------------------------------------

  function getDurationMinutes(duration) {
    if (!duration) {
      return 0;
    }

    const match =
      duration.match(
        /(\d+)h\s*(\d+)?m?/
      );

    if (!match) {
      return 0;
    }

    const hours =
      Number(match[1] || 0);

    const minutes =
      Number(match[2] || 0);

    return (
      hours * 60 +
      minutes
    );
  }


  function getRecommendationScore(train) {
    const priceScore =
      Math.max(
        0,
        1000 - Number(train.price || 0)
      );

    const durationScore =
      Math.max(
        0,
        1000 -
          getDurationMinutes(
            train.duration
          )
      );

    const seatScore =
      Number(
        train.available_seats || 0
      ) * 10;

    return (
      priceScore +
      durationScore +
      seatScore
    );
  }


  // ------------------------------------------------
  // SELECT TRAIN
  // ------------------------------------------------

  const handleSelectTrain = (train) => {
    if (
      Number(train.available_seats || 0) <= 0
    ) {
      return;
    }

    navigate(
      "/seat-selection",
      {
        state: {
          train,
          from: source,
          to: destination,
          date,
        },
      }
    );
  };


  // ------------------------------------------------
  // CLEAR FILTERS
  // ------------------------------------------------

  const clearFilters = () => {
    setClassFilter("all");
    setTypeFilter("all");
    setSortBy("recommended");
  };


  // ------------------------------------------------
  // UI
  // ------------------------------------------------

  return (
    <main className="search-page">

      {/* HEADER */}

      <section className="search-header">

        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          <ArrowLeft size={18} />
          Back to Search
        </button>


        <div className="search-header-content">

          <div>
            <span className="section-label">
              TRAIN SEARCH
            </span>

            <h1>
              Available Trains
            </h1>

            <p>
              Choose a train for your journey.
            </p>
          </div>


          <div className="route-badge">

            <div>
              <span>FROM</span>
              <strong>
                {source}
              </strong>
            </div>

            <ArrowRight size={18} />

            <div>
              <span>TO</span>
              <strong>
                {destination}
              </strong>
            </div>

          </div>

        </div>


        <div className="journey-date-badge">
          <CalendarDays size={17} />

          <span>
            Journey Date:
          </span>

          <strong>
            {date}
          </strong>
        </div>

      </section>


      {/* MAIN CONTENT */}

      <section className="search-layout">

        {/* FILTER PANEL */}

        <aside className="filter-panel">

          <div className="filter-title">
            <Filter size={18} />
            Filters
          </div>


          <div className="filter-group">

            <label>
              Sort By
            </label>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value
                )
              }
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
                Most Seats Available
              </option>
            </select>

          </div>


          <div className="filter-group">

            <label>
              Class
            </label>

            {[
              ["all", "All Classes"],
              ["3A", "3A"],
              ["2A", "2A"],
              ["CC", "CC"],
              ["SL", "SL"],
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  className={
                    classFilter === value
                      ? "filter-option active"
                      : "filter-option"
                  }
                  onClick={() =>
                    setClassFilter(
                      value
                    )
                  }
                >
                  {label}
                </button>
              )
            )}

          </div>


          <div className="filter-group">

            <label>
              Train Type
            </label>

            {[
              ["all", "All Types"],
              ["Express", "Express"],
              ["Superfast", "Superfast"],
              ["Rajdhani", "Rajdhani"],
              ["Intercity", "Intercity"],
            ].map(
              ([value, label]) => (
                <button
                  key={value}
                  className={
                    typeFilter === value
                      ? "filter-option active"
                      : "filter-option"
                  }
                  onClick={() =>
                    setTypeFilter(
                      value
                    )
                  }
                >
                  {label}
                </button>
              )
            )}

          </div>


          <button
            className="clear-filter-btn"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </aside>


        {/* RESULTS */}

        <div className="results-section">

          {loading ? (
            <div className="loading-card">

              <LoaderCircle
                size={32}
                className="loading-icon"
              />

              <h3>
                Searching trains...
              </h3>

              <p>
                Checking availability for{" "}
                {date}
              </p>

            </div>

          ) : error ? (
            <div className="empty-results">

              <Search size={42} />

              <h2>
                Search failed
              </h2>

              <p>
                {error}
              </p>

              <button
                className="primary-btn"
                onClick={() => navigate("/")}
              >
                Search Again
              </button>

            </div>

          ) : filteredTrains.length === 0 ? (
            <div className="empty-results">

              <TrainFront size={42} />

              <h2>
                No trains found
              </h2>

              <p>
                No available trains match your
                selected route and filters.
              </p>

              <button
                className="primary-btn"
                onClick={clearFilters}
              >
                Clear Filters
              </button>

            </div>

          ) : (
            <>

              <div className="results-heading">

                <div>
                  <span className="section-label">
                    SEARCH RESULTS
                  </span>

                  <h2>
                    {filteredTrains.length}{" "}
                    train
                    {filteredTrains.length !== 1
                      ? "s"
                      : ""}{" "}
                    available
                  </h2>
                </div>

                <span className="result-count">
                  {source} → {destination}
                </span>

              </div>


              <div className="train-results">

                {filteredTrains.map(
                  (train) => {

                    const soldOut =
                      Number(
                        train.available_seats || 0
                      ) <= 0;

                    return (
                      <article
                        className="train-result-card"
                        key={train.id}
                      >

                        <div className="train-main">

                          <div className="train-icon">
                            <TrainFront
                              size={24}
                            />
                          </div>


                          <div className="train-info">

                            <div className="train-title">

                              <h3>
                                {train.name}
                              </h3>

                              <span>
                                #{train.number}
                              </span>

                            </div>


                            <div className="train-type">
                              {train.type}
                            </div>


                            <div className="journey-times">

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

                                <div>
                                  <span></span>
                                </div>
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


                            <div className="train-details">

                              <span>
                                <Ticket
                                  size={15}
                                />
                                {train.class}
                              </span>

                              <span>
                                <Users
                                  size={15}
                                />
                                {train.available_seats}{" "}
                                seats available
                              </span>

                            </div>

                          </div>


                          <div className="train-price">

                            <span>
                              Starting from
                            </span>

                            <strong>
                              ₹{train.price}
                            </strong>


                            <button
                              className={
                                soldOut
                                  ? "select-train-btn disabled"
                                  : "select-train-btn"
                              }
                              disabled={soldOut}
                              onClick={() =>
                                handleSelectTrain(
                                  train
                                )
                              }
                            >
                              {soldOut
                                ? "Sold Out"
                                : "Select Train"}

                              {!soldOut && (
                                <ArrowRight
                                  size={17}
                                />
                              )}
                            </button>

                          </div>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>

            </>
          )}

        </div>

      </section>

    </main>
  );
}


export default SearchResults;
