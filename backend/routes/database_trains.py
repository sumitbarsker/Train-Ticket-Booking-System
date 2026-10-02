from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Train


router = APIRouter(
    prefix="/database/trains",
    tags=["Database Trains"],
)


@router.get("/")
def get_database_trains(
    db: Session = Depends(get_db),
):
    trains = db.query(Train).all()

    return {
        "count": len(trains),
        "trains": [
            {
                "id": train.id,
                "name": train.name,
                "number": train.number,
                "source": train.source,
                "destination": train.destination,
                "departure": train.departure,
                "arrival": train.arrival,
                "duration": train.duration,
                "price": train.price,
                "seats": train.seats,
                "class": train.train_class,
                "type": train.train_type,
            }
            for train in trains
        ],
    }


@router.get("/{train_id}")
def get_database_train(
    train_id: int,
    db: Session = Depends(get_db),
):
    train = (
        db.query(Train)
        .filter(Train.id == train_id)
        .first()
    )

    if not train:
        return {
            "error": "Train not found"
        }

    return {
        "id": train.id,
        "name": train.name,
        "number": train.number,
        "source": train.source,
        "destination": train.destination,
        "departure": train.departure,
        "arrival": train.arrival,
        "duration": train.duration,
        "price": train.price,
        "seats": train.seats,
        "class": train.train_class,
        "type": train.train_type,
    }
