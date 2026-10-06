from .database import Base, engine
from .models import (
    AIRecommendationLog,
    Booking,
    Passenger,
    SearchHistory,
    Train,
)


def initialize_database():
    print("=" * 60)
    print("RAILCONNECT AI - DATABASE INITIALIZATION")
    print("=" * 60)

    print("\nCreating database tables...")

    Base.metadata.create_all(bind=engine)

    print("✓ Database tables created successfully.")

    print("\nAvailable tables:")
    print("  1. trains")
    print("  2. bookings")
    print("  3. passengers")
    print("  4. search_history")
    print("  5. ai_recommendation_logs")

    print("\nDatabase initialization completed.")
    print("=" * 60)


if __name__ == "__main__":
    initialize_database()
