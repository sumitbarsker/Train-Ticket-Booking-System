from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Train


router = APIRouter()


# ============================================================
# Schemas
# ============================================================

class TrainCreate(BaseModel):
    number: str = Field(..., min_length=1, max_length=20)
    name: str = Field(..., min_length=2, max_length=150)
    train_type: str = Field(..., min_length=2, max_length=50)
    source: str = Field(..., min_length=2, max_length=100)
    destination: str = Field(..., min_length=2, max_length=100)
    departure: str = Field(..., min_length=4, max_length=10)
    arrival: str = Field(..., min_length=4, max_length=10)
    duration: str = Field(..., min_length=2, max_length=30)
    train_class: str = Field(
        default="3A",
        min_length=2,
        max_length=20,
    )
    price: float = Field(..., ge=0)
    total_seats: int = Field(default=72, ge=1, le=1000)
    available_seats: int | None = Field(
        default=None,
        ge=0,
    )


class AvailabilityUpdate(BaseModel):
    available_seats: int = Field(..., ge=0)


# ============================================================
# Utility
# ============================================================

def train_to_dict(train: Train):
    return {
        "id": train.id,
        "number": train.number,
        "name": train.name,
        "type": train.train_type,
        "class": train.train_class,
        "source": train.source,
        "destination": train.destination,
        "departure": train.departure,
        "arrival": train.arrival,
        "duration": train.duration,
        "price": train.price,
        "total_seats": train.total_seats,
        "available_seats": train.available_seats,
    }


# ============================================================
# Database Statistics
# ============================================================

@router.get("/stats")
def get_train_database_stats(
    db: Session = Depends(get_db),
):
    total_trains = db.query(Train).count()

    total_seats = sum(
        train.total_seats
        for train in db.query(Train).all()
    )

    available_seats = sum(
        train.available_seats
        for train in db.query(Train).all()
    )

    booked_seats = total_seats - available_seats

    return {
        "total_trains": total_trains,
        "total_seats": total_seats,
        "available_seats": available_seats,
        "booked_seats": booked_seats,
        "occupancy_percentage": round(
            (booked_seats / total_seats) * 100,
            2,
        ) if total_seats else 0,
    }


# ============================================================
# Add New Train
# ============================================================

@router.post("/")
def add_train(
    request: TrainCreate,
    db: Session = Depends(get_db),
):
    number = request.number.strip()
    source = request.source.strip()
    destination = request.destination.strip()

    if source.lower() == destination.lower():
        raise HTTPException(
            status_code=400,
            detail="Source and destination cannot be the same.",
        )

    existing_train = (
        db.query(Train)
        .filter(Train.number == number)
        .first()
    )

    if existing_train:
        raise HTTPException(
            status_code=409,
            detail="A train with this number already exists.",
        )

    available_seats = (
        request.total_seats
        if request.available_seats is None
        else request.available_seats
    )

    if available_seats > request.total_seats:
        raise HTTPException(
            status_code=400,
            detail="Available seats cannot exceed total seats.",
        )

    train = Train(
        number=number,
        name=request.name.strip(),
        train_type=request.train_type.strip(),
        source=source,
        destination=destination,
        departure=request.departure.strip(),
        arrival=request.arrival.strip(),
        duration=request.duration.strip(),
        train_class=request.train_class.strip().upper(),
        price=request.price,
        total_seats=request.total_seats,
        available_seats=available_seats,
    )

    db.add(train)
    db.commit()
    db.refresh(train)

    return {
        "message": "Train added successfully.",
        "train": train_to_dict(train),
    }


# ============================================================
# Update Train Availability
# ============================================================

@router.patch("/{train_id}/availability")
def update_train_availability(
    train_id: int,
    request: AvailabilityUpdate,
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

    if request.available_seats > train.total_seats:
        raise HTTPException(
            status_code=400,
            detail="Available seats cannot exceed total seats.",
        )

    train.available_seats = request.available_seats

    db.commit()
    db.refresh(train)

    return {
        "message": "Train availability updated successfully.",
        "train": train_to_dict(train),
    }


# ============================================================
# Delete Train
# ============================================================

@router.delete("/{train_id}")
def delete_train(
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
            detail="Train not found.",
        )

    if train.bookings:
        raise HTTPException(
            status_code=409,
            detail=(
                "This train cannot be deleted because "
                "booking records already exist."
            ),
        )

    train_number = train.number
    train_name = train.name

    db.delete(train)
    db.commit()

    return {
        "message": "Train deleted successfully.",
        "train_number": train_number,
        "train_name": train_name,
    }
