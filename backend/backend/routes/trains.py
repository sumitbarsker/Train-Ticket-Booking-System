from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Train


router = APIRouter()


class TrainResponse(BaseModel):
    id: int
    number: str
    name: str
    type: str
    train_class: str
    source: str
    destination: str
    departure: str
    arrival: str
    duration: str
    price: float
    total_seats: int
    available_seats: int


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


@router.get("/")
def get_all_trains(db: Session = Depends(get_db)):
    trains = (
        db.query(Train)
        .order_by(Train.departure.asc())
        .all()
    )

    return {
        "count": len(trains),
        "trains": [train_to_dict(train) for train in trains],
    }


@router.get("/route/search")
def search_route(
    source: str,
    destination: str,
    db: Session = Depends(get_db),
):
    clean_source = source.strip()
    clean_destination = destination.strip()

    trains = (
        db.query(Train)
        .filter(
            Train.source.ilike(clean_source),
            Train.destination.ilike(clean_destination),
        )
        .order_by(Train.departure.asc())
        .all()
    )

    return {
        "source": clean_source,
        "destination": clean_destination,
        "count": len(trains),
        "trains": [train_to_dict(train) for train in trains],
    }


@router.get("/{train_id}/availability")
def get_train_availability(
    train_id: int,
    db: Session = Depends(get_db),
):
    train = db.query(Train).filter(Train.id == train_id).first()

    if not train:
        raise HTTPException(
            status_code=404,
            detail="Train not found",
        )

    booked_seats = train.total_seats - train.available_seats

    return {
        "train_id": train.id,
        "train_number": train.number,
        "train_name": train.name,
        "total_seats": train.total_seats,
        "available_seats": train.available_seats,
        "booked_seats": booked_seats,
        "availability_percentage": round(
            (train.available_seats / train.total_seats) * 100,
            2,
        ) if train.total_seats else 0,
    }


@router.get("/{train_id}")
def get_train(
    train_id: int,
    db: Session = Depends(get_db),
):
    train = db.query(Train).filter(Train.id == train_id).first()

    if not train:
        raise HTTPException(
            status_code=404,
            detail="Train not found",
        )

    return train_to_dict(train)
