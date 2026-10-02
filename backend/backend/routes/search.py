from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Booking, Train


router = APIRouter(
    prefix="/search",
    tags=["Train Search"],
)


@router.get("/trains")
def search_trains(
    source: str = Query(..., min_length=2),
    destination: str = Query(..., min_length=2),
    journey_date: date = Query(...),
    db: Session = Depends(get_db),
):
    source = source.strip()
    destination = destination.strip()

    # --------------------------------------------
    # Validate journey date
    # --------------------------------------------

    if journey_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="Journey date cannot be in the past.",
        )

    # --------------------------------------------
    # Find matching trains
    # --------------------------------------------

    trains = (
        db.query(Train)
        .filter(
            Train.source.ilike(source),
            Train.destination.ilike(destination),
        )
        .all()
    )

    results = []

    for train in trains:

        # ----------------------------------------
        # Count confirmed bookings for this date
        # ----------------------------------------

        booked_count = (
            db.query(Booking)
            .filter(
                Booking.train_id == train.id,
                Booking.journey_date == journey_date,
                Booking.status == "Confirmed",
            )
            .count()
        )

        available_seats = max(
            train.total_seats - booked_count,
            0,
        )

        results.append(
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
                "seats": available_seats,
                "total_seats": train.total_seats,
                "available_seats": available_seats,
                "class": train.train_class,
                "type": train.train_type,
                "journey_date": journey_date,
            }
        )

    return {
        "source": source.title(),
        "destination": destination.title(),
        "journey_date": journey_date,
        "count": len(results),
        "trains": results,
    }
