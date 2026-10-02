import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

# PostgreSQL ke liye .env me DATABASE_URL set kar sakte ho.
# Agar DATABASE_URL nahi hai, to local testing ke liye SQLite use hoga.
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./train_booking.db",
)

# SQLite ke liye special connection setting
connect_args = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False
    }

# Database engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

# Database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base class for SQLAlchemy models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency for database sessions.
    """

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()
