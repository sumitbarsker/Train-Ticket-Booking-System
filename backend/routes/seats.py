from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Train, Booking


router = APIRouter(
    prefix="/seats",
    tags=["Seats"],
)


# Demo seat capacity for each train.
# Later this can be moved into the database.
DEFAULT_SEAT_CAPACITY = 60


@router.get("/{train_id}")
def get_seats(
    train_id: int,
    journey_date: date = Query(...),
    db: Session = Depends(get_db),
):
    if journey_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Journey date cannot be in the past.",
        )

    train = (
        db.query(Train)
        .filter(Train.id == train_id)
        .first()
    )

    if not train:
        raise HTTPException(
            status_code=404,
            detail="Train not found.",
        )

    bookings = (
        db.query(Booking)
        .filter(
            Booking.train_id == train_id,
            Booking.journey_date == journey_date,
            Booking.status == "Confirmed",
        )
        .all()
    )

    booked_seats = [
        booking.seat
        for booking in bookings
    ]

    available_seats = max(
        DEFAULT_SEAT_CAPACITY - len(booked_seats),
        0,
    )

    return {
        "train_id": train.id,
        "train_name": train.name,
        "journey_date": journey_date,
        "total_seats": DEFAULT_SEAT_CAPACITY,
        "available_seats": available_seats,
        "booked_seats": booked_seats,
    }
