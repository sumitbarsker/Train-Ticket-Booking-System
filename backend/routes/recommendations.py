from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Train
from backend.ai_model import predict_recommendation

router = APIRouter(
    prefix="/recommendations",
    tags=["AI Recommendations"],
)


def get_duration_hours(duration):
    try:
        return int(duration.lower().split("h")[0])
    except (ValueError, IndexError, AttributeError):
        return 99


def get_speed_score(train):
    train_type = train.train_type.lower()

    if train_type == "rajdhani":
        return 10

    if train_type in ["superfast", "shatabdi"]:
        return 9

    if train_type in ["intercity"]:
        return 8

    return 7


def get_comfort_score(train):
    train_class = train.train_class.lower()

    if train_class in ["1a", "ac first class"]:
        return 10

    if train_class in ["2a", "cc"]:
        return 9

    if train_class == "3a":
        return 8

    return 7


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

    recommendations = []

    for train in trains:
        duration_hours = get_duration_hours(
            train.duration
        )

        speed_score = get_speed_score(train)
        comfort_score = get_comfort_score(train)

        ml_score = predict_recommendation(
            price=train.price,
            duration_hours=duration_hours,
            available_seats=train.seats,
            train_speed_score=speed_score,
            comfort_score=comfort_score,
        )

        final_score = ml_score

        # User preference adjustment
        if preference == "cheapest":
            if train.price <= 700:
                final_score += 8
            elif train.price <= 1000:
                final_score += 4

        elif preference == "fastest":
            if duration_hours <= 7:
                final_score += 8
            elif duration_hours <= 9:
                final_score += 4

        final_score = round(
            min(100, final_score),
            2,
        )

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
                "ai_score": final_score,
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
        "model": "Random Forest",
        "recommendations": recommendations,
    }
