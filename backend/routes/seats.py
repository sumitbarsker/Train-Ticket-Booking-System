from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, Train


router = APIRouter()


# ============================================================
# Seat Configuration
# ============================================================

CLASS_CONFIG = {
    "SL": {
        "name": "Sleeper",
        "rows": 18,
        "seats_per_row": 8,
        "price_multiplier": 1.0,
    },
    "3A": {
        "name": "AC 3 Tier",
        "rows": 18,
        "seats_per_row": 6,
        "price_multiplier": 1.65,
    },
    "2A": {
        "name": "AC 2 Tier",
        "rows": 18,
        "seats_per_row": 4,
        "price_multiplier": 2.2,
    },
    "CC": {
        "name": "Chair Car",
        "rows": 18,
        "seats_per_row": 5,
        "price_multiplier": 1.35,
    },
}


class SeatCheckRequest(BaseModel):
    seats: list[str] = Field(..., min_length=1, max_length=6)
    journey_date: str
    seat_class: str


# ============================================================
# Seat Generation
# ============================================================

def generate_seats(seat_class: str):
    config = CLASS_CONFIG.get(seat_class)

    if not config:
        return []

    seats = []

    for row in range(1, config["rows"] + 1):
        for position in range(1, config["seats_per_row"] + 1):
            seats.append(f"{row}{chr(64 + position)}")

    return seats


def get_booked_seats(
    db: Session,
    train_id: int,
    journey_date: str,
    seat_class: str,
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
            clean_seat = seat.strip().upper()

            if clean_seat:
                booked_seats.add(clean_seat)

    return booked_seats


# ============================================================
# Get Complete Seat Map
# ============================================================

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
            detail="Train not found.",
        )

    seat_class = seat_class.strip().upper()

    if seat_class not in CLASS_CONFIG:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported seat class. "
                f"Available classes: {', '.join(CLASS_CONFIG.keys())}"
            ),
        )

    if not journey_date.strip():
        raise HTTPException(
            status_code=400,
            detail="Journey date is required.",
        )

    all_seats = generate_seats(seat_class)

    booked_seats = get_booked_seats(
        db,
        train_id,
        journey_date.strip(),
        seat_class,
    )

    seat_map = []

    for seat in all_seats:
        seat_map.append(
            {
                "seat": seat,
                "status": (
                    "booked"
                    if seat in booked_seats
                    else "available"
                ),
            }
        )

    available_count = len(all_seats) - len(booked_seats)

    return {
        "train_id": train.id,
        "train_number": train.number,
        "train_name": train.name,
        "journey_date": journey_date.strip(),
        "seat_class": seat_class,
        "class_name": CLASS_CONFIG[seat_class]["name"],
        "total_seats": len(all_seats),
        "available_seats": available_count,
        "booked_seats": len(booked_seats),
        "seats": seat_map,
    }


# ============================================================
# Check Selected Seats
# ============================================================

@router.post("/{train_id}/check")
def check_selected_seats(
    train_id: int,
    request: SeatCheckRequest,
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
            detail="Train not found.",
        )

    seat_class = request.seat_class.strip().upper()
    journey_date = request.journey_date.strip()

    if seat_class not in CLASS_CONFIG:
        raise HTTPException(
            status_code=400,
            detail="Invalid seat class.",
        )

    if not journey_date:
        raise HTTPException(
            status_code=400,
            detail="Journey date is required.",
        )

    selected_seats = [
        seat.strip().upper()
        for seat in request.seats
        if seat.strip()
    ]

    if not selected_seats:
        raise HTTPException(
            status_code=400,
            detail="Please select at least one seat.",
        )

    if len(selected_seats) > 6:
        raise HTTPException(
            status_code=400,
            detail="Maximum 6 seats can be selected.",
        )

    if len(selected_seats) != len(set(selected_seats)):
        raise HTTPException(
            status_code=400,
            detail="Duplicate seats are not allowed.",
        )

    valid_seats = set(generate_seats(seat_class))

    invalid_seats = [
        seat
        for seat in selected_seats
        if seat not in valid_seats
    ]

    if invalid_seats:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Invalid seat number.",
                "invalid_seats": invalid_seats,
            },
        )

    booked_seats = get_booked_seats(
        db,
        train_id,
        journey_date,
        seat_class,
    )

    already_booked = [
        seat
        for seat in selected_seats
        if seat in booked_seats
    ]

    if already_booked:
        return {
            "available": False,
            "message": "One or more selected seats are already booked.",
            "booked_seats": already_booked,
        }

    return {
        "available": True,
        "message": "All selected seats are available.",
        "seats": selected_seats,
        "count": len(selected_seats),
    }


# ============================================================
# Seat Availability Summary
# ============================================================

@router.get("/{train_id}/summary")
def get_seat_summary(
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
            detail="Train not found.",
        )

    seat_class = seat_class.strip().upper()

    if seat_class not in CLASS_CONFIG:
        raise HTTPException(
            status_code=400,
            detail="Invalid seat class.",
        )

    all_seats = generate_seats(seat_class)

    booked_seats = get_booked_seats(
        db,
        train_id,
        journey_date.strip(),
        seat_class,
    )

    available_count = len(all_seats) - len(booked_seats)

    return {
        "train_id": train.id,
        "train_number": train.number,
        "journey_date": journey_date.strip(),
        "seat_class": seat_class,
        "total_seats": len(all_seats),
        "available_seats": available_count,
        "booked_seats": len(booked_seats),
        "occupancy_percentage": round(
            (len(booked_seats) / len(all_seats)) * 100,
            2,
        ) if all_seats else 0,
    }
