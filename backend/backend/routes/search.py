from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Train


router = APIRouter()


def format_train(train: Train):
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
        "available_seats": train.available_seats,
        "total_seats": train.total_seats,
    }


@router.get("/trains")
def search_trains(
    source: str,
    destination: str,
    journey_date: str,
    db: Session = Depends(get_db),
):
    """
    Search trains between two stations.

    journey_date is currently accepted so the
    frontend booking flow can pass the selected
    travel date. Later, date-wise availability
    can be stored separately in the database.
    """

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
        "journey_date": journey_date,
        "count": len(trains),
        "trains": [
            format_train(train)
            for train in trains
        ],
    }


@router.get("/stations")
def get_stations(
    db: Session = Depends(get_db),
):
    """
    Return all unique source and destination
    stations available in the database.
    """

    source_stations = (
        db.query(Train.source)
        .distinct()
        .all()
    )

    destination_stations = (
        db.query(Train.destination)
        .distinct()
        .all()
    )

    stations = set()

    for item in source_stations:
        stations.add(item[0])

    for item in destination_stations:
        stations.add(item[0])

    return {
        "count": len(stations),
        "stations": sorted(stations),
    }
