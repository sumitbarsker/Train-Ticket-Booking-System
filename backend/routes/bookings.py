import random
import string
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Booking, Passenger, Train


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


# --------------------------------------------------
# REQUEST MODEL
# --------------------------------------------------

class BookingRequest(BaseModel):
    train_id: int
    journey_date: date
    seat: str

    passenger_name: str
    age: int
    gender: str
    mobile: str
    email: EmailStr


# --------------------------------------------------
# HELPERS
# --------------------------------------------------

def generate_pnr():
    return "PNR" + "".join(
        random.choices(
            string.digits,
            k=8,
        )
    )


def generate_booking_id():
    return "BK" + "".join(
        random.choices(
            string.ascii_uppercase + string.digits,
            k=10,
        )
    )


def generate_unique_pnr(db: Session):
    while True:
        pnr = generate_pnr()

        existing = (
            db.query(Booking)
            .filter(Booking.pnr == pnr)
            .first()
        )

        if not existing:
            return pnr


def generate_unique_booking_id(db: Session):
    while True:
        booking_id = generate_booking_id()

        existing = (
            db.query(Booking)
            .filter(
                Booking.booking_id == booking_id
            )
            .first()
        )

        if not existing:
            return booking_id


# --------------------------------------------------
# CREATE BOOKING
# --------------------------------------------------

@router.post("/")
def create_booking(
    booking_data: BookingRequest,
    db: Session = Depends(get_db),
):
    # Validate journey date
    if booking_data.journey_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Journey date cannot be in the past.",
        )

    # Find train
    train = (
        db.query(Train)
        .filter(
            Train.id == booking_data.train_id
        )
        .first()
    )

    if not train:
        raise HTTPException(
            status_code=404,
            detail="Train not found.",
        )

    # Validate passenger age
    if booking_data.age < 1 or booking_data.age > 120:
        raise HTTPException(
            status_code=400,
            detail="Passenger age must be between 1 and 120.",
        )

    # Validate mobile number
    if (
        not booking_data.mobile.isdigit()
        or len(booking_data.mobile) != 10
    ):
        raise HTTPException(
            status_code=400,
            detail="Mobile number must contain exactly 10 digits.",
        )

    # Validate seat format
    seat = booking_data.seat.strip().upper()

    if len(seat) < 2:
        raise HTTPException(
            status_code=400,
            detail="Invalid seat number.",
        )

    seat_number = seat[1:]

    if (
        seat[0] not in ["A", "B", "C", "D"]
        or not seat_number.isdigit()
        or int(seat_number) < 1
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid seat number.",
        )

    seat_number = int(seat_number)

    # 4 seats per row
    row_number = seat_number

    if row_number > (
        (train.total_seats + 3) // 4
    ):
        raise HTTPException(
            status_code=400,
            detail="Selected seat does not exist for this train.",
        )

    # Check duplicate confirmed booking
    existing_booking = (
        db.query(Booking)
        .filter(
            Booking.train_id == booking_data.train_id,
            Booking.journey_date
            == booking_data.journey_date,
            Booking.seat == seat,
            Booking.status == "Confirmed",
        )
        .first()
    )

    if existing_booking:
        raise HTTPException(
            status_code=409,
            detail="This seat is already booked.",
        )

    # Count confirmed bookings for journey date
    confirmed_bookings = (
        db.query(Booking)
        .filter(
            Booking.train_id == booking_data.train_id,
            Booking.journey_date
            == booking_data.journey_date,
            Booking.status == "Confirmed",
        )
        .count()
    )

    if confirmed_bookings >= train.total_seats:
        raise HTTPException(
            status_code=400,
            detail="No seats available for this journey date.",
        )

    # Create passenger
    passenger = Passenger(
        name=booking_data.passenger_name.strip(),
        age=booking_data.age,
        gender=booking_data.gender,
        mobile=booking_data.mobile,
        email=str(booking_data.email),
    )

    db.add(passenger)
    db.flush()

    # Generate unique booking identifiers
    pnr = generate_unique_pnr(db)
    booking_id = generate_unique_booking_id(db)

    # Create booking
    booking = Booking(
        pnr=pnr,
        booking_id=booking_id,
        train_id=train.id,
        passenger_id=passenger.id,
        journey_date=booking_data.journey_date,
        seat=seat,
        status="Confirmed",
    )

    db.add(booking)

    db.commit()

    db.refresh(booking)
    db.refresh(passenger)
    db.refresh(train)

    return {
        "message": "Booking confirmed successfully.",
        "pnr": booking.pnr,
        "booking_id": booking.booking_id,
        "journey_date": booking.journey_date,
        "seat": booking.seat,
        "status": booking.status,
        "fare": train.price,
        "train": {
            "id": train.id,
            "name": train.name,
            "number": train.number,
            "source": train.source,
            "destination": train.destination,
            "departure": train.departure,
            "arrival": train.arrival,
            "duration": train.duration,
            "price": train.price,
            "class": train.train_class,
            "type": train.train_type,
        },
        "passenger": {
            "id": passenger.id,
            "name": passenger.name,
            "age": passenger.age,
            "gender": passenger.gender,
            "mobile": passenger.mobile,
            "email": passenger.email,
        },
    }


# --------------------------------------------------
# GET ALL BOOKINGS
# --------------------------------------------------

@router.get("/")
def get_all_bookings(
    db: Session = Depends(get_db),
):
    bookings = (
        db.query(Booking)
        .order_by(
            Booking.booked_at.desc()
        )
        .all()
    )

    result = []

    for booking in bookings:
        result.append(
            {
                "pnr": booking.pnr,
                "booking_id": booking.booking_id,
                "journey_date": booking.journey_date,
                "seat": booking.seat,
                "status": booking.status,
                "booked_at": booking.booked_at,
                "fare": booking.train.price,
                "train": {
                    "id": booking.train.id,
                    "name": booking.train.name,
                    "number": booking.train.number,
                    "source": booking.train.source,
                    "destination": booking.train.destination,
                    "departure": booking.train.departure,
                    "arrival": booking.train.arrival,
                    "duration": booking.train.duration,
                    "price": booking.train.price,
                    "class": booking.train.train_class,
                    "type": booking.train.train_type,
                },
                "passenger": {
                    "id": booking.passenger.id,
                    "name": booking.passenger.name,
                    "age": booking.passenger.age,
                    "gender": booking.passenger.gender,
                    "mobile": booking.passenger.mobile,
                    "email": booking.passenger.email,
                },
            }
        )

    return result


# --------------------------------------------------
# GET BOOKING BY PNR
# --------------------------------------------------

@router.get("/{pnr}")
def get_booking(
    pnr: str,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.pnr == pnr.strip().upper()
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found.",
        )

    return {
        "pnr": booking.pnr,
        "booking_id": booking.booking_id,
        "journey_date": booking.journey_date,
        "seat": booking.seat,
        "status": booking.status,
        "booked_at": booking.booked_at,
        "fare": booking.train.price,
        "train": {
            "id": booking.train.id,
            "name": booking.train.name,
            "number": booking.train.number,
            "source": booking.train.source,
            "destination": booking.train.destination,
            "departure": booking.train.departure,
            "arrival": booking.train.arrival,
            "duration": booking.train.duration,
            "price": booking.train.price,
            "class": booking.train.train_class,
            "type": booking.train.train_type,
        },
        "passenger": {
            "id": booking.passenger.id,
            "name": booking.passenger.name,
            "age": booking.passenger.age,
            "gender": booking.passenger.gender,
            "mobile": booking.passenger.mobile,
            "email": booking.passenger.email,
        },
    }


# --------------------------------------------------
# CANCEL BOOKING
# --------------------------------------------------

@router.patch("/{pnr}/cancel")
def cancel_booking(
    pnr: str,
    db: Session = Depends(get_db),
):
    booking = (
        db.query(Booking)
        .filter(
            Booking.pnr == pnr.strip().upper()
        )
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found.",
        )

    if booking.status != "Confirmed":
        raise HTTPException(
            status_code=400,
            detail="Only confirmed bookings can be cancelled.",
        )

    if booking.journey_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Past journey tickets cannot be cancelled.",
        )

    booking.status = "Cancelled"

    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking cancelled successfully.",
        "pnr": booking.pnr,
        "booking_id": booking.booking_id,
        "journey_date": booking.journey_date,
        "seat": booking.seat,
        "status": booking.status,
    }
