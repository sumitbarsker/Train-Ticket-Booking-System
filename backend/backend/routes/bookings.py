from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
import random


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
    email: str


bookings = []


def generate_pnr():
    return str(random.randint(1000000000, 9999999999))


@router.post("/")
def create_booking(booking: BookingRequest):
    pnr = generate_pnr()

    new_booking = {
        "pnr": pnr,
        "booking_id": f"RC{random.randint(10000000, 99999999)}",
        "train_id": booking.train_id,
        "seat": booking.seat,
        "passenger": {
            "name": booking.passenger_name,
            "age": booking.age,
            "gender": booking.gender,
            "mobile": booking.mobile,
            "email": booking.email,
        },
        "status": "Confirmed",
        "booked_at": datetime.now().isoformat(),
    }

    bookings.append(new_booking)

    return {
        "message": "Booking confirmed successfully",
        "booking": new_booking,
    }


@router.get("/")
def get_bookings():
    return {
        "count": len(bookings),
        "bookings": bookings,
    }


@router.get("/{pnr}")
def get_booking(pnr: str):
    for booking in bookings:
        if booking["pnr"] == pnr:
            return booking

    raise HTTPException(
        status_code=404,
        detail="Booking not found",
    )
