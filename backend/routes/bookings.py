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
# ID GENERATORS
# --------------------------------------------------

def generate_pnr():
    return "PNR" + "".join(
        random.choices(
            string.digits,
            k=10,
        )
    )


def generate_booking_id():
    return "BK" + "".join(
        random.choices(
            string.ascii_uppercase + string.digits,
            k=10,
        )
    )


# --------------------------------------------------
# CREATE BOOKING
# --------------------------------------------------

@router.post("/")
def create_booking(
    booking_data: BookingRequest,
    db: Session = Depends(get_db),
):
    # ----------------------------------------------
    # Validate journey date
    # ----------------------------------------------

    if booking_data.journey_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Journey date cannot be in the past.",
        )

    # ----------------------------------------------
    # Find train
    # ----------------------------------------------

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

    # ----------------------------------------------
    # Validate passenger age
    # ----------------------------------------------

    if booking_data.age < 1 or booking_data.age > 120:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid passenger age.",
        )

    # ----------------------------------------------
    # Validate mobile number
    # ----------------------------------------------

    if (
        not booking_data.mobile.isdigit()
        or len(booking_data.mobile) != 10
    ):
        raise HTTPException(
            status_code=400,
            detail="Mobile number must contain exactly 10 digits.",
        )

    # ----------------------------------------------
    # Check duplicate seat booking
    # ----------------------------------------------

    existing_booking = (
        db.query(Booking)
        .filter(
            Booking.train_id == booking_data.train_id,
            Booking.journey_date
            == booking_data.journey_date,
            Booking.seat == booking_data.seat,
            Booking.status == "Confirmed",
        )
        .first()
    )

    if existing_booking:
        raise HTTPException(
            status_code=409,
            detail="This seat is already booked for the selected journey date.",
        )

    # ----------------------------------------------
    # Count booked seats for this journey date
    # ----------------------------------------------

    booked_seats_count = (
        db.query(Booking)
        .filter(
            Booking.train_id == booking_data.train_id,
            Booking.journey_date
            == booking_data.journey_date,
            Booking.status == "Confirmed",
        )
        .count()
    )

    # ----------------------------------------------
    # Check train capacity
    # ----------------------------------------------

    if booked_seats_count >= train.total_seats:
        raise HTTPException(
            status_code=409,
            detail="No seats are available for this journey.",
        )

    # ----------------------------------------------
    # Create passenger
    # ----------------------------------------------

    passenger = Passenger(
        name=booking_data.passenger_name.strip(),
        age=booking_data.age,
        gender=booking_data.gender,
        mobile=booking_data.mobile,
        email=booking_data.email,
    )

    db.add(passenger)
    db.flush()

    # ----------------------------------------------
    # Generate unique booking identifiers
    # ----------------------------------------------

    pnr = generate_pnr()
    booking_id = generate_booking_id()

    while (
        db.query(Booking)
        .filter(Booking.pnr == pnr)
        .first()
    ):
        pnr = generate_pnr()

    while (
        db.query(Booking)
        .filter(Booking.booking_id == booking_id)
        .first()
    ):
        booking_id = generate_booking_id()

    # ----------------------------------------------
    # Create booking
    # ----------------------------------------------

    booking = Booking(
        pnr=pnr,
        booking_id=booking_id,
        train_id=train.id,
        passenger_id=passenger.id,
        journey_date=booking_data.journey_date,
        seat=booking_data.seat,
        status="Confirmed",
    )

    db.add(booking)

    # IMPORTANT:
    # Do NOT decrease train.seats here.
    #
    # Seat availability is now calculated separately
    # for every journey date using Booking records.

    db.commit()
    db.refresh(booking)

    # ----------------------------------------------
    # Response
    # ----------------------------------------------

    return {
        "message": "Ticket booked successfully.",
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
            "class": train.train_class,
        },
        "passenger": {
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
def get_bookings(
    db: Session = Depends(get_db),
):
    bookings = (
        db.query(Booking)
        .order_by(
            Booking.booked_at.desc()
        )
        .all()
    )

    return [
        {
            "pnr": booking.pnr,
            "booking_id": booking.booking_id,
            "journey_date": booking.journey_date,
            "seat": booking.seat,
            "status": booking.status,
            "booked_at": booking.booked_at,
            "train": {
                "id": booking.train.id,
                "name": booking.train.name,
                "number": booking.train.number,
                "source": booking.train.source,
                "destination": booking.train.destination,
                "departure": booking.train.departure,
                "arrival": booking.train.arrival,
                "class": booking.train.train_class,
            },
            "passenger": {
                "name": booking.passenger.name,
                "age": booking.passenger.age,
                "gender": booking.passenger.gender,
                "mobile": booking.passenger.mobile,
                "email": booking.passenger.email,
            },
        }
        for booking in bookings
    ]


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
            "class": booking.train.train_class,
        },
        "passenger": {
            "name": booking.passenger.name,
            "age": booking.passenger.age,
            "gender": booking.passenger.gender,
            "mobile": booking.passenger.mobile,
            "email": booking.passenger.email,
        },
    }
