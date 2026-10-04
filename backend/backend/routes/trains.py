from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Train


router = APIRouter()


# --------------------------------------------------
# Response schema
# --------------------------------------------------

class TrainResponse(BaseModel):
    id: int
    number: str
    name: str
    type: str
    class_name: str
    source: str
    destination: str
    departure: str
    arrival: str
    duration: str
    price: float
    total_seats: int
    available_seats: int

    class Config:
        from_attributes = True


# --------------------------------------------------
# Get all trains
# --------------------------------------------------

@router.get("/")
def get_all_trains(
    db: Session = Depends(get_db),
):
    trains = (
        db.query(Train)
        .order_by(Train.id.asc())
        .all()
    )

    return {
        "count": len(trains),
        "trains": [
            {
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
            for train in trains
        ],
    }


# --------------------------------------------------
# Get train by ID
# --------------------------------------------------

@router.get("/{train_id}")
def get_train(
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
# Search trains by route
# --------------------------------------------------

@router.get("/route/search")
def search_trains_by_route(
    source: str,
    destination: str,
    db: Session = Depends(get_db),
):
    trains = (
        db.query(Train)
        .filter(
            Train.source.ilike(source),
            Train.destination.ilike(destination),
        )
        .order_by(Train.departure.asc())
        .all()
    )

    return {
        "source": source,
        "destination": destination,
        "count": len(trains),
        "trains": [
            {
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
            for train in trains
        ],
    }


# --------------------------------------------------
# Get available seats
# --------------------------------------------------

@router.get("/{train_id}/availability")
def get_train_availability(
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

    return {
        "train_id": train.id,
        "train_number": train.number,
        "train_name": train.name,
        "total_seats": train.total_seats,
        "available_seats": train.available_seats,
        "booked_seats": (
            train.total_seats
            - train.available_seats
        ),
    }
