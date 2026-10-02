from database import Base, engine
from models import (
    AIRecommendationLog,
    Booking,
    Passenger,
    SearchHistory,
    Train,
)


def initialize_database():
    print("Creating database tables...")

    Base.metadata.create_all(bind=engine)

    print("Database tables created successfully.")
    print()
    print("Available tables:")
    print("1. trains")
    print("2. bookings")
    print("3. passengers")
    print("4. search_history")
    print("5. ai_recommendation_logs")


if __name__ == "__main__":
    initialize_database()
