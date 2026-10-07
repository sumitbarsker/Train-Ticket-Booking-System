import random
import string
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, Passenger, Train

router = APIRouter()


# ---------------------------------------------------------
# REQUEST SCHEMAS
# ---------------------------------------------------------

class PassengerRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., min_length=1, max_length=20)
    seat: str = Field(..., min_length=1, max_length=20)


class BookingRequest(BaseModel):
    train_id: int
    from_station: str = Field(..., min_length=2)
    to_station: str = Field(..., min_length=2)
    journey_date: str = Field(..., min_length=1)
    seat_class: str = Field(..., min_length=1)
    seats: List[str] = Field(..., min_length=1, max_length=6)
    passengers: List[PassengerRequest] = Field(
        ...,
        min_length=1,
        max_length=6,
    )
    total_amount: float = Field(..., gt=0)
    payment_method: str = Field(..., min_length=1)
    contact_email: EmailStr
    contact_phone: str = Field(..., min_length=10, max_length=15)


# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

ALLOWED_CLASSES = {"SL", "3A", "2A", "CC"}
ALLOWED_PAYMENT_METHODS = {
    "UPI",
    "Card",
    "Wallet",
}


def generate_pnr(db: Session) -> str:
    while True:
        pnr = "".join(
            random.choices(
                string.digits,
                k=10,
            )
        )

        exists = (
            db.query(Booking)
            .filter(Booking.pnr == pnr)
            .first()
        )

        if not exists:
            return pnr


def generate_booking_id(db: Session) -> str:
    while True:
        booking_id = (
            "RC"
            + "".join(
                random.choices(
                    string.ascii_uppercase
                    + string.digits,
                    k=10,
                )
            )
        )

        exists = (
            db.query(Booking)
            .filter(
                Booking.booking_id == booking_id
            )
            .first()
        )

        if not exists:
            return booking_id


def booking_to_dict(booking: Booking):
    train = booking.train

    return {
        "id": booking.id,
        "booking_id": booking.booking_id,
        "pnr": booking.pnr,
        "train": {
            "id": train.id,
            "number": train.number,
            "name": train.name,
            "type": train.train_type,
            "class": train.train_class,
            "source": train.source,
            "destination": train.destination,
            "departure": train.departure,
            "arrival": train.arrival,
            "duration": train.duration,
            "price": train.price,
            "available_seats": train.available_seats,
            "total_seats": train.total_seats,
        },
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
        "created_at": booking.created_at,
    }


# ---------------------------------------------------------
# CREATE BOOKING
# ---------------------------------------------------------

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
    seat_class = request.seat_class.strip().upper()
    payment_method = request.payment_method.strip()

    if not source or not destination:
        raise HTTPException(
            status_code=400,
            detail="Source and destination are required.",
        )

    if source.lower() == destination.lower():
        raise HTTPException(
            status_code=400,
            detail="Source and destination cannot be the same.",
        )

    if source.lower() != train.source.lower():
        raise HTTPException(
            status_code=400,
            detail="Source does not match the selected train.",
        )

    if destination.lower() != train.destination.lower():
        raise HTTPException(
            status_code=400,
            detail="Destination does not match the selected train.",
        )

    if not journey_date:
        raise HTTPException(
            status_code=400,
            detail="Journey date is required.",
        )

    if seat_class not in ALLOWED_CLASSES:
        raise HTTPException(
            status_code=400,
            detail="Invalid seat class.",
        )

    if payment_method not in ALLOWED_PAYMENT_METHODS:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment method.",
        )

    # -----------------------------------------------------
    # SEAT VALIDATION
    # -----------------------------------------------------

    seats = [
        str(seat).strip()
        for seat in request.seats
    ]

    if len(seats) != len(set(seats)):
        raise HTTPException(
            status_code=400,
            detail="Duplicate seats are not allowed.",
        )

    if len(seats) > 6:
        raise HTTPException(
            status_code=400,
            detail="Maximum 6 seats can be booked.",
        )

    if len(seats) != len(request.passengers):
        raise HTTPException(
            status_code=400,
            detail=(
                "Number of passengers must match "
                "number of seats."
            ),
        )

    passenger_seats = [
        str(passenger.seat).strip()
        for passenger in request.passengers
    ]

    if set(passenger_seats) != set(seats):
        raise HTTPException(
            status_code=400,
            detail=(
                "Passenger seats must match "
                "selected seats."
            ),
        )

    # -----------------------------------------------------
    # CHECK ALREADY BOOKED SEATS
    # -----------------------------------------------------

    existing_bookings = (
        db.query(Booking)
        .filter(
            Booking.train_id == train.id,
            Booking.journey_date == journey_date,
            Booking.seat_class == seat_class,
            Booking.status == "Confirmed",
        )
        .all()
    )

    booked_seats = set()

    for existing in existing_bookings:
        if existing.seats:
            booked_seats.update(
                seat.strip()
                for seat in existing.seats.split(",")
                if seat.strip()
            )

    unavailable_seats = [
        seat
        for seat in seats
        if seat in booked_seats
    ]

    if unavailable_seats:
        raise HTTPException(
            status_code=409,
            detail=(
                "These seats are already booked: "
                + ", ".join(unavailable_seats)
            ),
        )

    # -----------------------------------------------------
    # CHECK TRAIN AVAILABILITY
    # -----------------------------------------------------

    if train.available_seats < len(seats):
        raise HTTPException(
            status_code=409,
            detail="Not enough seats available.",
        )

    # -----------------------------------------------------
    # CREATE BOOKING
    # -----------------------------------------------------

    booking = Booking(
        booking_id=generate_booking_id(db),
        pnr=generate_pnr(db),
        train_id=train.id,
        from_station=source,
        to_station=destination,
        journey_date=journey_date,
        seat_class=seat_class,
        seats=",".join(seats),
        total_amount=request.total_amount,
        payment_method=payment_method,
        status="Confirmed",
        contact_email=str(
            request.contact_email
        ),
        contact_phone=request.contact_phone,
    )

    db.add(booking)

    # Flush first so the booking gets its database ID.
    db.flush()

    # -----------------------------------------------------
    # CREATE PASSENGERS
    # -----------------------------------------------------

    for passenger_data in request.passengers:
        passenger = Passenger(
            booking_id=booking.id,
            name=passenger_data.name.strip(),
            age=passenger_data.age,
            gender=passenger_data.gender.strip(),
            seat=passenger_data.seat.strip(),
        )

        db.add(passenger)

    # -----------------------------------------------------
    # UPDATE TRAIN AVAILABILITY
    # -----------------------------------------------------

    train.available_seats = max(
        train.available_seats - len(seats),
        0,
    )

    try:
        db.commit()
        db.refresh(booking)

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Booking could not be completed. "
                "Please try again."
            ),
        ) from error

    return {
        "message": "Booking confirmed successfully.",
        "booking": booking_to_dict(booking),
        "booking_id": booking.booking_id,
        "pnr": booking.pnr,
        "status": booking.status,
        "total_amount": booking.total_amount,
    }


# ---------------------------------------------------------
# GET ALL BOOKINGS
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# GET BOOKING BY BOOKING ID
# ---------------------------------------------------------

@router.get("/{booking_id}")
def get_booking(
    booking_id: str,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.booking_id == booking_id
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found.",
        )

    return booking_to_dict(booking)


# ---------------------------------------------------------
# GET BOOKING BY PNR
# ---------------------------------------------------------

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


# ---------------------------------------------------------
# CANCEL BOOKING
# ---------------------------------------------------------

@router.delete("/{booking_id}")
def cancel_booking(
    booking_id: str,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.booking_id == booking_id
        )
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

    train = booking.train

    booking.status = "Cancelled"

    train.available_seats = min(
        train.available_seats + seat_count,
        train.total_seats,
    )

    try:
        db.commit()
        db.refresh(booking)

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Unable to cancel booking.",
        ) from error

    return {
        "message": "Booking cancelled successfully.",
        "booking_id": booking.booking_id,
        "pnr": booking.pnr,
        "status": booking.status,
        "released_seats": seat_count,
    }
