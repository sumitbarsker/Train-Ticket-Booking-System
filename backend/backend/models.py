from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from backend.database import Base


class Train(Base):
    __tablename__ = "trains"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    number = Column(String(20), unique=True, nullable=False)
    source = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    departure = Column(String(10), nullable=False)
    arrival = Column(String(10), nullable=False)
    duration = Column(String(20), nullable=False)
    price = Column(Integer, nullable=False)
    seats = Column(Integer, nullable=False)
    train_class = Column(String(20), nullable=False)
    train_type = Column(String(50), nullable=False)

    bookings = relationship(
        "Booking",
        back_populates="train",
    )


class Passenger(Base):
    __tablename__ = "passengers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    mobile = Column(String(15), nullable=False)
    email = Column(String(150), nullable=False)

    bookings = relationship(
        "Booking",
        back_populates="passenger",
    )


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    pnr = Column(String(20), unique=True, nullable=False, index=True)
    booking_id = Column(String(30), unique=True, nullable=False)

    train_id = Column(
        Integer,
        ForeignKey("trains.id"),
        nullable=False,
    )

    passenger_id = Column(
        Integer,
        ForeignKey("passengers.id"),
        nullable=False,
    )

    seat = Column(String(10), nullable=False)
    status = Column(String(30), default="Confirmed")
    booked_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    train = relationship(
        "Train",
        back_populates="bookings",
    )

    passenger = relationship(
        "Passenger",
        back_populates="bookings",
    )
