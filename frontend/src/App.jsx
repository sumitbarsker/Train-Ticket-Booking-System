import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { TrainFront, Sparkles } from "lucide-react";

import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import SeatSelection from "./pages/SeatSelection";
import PassengerDetails from "./pages/PassengerDetails";
import ConfirmBooking from "./pages/ConfirmBooking";
import BookingSuccess from "./pages/BookingSuccess";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar">
          <Link to="/" className="brand">
            <div className="brand-icon">
              <TrainFront size={24} />
            </div>

            <div>
              <h2>RailConnect AI</h2>
              <span>Smart Railway Booking</span>
            </div>
          </Link>

          <div className="nav-links">
            <Link to="/">Home</Link>

            <a href="/#features">
              Features
            </a>

            <a href="/#ai">
              <Sparkles size={14} />
              AI Recommendations
            </a>
          </div>

          <button className="login-btn">
            Login
          </button>
        </nav>

        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/search"
            element={<SearchResults />}
          />

          <Route
            path="/seat-selection"
            element={<SeatSelection />}
          />

          <Route
            path="/passenger-details"
            element={<PassengerDetails />}
          />

          <Route
            path="/confirm-booking"
            element={<ConfirmBooking />}
          />

          <Route
            path="/booking-success"
            element={<BookingSuccess />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
