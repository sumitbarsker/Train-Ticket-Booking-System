from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Train, Booking


router = APIRouter(
    prefix="/seats",
    tags=["Seats"],
)


@router.get("/{train_id}")
def get_seats(
    train_id: int,
    db: Session = Depends(get_db),
):
    train = (
        db.query(Train)
        .filter(Train.id == train_id)
        .first()
    )

    if not train:
        raise HTTPException(
            status_code=404,
            detail="Train not found",
        )

    bookings = (
        db.query(Booking)
        .filter(
            Booking.train_id == train_id,
            Booking.status == "Confirmed",
        )
        .all()
    )

    booked_seats = [
        booking.seat
        for booking in bookings
    ]

    return {
        "train_id": train.id,
        "train_name": train.name,
        "available_seats": train.seats,
        "booked_seats": booked_seats,
    }
