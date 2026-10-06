from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Train


router = APIRouter()


# --------------------------------------------------
# Request Schema
# --------------------------------------------------

class TrainCreate(BaseModel):
    number: str = Field(..., min_length=1)
    name: str = Field(..., min_length=2)
    train_type: str = "Express"

    source: str = Field(..., min_length=2)
    destination: str = Field(..., min_length=2)

    departure: str
    arrival: str
    duration: str

    train_class: str = "3A"

    price: float = Field(
        ...,
        gt=0,
    )

    total_seats: int = Field(
        ...,
        gt=0,
    )

    available_seats: int | None = None


# --------------------------------------------------
# Helper
# --------------------------------------------------

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


# --------------------------------------------------
# Database statistics
# --------------------------------------------------

@router.get("/stats")
def get_database_stats(
    db: Session = Depends(get_db),
):
    total_trains = (
        db.query(Train).count()
    )

    total_seats = sum(
        train.total_seats
        for train in db.query(Train).all()
    )

    available_seats = sum(
        train.available_seats
        for train in db.query(Train).all()
    )

    return {
        "total_trains": total_trains,
        "total_seats": total_seats,
        "available_seats": available_seats,
        "booked_seats": (
            total_seats
            - available_seats
        ),
    }


# --------------------------------------------------
# Add Train
# --------------------------------------------------

@router.post("/")
def add_train(
    train_data: TrainCreate,
    db: Session = Depends(get_db),
):
    existing_train = (
        db.query(Train)
        .filter(
            Train.number
            == train_data.number
        )
        .first()
    )

    if existing_train:
        raise HTTPException(
            status_code=409,
            detail=(
                "A train with this "
                "number already exists"
            ),
        )

    available_seats = (
        train_data.available_seats
        if train_data.available_seats
        is not None
        else train_data.total_seats
    )

    if (
        available_seats
        > train_data.total_seats
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Available seats cannot "
                "exceed total seats"
            ),
        )

    train = Train(
        number=train_data.number.strip(),
        name=train_data.name.strip(),
        train_type=train_data.train_type.strip(),
        source=train_data.source.strip(),
        destination=train_data.destination.strip(),
        departure=train_data.departure.strip(),
        arrival=train_data.arrival.strip(),
        duration=train_data.duration.strip(),
        train_class=train_data.train_class.strip(),
        price=train_data.price,
        total_seats=train_data.total_seats,
        available_seats=available_seats,
    )

    db.add(train)
    db.commit()
    db.refresh(train)

    return {
        "message": "Train added successfully",
        "train": train_to_dict(train),
    }


# --------------------------------------------------
# Update Train Availability
# --------------------------------------------------

@router.patch("/{train_id}/availability")
def update_availability(
    train_id: int,
    available_seats: int,
    db: Session = Depends(get_db),
):
    train = (
        db.query(Train)
        .filter(
            Train.id == train_id
        )
        .first()
    )

    if not train:
        raise HTTPException(
            status_code=404,
            detail="Train not found",
        )

    if (
        available_seats < 0
        or available_seats
        > train.total_seats
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid available seat count"
            ),
        )

    train.available_seats = (
        available_seats
    )

    db.commit()
    db.refresh(train)

    return {
        "message": (
            "Train availability updated"
        ),
        "train": train_to_dict(train),
    }


# --------------------------------------------------
# Delete Train
# --------------------------------------------------

@router.delete("/{train_id}")
def delete_train(
    train_id: int,
    db: Session = Depends(get_db),
):
    train = (
        db.query(Train)
        .filter(
            Train.id == train_id
        )
        .first()
    )

    if not train:
        raise HTTPException(
            status_code=404,
            detail="Train not found",
        )

    db.delete(train)
    db.commit()

    return {
        "message": "Train deleted successfully",
        "train_id": train_id,
    }
