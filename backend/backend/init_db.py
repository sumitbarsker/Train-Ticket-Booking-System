from backend.database import Base, engine
from backend import models


def initialize_database():
    print("Creating database tables...")

    Base.metadata.create_all(bind=engine)

    print("Database tables created successfully.")


if __name__ == "__main__":
    initialize_database()
