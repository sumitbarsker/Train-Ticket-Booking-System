from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Train

router = APIRouter(
    prefix="/search",
    tags=["Train Search"],
)


@router.get("/trains")
def search_trains(
    source: str = Query(..., min_length=2),
    destination: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
):
    source = source.strip()
    destination = destination.strip()

    trains = (
        db.query(Train)
        .filter(
            Train.source.ilike(source),
            Train.destination.ilike(destination),
        )
        .all()
    )

    return {
        "source": source.title(),
        "destination": destination.title(),
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
