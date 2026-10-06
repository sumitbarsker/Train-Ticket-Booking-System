from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from ..ai_model import load_model, predict_score, train_model
from ..database import get_db
from ..models import AIRecommendationLog, SearchHistory, Train


router = APIRouter()


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "ml_models" / "train_recommendation_model.joblib"
DATASET_PATH = BASE_DIR / "ml_data" / "train_data.csv"


def parse_duration(duration: str) -> int:
    try:
        parts = duration.lower().replace(" ", "").split("h")

        hours = int(parts[0])
        minutes = 0

        if len(parts) > 1 and "m" in parts[1]:
            minutes = int(parts[1].replace("m", ""))

        return hours * 60 + minutes

    except (ValueError, IndexError):
        return 0


def calculate_rule_score(train: Train, preference: str) -> float:
    duration_minutes = parse_duration(train.duration)

    max_price = 2500
    max_duration = 1500

    price_score = max(
        0,
        min(100, 100 - (train.price / max_price) * 100),
    )

    duration_score = max(
        0,
        min(100, 100 - (duration_minutes / max_duration) * 100),
    )

    availability_score = (
        (train.available_seats / train.total_seats) * 100
        if train.total_seats
        else 0
    )

    if preference == "cheapest":
        score = (
            price_score * 0.70
            + duration_score * 0.15
            + availability_score * 0.15
        )

    elif preference == "fastest":
        score = (
            price_score * 0.10
            + duration_score * 0.75
            + availability_score * 0.15
        )

    elif preference == "comfort":
        comfort_bonus = 10 if train.train_class in {"2A", "3A"} else 0

        score = (
            price_score * 0.15
            + duration_score * 0.20
            + availability_score * 0.35
            + comfort_bonus
        )

    else:
        score = (
            price_score * 0.35
            + duration_score * 0.30
            + availability_score * 0.35
        )

    return round(min(100, max(0, score)), 2)


def generate_reason(
    train: Train,
    preference: str,
    ai_score: float,
):
    if preference == "cheapest":
        return (
            f"Recommended for budget preference with a fare of "
            f"₹{train.price:.0f} and an AI score of {ai_score:.1f}."
        )

    if preference == "fastest":
        return (
            f"Recommended for faster travel with a journey duration "
            f"of {train.duration} and an AI score of {ai_score:.1f}."
        )

    if preference == "comfort":
        return (
            f"Recommended for comfort with {train.train_class} class, "
            f"{train.train_type} service and an AI score of "
            f"{ai_score:.1f}."
        )

    return (
        f"Balanced recommendation based on fare, journey duration, "
        f"seat availability and ML prediction. AI score: "
        f"{ai_score:.1f}."
    )


def ensure_model():
    if MODEL_PATH.exists():
        return True

    if not DATASET_PATH.exists():
        return False

    try:
        train_model(DATASET_PATH)
        return MODEL_PATH.exists()

    except Exception:
        return False


def get_ml_score(train: Train):
    if not ensure_model():
        return None

    try:
        model = load_model(MODEL_PATH)

        features = {
            "source": train.source,
            "destination": train.destination,
            "train_type": train.train_type,
            "train_class": train.train_class,
            "price": train.price,
            "duration_minutes": parse_duration(train.duration),
            "available_seats": train.available_seats,
            "total_seats": train.total_seats,
        }

        score = predict_score(
            model,
            features,
        )

        return round(
            max(0, min(100, float(score))),
            2,
        )

    except Exception:
        return None


def recommendation_to_dict(
    train: Train,
    ai_score: float,
    reason: str,
):
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
        "ai_score": ai_score,
        "ai_reason": reason,
    }


@router.get("/trains")
def recommend_trains(
    source: str,
    destination: str,
    preference: str = Query(
        default="balanced",
        pattern="^(balanced|cheapest|fastest|comfort)$",
    ),
    db: Session = Depends(get_db),
):
    clean_source = source.strip()
    clean_destination = destination.strip()

    if not clean_source or not clean_destination:
        raise HTTPException(
            status_code=400,
            detail="Source and destination are required.",
        )

    if clean_source.lower() == clean_destination.lower():
        raise HTTPException(
            status_code=400,
            detail="Source and destination cannot be the same.",
        )

    trains = (
        db.query(Train)
        .filter(
            Train.source.ilike(clean_source),
            Train.destination.ilike(clean_destination),
        )
        .all()
    )

    if not trains:
        return {
            "source": clean_source,
            "destination": clean_destination,
            "preference": preference,
            "count": 0,
            "trains": [],
            "message": "No trains found for this route.",
        }

    # Save search history
    history = SearchHistory(
        source=clean_source,
        destination=clean_destination,
        preference=preference,
    )

    db.add(history)

    recommendations = []

    for train in trains:
        rule_score = calculate_rule_score(
            train,
            preference,
        )

        ml_score = get_ml_score(train)

        if ml_score is not None:
            final_score = (
                ml_score * 0.65
                + rule_score * 0.35
            )
        else:
            final_score = rule_score

        final_score = round(
            max(0, min(100, final_score)),
            2,
        )

        reason = generate_reason(
            train,
            preference,
            final_score,
        )

        recommendations.append(
            {
                "train": train,
                "score": final_score,
                "reason": reason,
                "ml_score": ml_score,
                "rule_score": rule_score,
            }
        )

    recommendations.sort(
        key=lambda item: item["score"],
        reverse=True,
    )

    top_recommendations = recommendations[:5]

    for item in top_recommendations:
        log = AIRecommendationLog(
            source=clean_source,
            destination=clean_destination,
            preference=preference,
            recommended_train_id=item["train"].id,
            ai_score=item["score"],
            ai_reason=item["reason"],
        )

        db.add(log)

    db.commit()

    return {
        "source": clean_source,
        "destination": clean_destination,
        "preference": preference,
        "count": len(top_recommendations),
        "model_used": any(
            item["ml_score"] is not None
            for item in recommendations
        ),
        "trains": [
            recommendation_to_dict(
                item["train"],
                item["score"],
                item["reason"],
            )
            for item in top_recommendations
        ],
    }


@router.get("/explain/{train_id}")
def explain_recommendation(
    train_id: int,
    source: str,
    destination: str,
    preference: str = "balanced",
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

    if (
        train.source.lower() != source.strip().lower()
        or train.destination.lower()
        != destination.strip().lower()
    ):
        raise HTTPException(
            status_code=400,
            detail="Train does not operate on the requested route.",
        )

    rule_score = calculate_rule_score(
        train,
        preference,
    )

    ml_score = get_ml_score(train)

    if ml_score is not None:
        final_score = (
            ml_score * 0.65
            + rule_score * 0.35
        )
    else:
        final_score = rule_score

    final_score = round(
        max(0, min(100, final_score)),
        2,
    )

    return {
        "train_id": train.id,
        "train_number": train.number,
        "train_name": train.name,
        "preference": preference,
        "ai_score": final_score,
        "ml_score": ml_score,
        "rule_score": rule_score,
        "reason": generate_reason(
            train,
            preference,
            final_score,
        ),
        "factors": {
            "price": train.price,
            "duration": train.duration,
            "available_seats": train.available_seats,
            "total_seats": train.total_seats,
            "train_type": train.train_type,
            "class": train.train_class,
        },
    }
