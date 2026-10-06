import random
import string

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, Passenger, Train


router = APIRouter()


# ============================================================
# Pydantic Schemas
# ============================================================

class PassengerRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., min_length=1, max_length=20)
    seat: str = Field(..., min_length=1, max_length=20)


class BookingRequest(BaseModel):
    train_id: int
    from_station: str
    to_station: str
    journey_date: str
    seat_class: str
    seats: list[str]
    passengers: list[PassengerRequest]
    total_amount: float = Field(..., ge=0)
    payment_method: str
    contact_email: str
    contact_phone: str


# ============================================================
# Utility Functions
# ============================================================

def generate_pnr(db: Session):
    while True:
        pnr = "".join(
            random.choices(
                string.digits,
                k=10,
            )
        )

        existing = (
            db.query(Booking)
            .filter(Booking.pnr == pnr)
            .first()
        )

        if not existing:
            return pnr


def generate_booking_id(db: Session):
    while True:
        booking_id = (
            "RC"
            + "".join(
                random.choices(
                    string.ascii_uppercase + string.digits,
                    k=8,
                )
            )
        )

        existing = (
            db.query(Booking)
            .filter(Booking.booking_id == booking_id)
            .first()
        )

        if not existing:
            return booking_id


def booking_to_dict(booking: Booking):
    return {
        "id": booking.id,
        "booking_id": booking.booking_id,
        "pnr": booking.pnr,
        "train_id": booking.train_id,
        "from_station": booking.from_station,
        "to_station": booking.to_station,
        "journey_date": booking.journey_date,
        "seat_class": booking.seat_class,
        "seats": [
            seat.strip()
            for seat in booking.seats.split(",")
            if seat.strip()
        ],
        "total_amount": booking.total_amount,
        "payment_method": booking.payment_method,
        "status": booking.status,
        "contact_email": booking.contact_email,
        "contact_phone": booking.contact_phone,
        "created_at": booking.created_at,
        "train": {
            "number": booking.train.number,
            "name": booking.train.name,
            "type": booking.train.train_type,
            "departure": booking.train.departure,
            "arrival": booking.train.arrival,
            "duration": booking.train.duration,
        },
        "passengers": [
            {
                "id": passenger.id,
                "name": passenger.name,
                "age": passenger.age,
                "gender": passenger.gender,
                "seat": passenger.seat,
            }
            for passenger in booking.passengers
        ],
    }


# ============================================================
# Create Booking
# ============================================================

@router.post("/")
def create_booking(
    request: BookingRequest,
    db: Session = Depends(get_db),
):
    train = (
        db.query(Train)
        .filter(Train.id == request.train_id)
        .first()
    )

    if not train:
        raise HTTPException(
            status_code=404,
            detail="Train not found.",
        )

    source = request.from_station.strip()
    destination = request.to_station.strip()
    journey_date = request.journey_date.strip()
    seat_class = request.seat_class.strip()

    if not source or not destination:
        raise HTTPException(
            status_code=400,
            detail="Source and destination are required.",
        )

    if source.lower() != train.source.lower():
        raise HTTPException(
            status_code=400,
            detail="Source station does not match the selected train.",
        )

    if destination.lower() != train.destination.lower():
        raise HTTPException(
            status_code=400,
            detail="Destination station does not match the selected train.",
        )

    if not journey_date:
        raise HTTPException(
            status_code=400,
            detail="Journey date is required.",
        )

    if not seat_class:
        raise HTTPException(
            status_code=400,
            detail="Seat class is required.",
        )

    if not request.seats:
        raise HTTPException(
            status_code=400,
            detail="At least one seat must be selected.",
        )

    if len(request.seats) > 6:
        raise HTTPException(
            status_code=400,
            detail="Maximum 6 seats can be booked at once.",
        )

    if len(request.seats) != len(request.passengers):
        raise HTTPException(
            status_code=400,
            detail="Number of seats and passengers must match.",
        )

    clean_seats = [
        seat.strip().upper()
        for seat in request.seats
        if seat.strip()
    ]

    if len(clean_seats) != len(set(clean_seats)):
        raise HTTPException(
            status_code=400,
            detail="Duplicate seats are not allowed.",
        )

    passenger_seats = [
        passenger.seat.strip().upper()
        for passenger in request.passengers
    ]

    if set(clean_seats) != set(passenger_seats):
        raise HTTPException(
            status_code=400,
            detail="Passenger seats must match selected seats.",
        )

    if train.available_seats < len(clean_seats):
        raise HTTPException(
            status_code=409,
            detail=(
                f"Only {train.available_seats} seats "
                "are currently available."
            ),
        )

    allowed_payment_methods = {
        "UPI",
        "Card",
        "Wallet",
    }

    if request.payment_method not in allowed_payment_methods:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment method.",
        )

    if not request.contact_email.strip():
        raise HTTPException(
            status_code=400,
            detail="Contact email is required.",
        )

    if not request.contact_phone.strip():
        raise HTTPException(
            status_code=400,
            detail="Contact phone is required.",
        )

    # --------------------------------------------------------
    # Create Booking
    # --------------------------------------------------------

    booking = Booking(
        booking_id=generate_booking_id(db),
        pnr=generate_pnr(db),
        train_id=train.id,
        from_station=source,
        to_station=destination,
        journey_date=journey_date,
        seat_class=seat_class,
        seats=",".join(clean_seats),
        total_amount=request.total_amount,
        payment_method=request.payment_method,
        status="Confirmed",
        contact_email=request.contact_email.strip(),
        contact_phone=request.contact_phone.strip(),
    )

    db.add(booking)
    db.flush()

    for passenger_request in request.passengers:
        passenger = Passenger(
            booking_id=booking.id,
            name=passenger_request.name.strip(),
            age=passenger_request.age,
            gender=passenger_request.gender.strip(),
            seat=passenger_request.seat.strip().upper(),
        )

        db.add(passenger)

    train.available_seats -= len(clean_seats)

    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking confirmed successfully.",
        "booking": booking_to_dict(booking),
    }


# ============================================================
# Get Booking by Booking ID
# ============================================================

@router.get("/{booking_id}")
def get_booking(
    booking_id: str,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(Booking.booking_id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found.",
        )

    return booking_to_dict(booking)


# ============================================================
# Get Booking by PNR
# ============================================================

@router.get("/pnr/{pnr}")
def get_booking_by_pnr(
    pnr: str,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(Booking.pnr == pnr)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found for this PNR.",
        )

    return booking_to_dict(booking)


# ============================================================
# Get All Bookings
# ============================================================

@router.get("/")
def get_all_bookings(
    db: Session = Depends(get_db),
):
    bookings = (
        db.query(Booking)
        .order_by(Booking.created_at.desc())
        .all()
    )

    return {
        "count": len(bookings),
        "bookings": [
            booking_to_dict(booking)
            for booking in bookings
        ],
    }


# ============================================================
# Cancel Booking
# ============================================================

@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(Booking.booking_id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found.",
        )

    if booking.status == "Cancelled":
        raise HTTPException(
            status_code=400,
            detail="Booking is already cancelled.",
        )

    seat_count = len(
        [
            seat
            for seat in booking.seats.split(",")
            if seat.strip()
        ]
    )

    train = (
        db.query(Train)
        .filter(Train.id == booking.train_id)
        .first()
    )

    if train:
        train.available_seats = min(
            train.total_seats,
            train.available_seats + seat_count,
        )

    booking.status = "Cancelled"

    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking cancelled successfully.",
        "booking_id": booking.booking_id,
        "pnr": booking.pnr,
        "status": booking.status,
        "restored_seats": seat_count,
    }
