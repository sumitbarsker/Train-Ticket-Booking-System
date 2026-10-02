import random
import string
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Train, Passenger, Booking


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


class BookingRequest(BaseModel):
    train_id: int
    journey_date: date
    seat: str

    passenger_name: str
    age: int
    gender: str
    mobile: str
    email: EmailStr


def generate_pnr():
    return "".join(
        random.choices(
            string.digits,
            k=10,
        )
    )


def generate_booking_id():
    return (
        "RC"
        + "".join(
            random.choices(
                string.ascii_uppercase + string.digits,
                k=8,
            )
        )
    )


@router.post("/")
def create_booking(
    booking_data: BookingRequest,
    db: Session = Depends(get_db),
):
    if booking_data.journey_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Journey date cannot be in the past.",
        )

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

    if train.seats <= 0:
        raise HTTPException(
            status_code=400,
            detail="No seats available on this train.",
        )

    existing_booking = (
        db.query(Booking)
        .filter(
            Booking.train_id
            == booking_data.train_id,

            Booking.journey_date
            == booking_data.journey_date,

            Booking.seat
            == booking_data.seat,

            Booking.status
            == "Confirmed",
        )
        .first()
    )

    if existing_booking:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Seat {booking_data.seat} "
                f"is already booked for "
                f"{booking_data.journey_date}."
            ),
        )

    passenger = Passenger(
        name=booking_data.passenger_name,
        age=booking_data.age,
        gender=booking_data.gender,
        mobile=booking_data.mobile,
        email=booking_data.email,
    )

    db.add(passenger)
    db.flush()

    pnr = generate_pnr()
    booking_id = generate_booking_id()

    booking = Booking(
        pnr=pnr,
        booking_id=booking_id,
        train_id=booking_data.train_id,
        passenger_id=passenger.id,
        journey_date=booking_data.journey_date,
        seat=booking_data.seat,
        status="Confirmed",
    )

    db.add(booking)

    train.seats -= 1

    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking confirmed successfully.",
        "booking": {
            "id": booking.id,
            "pnr": booking.pnr,
            "booking_id": booking.booking_id,
            "journey_date": booking.journey_date,
            "seat": booking.seat,
            "status": booking.status,
            "train": {
                "id": train.id,
                "name": train.name,
                "number": train.number,
            },
            "passenger": {
                "name": passenger.name,
                "age": passenger.age,
                "gender": passenger.gender,
                "mobile": passenger.mobile,
                "email": passenger.email,
            },
            "fare": train.price,
        },
    }


@router.get("/")
def get_bookings(
    db: Session = Depends(get_db),
):
    bookings = (
        db.query(Booking)
        .order_by(Booking.id.desc())
        .all()
    )

    return {
        "count": len(bookings),
        "bookings": [
            {
                "id": booking.id,
                "pnr": booking.pnr,
                "booking_id": booking.booking_id,
                "journey_date": booking.journey_date,
                "seat": booking.seat,
                "status": booking.status,
                "train": {
                    "id": booking.train.id,
                    "name": booking.train.name,
                    "number": booking.train.number,
                },
                "passenger": {
                    "name": booking.passenger.name,
                    "email": booking.passenger.email,
                },
            }
            for booking in bookings
        ],
    }


@router.get("/{pnr}")
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
            detail="Booking not found.",
        )

    return {
        "pnr": booking.pnr,
        "booking_id": booking.booking_id,
        "journey_date": booking.journey_date,
        "seat": booking.seat,
        "status": booking.status,
        "train": {
            "id": booking.train.id,
            "name": booking.train.name,
            "number": booking.train.number,
            "source": booking.train.source,
            "destination": booking.train.destination,
            "departure": booking.train.departure,
            "arrival": booking.train.arrival,
        },
        "passenger": {
            "name": booking.passenger.name,
            "age": booking.passenger.age,
            "gender": booking.passenger.gender,
            "mobile": booking.passenger.mobile,
            "email": booking.passenger.email,
        },
        "fare": booking.train.price,
    }
}
