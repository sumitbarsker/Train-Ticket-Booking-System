from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from datetime import datetime
import random

from backend.database import get_db
from backend.models import Train, Passenger, Booking


router = APIRouter(
    prefix="/bookings",
    tags=["Bookings"],
)


class BookingRequest(BaseModel):
    train_id: int
    seat: str
    passenger_name: str
    age: int
    gender: str
    mobile: str
    email: EmailStr


def generate_pnr():
    return str(random.randint(1000000000, 9999999999))


def generate_booking_id():
    return f"RC{random.randint(10000000, 99999999)}"


@router.post("/")
def create_booking(
    booking_data: BookingRequest,
    db: Session = Depends(get_db),
):
    train = (
        db.query(Train)
        .filter(Train.id == booking_data.train_id)
        .first()
    )

    if not train:
        raise HTTPException(
            status_code=404,
            detail="Train not found",
        )

    if train.seats <= 0:
        raise HTTPException(
            status_code=400,
            detail="No seats available",
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

    booking = Booking(
        pnr=generate_pnr(),
        booking_id=generate_booking_id(),
        train_id=train.id,
        passenger_id=passenger.id,
        seat=booking_data.seat,
        status="Confirmed",
        booked_at=datetime.utcnow(),
    )

    train.seats -= 1

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return {
        "message": "Booking confirmed successfully",
        "booking": {
            "pnr": booking.pnr,
            "booking_id": booking.booking_id,
            "train_id": booking.train_id,
            "train_name": train.name,
            "seat": booking.seat,
            "status": booking.status,
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
    bookings = db.query(Booking).all()

    return {
        "count": len(bookings),
        "bookings": [
            {
                "pnr": booking.pnr,
                "booking_id": booking.booking_id,
                "train": booking.train.name,
                "seat": booking.seat,
                "passenger": booking.passenger.name,
                "status": booking.status,
                "fare": booking.train.price,
            }
            for booking in bookings
        ],
    }


@router.get("/{pnr}")
def get_booking(
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
            detail="Booking not found",
        )

    return {
        "pnr": booking.pnr,
        "booking_id": booking.booking_id,
        "train": booking.train.name,
        "train_number": booking.train.number,
        "source": booking.train.source,
        "destination": booking.train.destination,
        "seat": booking.seat,
        "status": booking.status,
        "fare": booking.train.price,
        "passenger": {
            "name": booking.passenger.name,
            "age": booking.passenger.age,
            "gender": booking.passenger.gender,
            "mobile": booking.passenger.mobile,
            "email": booking.passenger.email,
        },
    }
