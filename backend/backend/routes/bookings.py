import random
import string

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, Passenger, Train


router = APIRouter()


# --------------------------------------------------
# Request Schemas
# --------------------------------------------------

class PassengerRequest(BaseModel):
    name: str = Field(..., min_length=2)
    age: int = Field(..., ge=1, le=120)
    gender: str
    seat: str


class BookingRequest(BaseModel):
    train_id: int
    from_station: str
    to_station: str
    journey_date: str
    seat_class: str
    seats: list[str] = Field(..., min_length=1, max_length=6)
    passengers: list[PassengerRequest] = Field(
        ...,
        min_length=1,
        max_length=6,
    )
    total_amount: float = Field(..., gt=0)
    payment_method: str
    contact_email: str
    contact_phone: str


# --------------------------------------------------
# Helpers
# --------------------------------------------------

def generate_pnr():
    return str(
        random.randint(
            1000000000,
            9999999999,
        )
    )


def generate_booking_id():
    characters = string.ascii_uppercase + string.digits

    random_part = "".join(
        random.choices(
            characters,
            k=7,
        )
    )

    return f"RC{random_part}"


def create_unique_pnr(db: Session):
    while True:
        pnr = generate_pnr()

        existing = (
            db.query(Booking)
            .filter(Booking.pnr == pnr)
            .first()
        )

        if not existing:
            return pnr


def create_unique_booking_id(db: Session):
    while True:
        booking_id = generate_booking_id()

        existing = (
            db.query(Booking)
            .filter(
                Booking.booking_id
                == booking_id
            )
            .first()
        )

        if not existing:
            return booking_id


def booking_to_dict(
    booking: Booking,
):
    return {
        "id": booking.id,
        "booking_id": booking.booking_id,
        "pnr": booking.pnr,
        "train_id": booking.train_id,
        "from": booking.from_station,
        "to": booking.to_station,
        "journey_date": booking.journey_date,
        "seat_class": booking.seat_class,
        "seats": booking.seats.split(","),
        "total_amount": booking.total_amount,
        "payment_method": booking.payment_method,
        "status": booking.status,
        "contact_email": booking.contact_email,
        "contact_phone": booking.contact_phone,
        "created_at": booking.created_at,
        "passengers": [
            {
                "name": passenger.name,
                "age": passenger.age,
                "gender": passenger.gender,
                "seat": passenger.seat,
            }
            for passenger in booking.passengers
        ],
        "train": {
            "id": booking.train.id,
            "number": booking.train.number,
            "name": booking.train.name,
            "type": booking.train.train_type,
            "class": booking.train.train_class,
            "source": booking.train.source,
            "destination": booking.train.destination,
            "departure": booking.train.departure,
            "arrival": booking.train.arrival,
            "duration": booking.train.duration,
            "price": booking.train.price,
            "available_seats": (
                booking.train.available_seats
            ),
        },
    }


# --------------------------------------------------
# Create Booking
# --------------------------------------------------

@router.post("/")
def create_booking(
    booking_data: BookingRequest,
    db: Session = Depends(get_db),
):
    # Find train
    train = (
        db.query(Train)
        .filter(
            Train.id
            == booking_data.train_id
        )
        .first()
    )

    if not train:
        raise HTTPException(
            status_code=404,
            detail="Train not found",
        )

    # Validate seat/passenger count
    if len(booking_data.seats) != len(
        booking_data.passengers
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Number of seats and "
                "passengers must be the same"
            ),
        )

    # Check available seats
    requested_seats = len(
        booking_data.seats
    )

    if (
        train.available_seats
        < requested_seats
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Only {train.available_seats} "
                "seats are available"
            ),
        )

    # Validate source/destination
    if (
        train.source.lower()
        != booking_data.from_station.strip().lower()
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid source station",
        )

    if (
        train.destination.lower()
        != booking_data.to_station.strip().lower()
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid destination station",
        )

    # Validate payment method
    allowed_payment_methods = {
        "upi",
        "card",
        "wallet",
    }

    if (
        booking_data.payment_method.lower()
        not in allowed_payment_methods
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid payment method",
        )

    # Prevent duplicate seats in one booking
    if len(set(booking_data.seats)) != len(
        booking_data.seats
    ):
        raise HTTPException(
            status_code=400,
            detail="Duplicate seats are not allowed",
        )

    # Generate identifiers
    pnr = create_unique_pnr(db)
    booking_id = create_unique_booking_id(db)

    # Create booking
    booking = Booking(
        booking_id=booking_id,
        pnr=pnr,
        train_id=train.id,
        from_station=booking_data.from_station,
        to_station=booking_data.to_station,
        journey_date=booking_data.journey_date,
        seat_class=booking_data.seat_class,
        seats=",".join(
            booking_data.seats
        ),
        total_amount=booking_data.total_amount,
        payment_method=(
            booking_data.payment_method.lower()
        ),
        status="Confirmed",
        contact_email=booking_data.contact_email,
        contact_phone=booking_data.contact_phone,
    )

    db.add(booking)

    # Reduce available seats
    train.available_seats -= requested_seats

    # Add passengers
    for passenger_data in (
        booking_data.passengers
    ):
        passenger = Passenger(
            booking=booking,
            name=passenger_data.name.strip(),
            age=passenger_data.age,
            gender=passenger_data.gender,
            seat=passenger_data.seat,
        )

        db.add(passenger)

    try:
        db.commit()
        db.refresh(booking)

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                f"Unable to create booking: {error}"
            ),
        )

    return {
        "message": "Booking confirmed successfully",
        "booking": booking_to_dict(
            booking
        ),
    }


# --------------------------------------------------
# Get Booking by ID
# --------------------------------------------------

@router.get("/{booking_id}")
def get_booking(
    booking_id: str,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.booking_id
            == booking_id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    return booking_to_dict(booking)


# --------------------------------------------------
# Get Booking by PNR
# --------------------------------------------------

@router.get("/pnr/{pnr}")
def get_booking_by_pnr(
    pnr: str,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.pnr == pnr
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    return booking_to_dict(booking)


# --------------------------------------------------
# Get All Bookings
# --------------------------------------------------

@router.get("/")
def get_all_bookings(
    db: Session = Depends(get_db),
):
    bookings = (
        db.query(Booking)
        .order_by(
            Booking.created_at.desc()
        )
        .all()
    )

    return {
        "count": len(bookings),
        "bookings": [
            booking_to_dict(booking)
            for booking in bookings
        ],
    }


# --------------------------------------------------
# Cancel Booking
# --------------------------------------------------

@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.booking_id
            == booking_id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found",
        )

    if booking.status == "Cancelled":
        raise HTTPException(
            status_code=400,
            detail="Booking is already cancelled",
        )

    # Restore seats
    cancelled_seats = len(
        booking.seats.split(",")
    )

    booking.train.available_seats += (
        cancelled_seats
    )

    booking.status = "Cancelled"

    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking cancelled successfully",
        "booking_id": booking.booking_id,
        "pnr": booking.pnr,
        "status": booking.status,
        "restored_seats": cancelled_seats,
    }
