from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


BASE_DIR = Path(__file__).resolve().parent

MODEL_DIR = BASE_DIR / "ml_models"
MODEL_PATH = MODEL_DIR / "train_recommendation_model.joblib"


FEATURE_COLUMNS = [
    "source",
    "destination",
    "train_type",
    "train_class",
    "price",
    "duration_minutes",
    "available_seats",
    "total_seats",
]


TARGET_COLUMN = "recommendation_score"


def duration_to_minutes(duration):
    """
    Convert duration such as:
    13h 20m -> 800
    """

    if not isinstance(duration, str):
        return 0

    hours = 0
    minutes = 0

    for part in duration.lower().split():
        try:
            if part.endswith("h"):
                hours = int(
                    part[:-1]
                )

            elif part.endswith("m"):
                minutes = int(
                    part[:-1]
                )

        except ValueError:
            continue

    return (
        hours * 60
        + minutes
    )


def calculate_training_score(row):
    """
    Create a training target score.

    Higher score means:
    - lower price
    - shorter journey
    - better seat availability
    """

    price = float(row["price"])
    duration = float(
        row["duration_minutes"]
    )

    available = float(
        row["available_seats"]
    )

    total = max(
        float(row["total_seats"]),
        1,
    )

    availability_ratio = (
        available / total
    )

    # Normalized component scores
    price_score = 100 / (
        1 + price / 1000
    )

    duration_score = 100 / (
        1 + duration / 600
    )

    availability_score = (
        availability_ratio * 100
    )

    final_score = (
        price_score * 0.35
        + duration_score * 0.35
        + availability_score * 0.30
    )

    return round(
        min(100, final_score),
        2,
    )


def prepare_dataframe(df):
    """
    Prepare raw train data for ML training.
    """

    data = df.copy()

    if "duration_minutes" not in data.columns:
        if "duration" in data.columns:
            data["duration_minutes"] = (
                data["duration"]
                .apply(duration_to_minutes)
            )
        else:
            data["duration_minutes"] = 0

    required_defaults = {
        "source": "Unknown",
        "destination": "Unknown",
        "train_type": "Express",
        "train_class": "3A",
        "price": 1000,
        "available_seats": 50,
        "total_seats": 72,
    }

    for column, default in required_defaults.items():
        if column not in data.columns:
            data[column] = default

    numeric_columns = [
        "price",
        "duration_minutes",
        "available_seats",
        "total_seats",
    ]

    for column in numeric_columns:
        data[column] = pd.to_numeric(
            data[column],
            errors="coerce",
        ).fillna(0)

    return data


def create_training_pipeline():
    """
    Create the Random Forest recommendation pipeline.
    """

    categorical_features = [
        "source",
        "destination",
        "train_type",
        "train_class",
    ]

    numeric_features = [
        "price",
        "duration_minutes",
        "available_seats",
        "total_seats",
    ]

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore"
                ),
                categorical_features,
            ),
            (
                "numeric",
                "passthrough",
                numeric_features,
            ),
        ]
    )

    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=10,
        random_state=42,
        n_jobs=-1,
    )

    return Pipeline(
        steps=[
            (
                "preprocessor",
                preprocessor,
            ),
            (
                "model",
                model,
            ),
        ]
    )


def train_model(csv_path=None):
    """
    Train the recommendation model
    using train_data.csv.
    """

    if csv_path is None:
        csv_path = (
            BASE_DIR
            / "ml_data"
            / "train_data.csv"
        )

    csv_path = Path(csv_path)

    if not csv_path.exists():
        raise FileNotFoundError(
            f"Training data not found: {csv_path}"
        )

    df = pd.read_csv(csv_path)

    df = prepare_dataframe(df)

    # Generate target score if it does
    # not already exist.
    if TARGET_COLUMN not in df.columns:
        df[TARGET_COLUMN] = df.apply(
            calculate_training_score,
            axis=1,
        )

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    pipeline = create_training_pipeline()

    pipeline.fit(X, y)

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        pipeline,
        MODEL_PATH,
    )

    return {
        "model_path": str(
            MODEL_PATH
        ),
        "training_rows": len(df),
        "features": FEATURE_COLUMNS,
        "target": TARGET_COLUMN,
    }


def load_model():
    """
    Load the trained recommendation model.
    """

    if not MODEL_PATH.exists():
        return None

    return joblib.load(
        MODEL_PATH
    )


def predict_score(
    train_data,
):
    """
    Predict AI recommendation score
    for one or multiple trains.
    """

    model = load_model()

    if model is None:
        return None

    if isinstance(
        train_data,
        dict,
    ):
        dataframe = pd.DataFrame(
            [train_data]
        )
    else:
        dataframe = pd.DataFrame(
            train_data
        )

    dataframe = prepare_dataframe(
        dataframe
    )

    predictions = model.predict(
        dataframe[FEATURE_COLUMNS]
    )

    predictions = np.clip(
        predictions,
        0,
        100,
    )

    return [
        round(
            float(score),
            2,
        )
        for score in predictions
    ]


def train_and_predict(
    train_data,
    csv_path=None,
):
    """
    Train the model if necessary,
    then return predictions.
    """

    if not MODEL_PATH.exists():
        train_model(
            csv_path
        )

    return predict_score(
        train_data
    )


if __name__ == "__main__":
    result = train_model()

    print(
        "AI recommendation model trained successfully."
    )

    print(
        f"Training rows: "
        f"{result['training_rows']}"
    )

    print(
        f"Model saved at: "
        f"{result['model_path']}"
    )
