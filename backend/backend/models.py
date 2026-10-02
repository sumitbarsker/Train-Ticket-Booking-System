from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from .database import Base


class Train(Base):
    __tablename__ = "trains"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)

    train_type = Column(String(50), nullable=False)
    source = Column(String(100), nullable=False, index=True)
    destination = Column(String(100), nullable=False, index=True)

    departure = Column(String(10), nullable=False)
    arrival = Column(String(10), nullable=False)
    duration = Column(String(30), nullable=False)

    train_class = Column(String(20), nullable=False, default="3A")
    price = Column(Float, nullable=False, default=0)
    total_seats = Column(Integer, nullable=False, default=72)
    available_seats = Column(Integer, nullable=False, default=72)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    bookings = relationship(
        "Booking",
        back_populates="train",
        cascade="all, delete-orphan",
    )


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    booking_id = Column(
        String(30),
        unique=True,
        nullable=False,
        index=True,
    )

    pnr = Column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    train_id = Column(
        Integer,
        ForeignKey("trains.id"),
        nullable=False,
    )

    from_station = Column(
        String(100),
        nullable=False,
    )

    to_station = Column(
        String(100),
        nullable=False,
    )

    journey_date = Column(
        String(20),
        nullable=False,
    )

    seat_class = Column(
        String(20),
        nullable=False,
    )

    seats = Column(
        String(200),
        nullable=False,
    )

    total_amount = Column(
        Float,
        nullable=False,
        default=0,
    )

    payment_method = Column(
        String(30),
        nullable=False,
    )

    status = Column(
        String(30),
        nullable=False,
        default="Confirmed",
    )

    contact_email = Column(
        String(150),
        nullable=False,
    )

    contact_phone = Column(
        String(20),
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    train = relationship(
        "Train",
        back_populates="bookings",
    )

    passengers = relationship(
        "Passenger",
        back_populates="booking",
        cascade="all, delete-orphan",
    )


class Passenger(Base):
    __tablename__ = "passengers"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    booking_id = Column(
        Integer,
        ForeignKey("bookings.id"),
        nullable=False,
    )

    name = Column(
        String(100),
        nullable=False,
    )

    age = Column(
        Integer,
        nullable=False,
    )

    gender = Column(
        String(20),
        nullable=False,
    )

    seat = Column(
        String(20),
        nullable=False,
    )

    booking = relationship(
        "Booking",
        back_populates="passengers",
    )


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    source = Column(
        String(100),
        nullable=False,
    )

    destination = Column(
        String(100),
        nullable=False,
    )

    journey_date = Column(
        String(20),
        nullable=True,
    )

    preference = Column(
        String(50),
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )


class AIRecommendationLog(Base):
    __tablename__ = "ai_recommendation_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    source = Column(
        String(100),
        nullable=False,
    )

    destination = Column(
        String(100),
        nullable=False,
    )

    preference = Column(
        String(50),
        nullable=True,
    )

    recommended_train_id = Column(
        Integer,
        nullable=True,
    )

    ai_score = Column(
        Float,
        nullable=True,
    )

    ai_reason = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
