from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, Train


router = APIRouter()


# --------------------------------------------------
# Seat configuration
# --------------------------------------------------

CLASS_CONFIG = {
    "SL": {
        "rows": 18,
        "seats_per_row": 4,
        "seat_labels": ["L", "M", "U", "SU"],
    },
    "3A": {
        "rows": 18,
        "seats_per_row": 4,
        "seat_labels": ["L", "M", "U", "SU"],
    },
    "2A": {
        "rows": 13,
        "seats_per_row": 4,
        "seat_labels": ["L", "U", "SL", "SU"],
    },
    "CC": {
        "rows": 20,
        "seats_per_row": 4,
        "seat_labels": ["W", "M", "A", "W"],
    },
}


# --------------------------------------------------
# Helpers
# --------------------------------------------------

def generate_seats(seat_class: str):
    config = CLASS_CONFIG.get(
        seat_class.upper(),
        CLASS_CONFIG["3A"],
    )

    seats = []

    for row in range(
        1,
        config["rows"] + 1,
    ):
        for index, label in enumerate(
            config["seat_labels"]
        ):
            seats.append(
                {
                    "seat": f"{row}{chr(65 + index)}",
                    "berth": label,
                    "status": "available",
                }
            )

    return seats


def get_booked_seats(
    train_id: int,
    journey_date: str,
    seat_class: str,
    db: Session,
):
    bookings = (
        db.query(Booking)
        .filter(
            Booking.train_id == train_id,
            Booking.journey_date == journey_date,
            Booking.seat_class == seat_class,
            Booking.status == "Confirmed",
        )
        .all()
    )

    booked_seats = set()

    for booking in bookings:
        for seat in booking.seats.split(","):
            seat = seat.strip()

            if seat:
                booked_seats.add(seat)

    return booked_seats


# --------------------------------------------------
# Get seat map
# --------------------------------------------------

@router.get("/{train_id}")
def get_seat_map(
    train_id: int,
    journey_date: str,
    seat_class: str = "3A",
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

    seat_class = seat_class.upper()

    if seat_class not in CLASS_CONFIG:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid class. "
                "Use SL, 3A, 2A or CC."
            ),
        )

    seats = generate_seats(seat_class)

    booked_seats = get_booked_seats(
        train_id=train_id,
        journey_date=journey_date,
        seat_class=seat_class,
        db=db,
    )

    for seat in seats:
        if seat["seat"] in booked_seats:
            seat["status"] = "booked"

    available_count = sum(
        1
        for seat in seats
        if seat["status"] == "available"
    )

    booked_count = len(
        seats
    ) - available_count

    return {
        "train_id": train.id,
        "train_number": train.number,
        "train_name": train.name,
        "journey_date": journey_date,
        "class": seat_class,
        "total_seats": len(seats),
        "available_seats": available_count,
        "booked_seats": booked_count,
        "seats": seats,
    }


# --------------------------------------------------
# Check selected seats
# --------------------------------------------------

@router.post("/{train_id}/check")
def check_seats(
    train_id: int,
    journey_date: str,
    seat_class: str,
    seats: list[str],
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

    seat_class = seat_class.upper()

    if seat_class not in CLASS_CONFIG:
        raise HTTPException(
            status_code=400,
            detail="Invalid seat class",
        )

    if not seats:
        raise HTTPException(
            status_code=400,
            detail="No seats selected",
        )

    if len(seats) > 6:
        raise HTTPException(
            status_code=400,
            detail="Maximum 6 seats can be selected",
        )

    booked_seats = get_booked_seats(
        train_id=train_id,
        journey_date=journey_date,
        seat_class=seat_class,
        db=db,
    )

    requested_seats = set(seats)

    already_booked = (
        requested_seats
        & booked_seats
    )

    if already_booked:
        return {
            "available": False,
            "message": "Some selected seats are already booked",
            "booked_seats": sorted(
                already_booked
            ),
        }

    return {
        "available": True,
        "message": "All selected seats are available",
        "selected_seats": sorted(
            requested_seats
        ),
    }


# --------------------------------------------------
# Train availability summary
# --------------------------------------------------

@router.get("/{train_id}/summary")
def seat_summary(
    train_id: int,
    journey_date: str,
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

    confirmed_bookings = (
        db.query(Booking)
        .filter(
            Booking.train_id == train_id,
            Booking.journey_date == journey_date,
            Booking.status == "Confirmed",
        )
        .all()
    )

    booked_count = 0

    for booking in confirmed_bookings:
        booked_count += len(
            booking.seats.split(",")
        )

    return {
        "train_id": train.id,
        "train_number": train.number,
        "journey_date": journey_date,
        "total_seats": train.total_seats,
        "booked_seats": booked_count,
        "available_seats": max(
            0,
            train.total_seats - booked_count,
        ),
    }
