from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Train

router = APIRouter(
    prefix="/recommendations",
    tags=["AI Recommendations"],
)


@router.get("/trains")
def recommend_trains(
    source: str = Query(..., min_length=2),
    destination: str = Query(..., min_length=2),
    preference: str = Query("balanced"),
    db: Session = Depends(get_db),
):
    source = source.strip()
    destination = destination.strip()
    preference = preference.strip().lower()

    trains = (
        db.query(Train)
        .filter(
            Train.source.ilike(source),
            Train.destination.ilike(destination),
        )
        .all()
    )

    if not trains:
        return {
            "source": source.title(),
            "destination": destination.title(),
            "preference": preference,
            "count": 0,
            "recommendations": [],
        }

    def calculate_score(train):
        score = 0

        # More available seats = better availability
        if train.seats >= 40:
            score += 20
        elif train.seats >= 20:
            score += 12
        elif train.seats > 0:
            score += 5

        # Preference-based scoring
        if preference == "cheapest":
            if train.price <= 700:
                score += 35
            elif train.price <= 1000:
                score += 25
            elif train.price <= 1300:
                score += 15
            else:
                score += 5

        elif preference == "fastest":
            duration_text = train.duration.lower()

            try:
                hours = int(duration_text.split("h")[0])
            except (ValueError, IndexError):
                hours = 99

            if hours <= 7:
                score += 35
            elif hours <= 9:
                score += 25
            elif hours <= 12:
                score += 15
            else:
                score += 5

        else:
            # Balanced recommendation
            if train.price <= 1000:
                score += 15

            duration_text = train.duration.lower()

            try:
                hours = int(duration_text.split("h")[0])
            except (ValueError, IndexError):
                hours = 99

            if hours <= 9:
                score += 15

        # Add a small bonus for faster train types
        if train.train_type.lower() in [
            "superfast",
            "rajdhani",
            "shatabdi",
        ]:
            score += 10

        return score

    recommendations = []

    for train in trains:
        score = calculate_score(train)

        recommendations.append(
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
                "ai_score": score,
            }
        )

    recommendations.sort(
        key=lambda train: train["ai_score"],
        reverse=True,
    )

    return {
        "source": source.title(),
        "destination": destination.title(),
        "preference": preference,
        "count": len(recommendations),
        "recommendations": recommendations,
    }
