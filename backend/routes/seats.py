from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Booking, Train

router = APIRouter()


# ---------------------------------------------------------
# CLASS CONFIGURATION
# ---------------------------------------------------------

CLASS_CONFIG = {
    "SL": {
        "coach": "S1",
        "total_seats": 72,
        "columns": 6,
    },
    "3A": {
        "coach": "B1",
        "total_seats": 72,
        "columns": 6,
    },
    "2A": {
        "coach": "A1",
        "total_seats": 54,
        "columns": 4,
    },
    "CC": {
        "coach": "C1",
        "total_seats": 75,
        "columns": 5,
    },
}


# ---------------------------------------------------------
# REQUEST SCHEMAS
# ---------------------------------------------------------

class SeatCheckRequest(BaseModel):
    journey_date: str
    seat_class: str
    seats: List[str] = Field(..., min_length=1, max_length=6)


# ---------------------------------------------------------
# HELPERS
# ---------------------------------------------------------

def normalize_class(seat_class: str) -> str:
    value = seat_class.strip().upper()

    if value not in CLASS_CONFIG:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid seat class. "
                "Available classes: SL, 3A, 2A, CC."
            ),
        )

    return value


def generate_seats(seat_class: str):
    config = CLASS_CONFIG[seat_class]

    return [
        {
            "seat_number": str(number),
            "status": "available",
        }
        for number in range(1, config["total_seats"] + 1)
    ]


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

    booked = set()

    for booking in bookings:
        if not booking.seats:
            continue

        for seat in booking.seats.split(","):
            clean_seat = seat.strip()

            if clean_seat:
                booked.add(clean_seat)

    return booked


def validate_train(
    db: Session,
    train_id: int,
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

    return train


# ---------------------------------------------------------
# GET COMPLETE SEAT MAP
# ---------------------------------------------------------

@router.get("/{train_id}")
def get_seat_map(
    train_id: int,
    journey_date: str,
    seat_class: str = "3A",
    db: Session = Depends(get_db),
):
    train = validate_train(db, train_id)

    seat_class = normalize_class(seat_class)

    if not journey_date.strip():
        raise HTTPException(
            status_code=400,
            detail="Journey date is required.",
        )

    seats = generate_seats(seat_class)

    booked_seats = get_booked_seats(
        db,
        train_id,
        journey_date,
        seat_class,
    )

    for seat in seats:
        if seat["seat_number"] in booked_seats:
            seat["status"] = "booked"

    available_count = sum(
        1
        for seat in seats
        if seat["status"] == "available"
    )

    return {
        "train_id": train.id,
        "train_number": train.number,
        "train_name": train.name,
        "journey_date": journey_date,
        "seat_class": seat_class,
        "coach": CLASS_CONFIG[seat_class]["coach"],
        "total_seats": len(seats),
        "available_seats": available_count,
        "booked_seats": len(booked_seats),
        "seats": seats,
    }


# ---------------------------------------------------------
# CHECK SELECTED SEATS
# ---------------------------------------------------------

@router.post("/{train_id}/check")
def check_selected_seats(
    train_id: int,
    request: SeatCheckRequest,
    db: Session = Depends(get_db),
):
    train = validate_train(db, train_id)

    seat_class = normalize_class(request.seat_class)

    journey_date = request.journey_date.strip()

    if not journey_date:
        raise HTTPException(
            status_code=400,
            detail="Journey date is required.",
        )

    selected_seats = [
        str(seat).strip()
        for seat in request.seats
    ]

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

    max_seat = CLASS_CONFIG[seat_class]["total_seats"]

    invalid_seats = []

    for seat in selected_seats:
        try:
            seat_number = int(seat)

            if seat_number < 1 or seat_number > max_seat:
                invalid_seats.append(seat)

        except ValueError:
            invalid_seats.append(seat)

    if invalid_seats:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid seat numbers: "
                + ", ".join(invalid_seats)
            ),
        )

    booked_seats = get_booked_seats(
        db,
        train_id,
        journey_date,
        seat_class,
    )

    unavailable = [
        seat
        for seat in selected_seats
        if seat in booked_seats
    ]

    if unavailable:
        return {
            "available": False,
            "message": (
                "Some selected seats are already booked."
            ),
            "unavailable_seats": unavailable,
        }

    return {
        "available": True,
        "message": "All selected seats are available.",
        "train_id": train.id,
        "train_number": train.number,
        "journey_date": journey_date,
        "seat_class": seat_class,
        "seats": selected_seats,
    }


# ---------------------------------------------------------
# SEAT AVAILABILITY SUMMARY
# ---------------------------------------------------------

@router.get("/{train_id}/summary")
def get_seat_summary(
    train_id: int,
    journey_date: str,
    seat_class: str = "3A",
    db: Session = Depends(get_db),
):
    train = validate_train(db, train_id)

    seat_class = normalize_class(seat_class)

    total_seats = CLASS_CONFIG[seat_class]["total_seats"]

    booked_seats = get_booked_seats(
        db,
        train_id,
        journey_date,
        seat_class,
    )

    booked_count = len(booked_seats)

    available_count = max(
        total_seats - booked_count,
        0,
    )

    occupancy = (
        (booked_count / total_seats) * 100
        if total_seats
        else 0
    )

    return {
        "train_id": train.id,
        "train_number": train.number,
        "journey_date": journey_date,
        "seat_class": seat_class,
        "total_seats": total_seats,
        "booked_seats": booked_count,
        "available_seats": available_count,
        "occupancy_percentage": round(
            occupancy,
            2,
        ),
    }
