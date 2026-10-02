import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  IndianRupee,
  MapPin,
  TrainFront,
  Users,
  Sparkles,
} from "lucide-react";

const trains = [
  {
    id: 1,
    name: "Bhopal Express",
    number: "12156",
    departure: "20:10",
    arrival: "05:45",
    duration: "09h 35m",
    price: 850,
    seats: 42,
    class: "3A",
  },
  {
    id: 2,
    name: "Shatabdi Express",
    number: "12002",
    departure: "06:00",
    arrival: "14:25",
    duration: "08h 25m",
    price: 1250,
    seats: 18,
    class: "CC",
  },
  {
    id: 3,
    name: "Rajdhani Express",
    number: "12434",
    departure: "16:55",
    arrival: "23:50",
    duration: "06h 55m",
    price: 1450,
    seats: 27,
    class: "2A",
  },
];

function SearchResults() {
  const [searchParams] = useSearchParams();

  const from = searchParams.get("from") || "Bhopal";
  const to = searchParams.get("to") || "New Delhi";
  const date = searchParams.get("date") || "";

  const formattedDate = useMemo(() => {
    if (!date) {
      return "Selected journey date";
    }

    const selectedDate = new Date(`${date}T00:00:00`);

    return selectedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [date]);

  return (
    <main className="search-results-page">
      <div className="results-header">
        <div>
          <span className="small-label">AVAILABLE TRAINS</span>

          <h1>
            {from}
            <ArrowRight size={28} />
            {to}
          </h1>

          <p>Journey date: {formattedDate}</p>
        </div>

        <button
          className="modify-search-btn"
          onClick={() => window.history.back()}
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
            <span>{trains.length} trains found</span>

            <div className="ai-match">
              <Sparkles size={14} />
              AI recommendations enabled
            </div>
          </div>

          {trains.map((train) => (
            <article className="train-card" key={train.id}>
              <div className="train-main">
                <div className="train-info">
                  <div className="train-icon">
                    <TrainFront size={23} />
                  </div>

                  <div>
                    <h2>{train.name}</h2>
                    <span>{train.number}</span>
                  </div>
                </div>

                <div className="journey-time">
                  <div>
                    <strong>{train.departure}</strong>
                    <span>{from}</span>
                  </div>

                  <div className="journey-line">
                    <span>{train.duration}</span>
                    <div></div>
                  </div>

                  <div>
                    <strong>{train.arrival}</strong>
                    <span>{to}</span>
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
                </div>

                <div className="price-section">
                  <div>
                    <small>Starting from</small>

                    <strong>
                      <IndianRupee size={17} />
                      {train.price}
                    </strong>
                  </div>

                  <button className="select-train-btn">
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
