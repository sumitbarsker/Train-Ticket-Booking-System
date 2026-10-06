from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


# ============================================================
# Paths
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_DIR = BASE_DIR / "ml_models"
MODEL_PATH = MODEL_DIR / "train_recommendation_model.joblib"

DEFAULT_DATASET = BASE_DIR / "ml_data" / "train_data.csv"


# ============================================================
# ML Features
# ============================================================

CATEGORICAL_FEATURES = [
    "source",
    "destination",
    "train_type",
    "train_class",
]

NUMERICAL_FEATURES = [
    "price",
    "duration_minutes",
    "available_seats",
    "total_seats",
]

TARGET_COLUMN = "recommendation_score"


# ============================================================
# Duration Parser
# ============================================================

def parse_duration(duration):
    """
    Convert values such as:
    14h 25m -> 865 minutes
    5h 30m  -> 330 minutes
    """

    if isinstance(duration, (int, float)):
        return int(duration)

    try:
        duration = str(duration).lower().replace(" ", "")

        hours = 0
        minutes = 0

        if "h" in duration:
            hour_part, remaining = duration.split("h", 1)
            hours = int(hour_part)

            if "m" in remaining:
                minute_part = remaining.split("m", 1)[0]
                if minute_part:
                    minutes = int(minute_part)

        elif "m" in duration:
            minute_part = duration.split("m", 1)[0]
            minutes = int(minute_part)

        return hours * 60 + minutes

    except (ValueError, TypeError):
        return 0


# ============================================================
# Training Score
# ============================================================

def calculate_training_score(row):
    """
    Creates a target score for supervised ML training.

    Higher score means:
    - lower price
    - shorter journey
    - better seat availability
    """

    price = float(row["price"])
    duration = float(row["duration_minutes"])
    available = float(row["available_seats"])
    total = float(row["total_seats"])

    max_price = 2500
    max_duration = 1500

    price_score = max(
        0,
        min(
            100,
            100 - (price / max_price) * 100,
        ),
    )

    duration_score = max(
        0,
        min(
            100,
            100 - (duration / max_duration) * 100,
        ),
    )

    availability_score = (
        (available / total) * 100
        if total > 0
        else 0
    )

    score = (
        price_score * 0.35
        + duration_score * 0.30
        + availability_score * 0.35
    )

    return round(
        max(0, min(100, score)),
        2,
    )


# ============================================================
# Data Preparation
# ============================================================

def prepare_dataframe(csv_path):
    csv_path = Path(csv_path)

    if not csv_path.exists():
        raise FileNotFoundError(
            f"Training dataset not found: {csv_path}"
        )

    df = pd.read_csv(csv_path)

    required_columns = (
        CATEGORICAL_FEATURES
        + [
            "price",
            "duration_minutes",
            "available_seats",
            "total_seats",
        ]
    )

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            "Missing columns in training dataset: "
            + ", ".join(missing_columns)
        )

    for column in CATEGORICAL_FEATURES:
        df[column] = (
            df[column]
            .fillna("Unknown")
            .astype(str)
            .str.strip()
        )

    for column in NUMERICAL_FEATURES:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce",
        )

    df = df.dropna(
        subset=NUMERICAL_FEATURES
    ).copy()

    if df.empty:
        raise ValueError(
            "Training dataset contains no valid rows."
        )

    if TARGET_COLUMN not in df.columns:
        df[TARGET_COLUMN] = df.apply(
            calculate_training_score,
            axis=1,
        )

    return df


# ============================================================
# Create ML Pipeline
# ============================================================

def create_model():
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore"
                ),
                CATEGORICAL_FEATURES,
            ),
            (
                "numerical",
                "passthrough",
                NUMERICAL_FEATURES,
            ),
        ]
    )

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=42,
        n_jobs=-1,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    return pipeline


# ============================================================
# Train Model
# ============================================================

def train_model(csv_path=DEFAULT_DATASET):
    print("=" * 60)
    print("RAILCONNECT AI - ML MODEL TRAINING")
    print("=" * 60)

    df = prepare_dataframe(csv_path)

    features = (
        CATEGORICAL_FEATURES
        + NUMERICAL_FEATURES
    )

    X = df[features]
    y = df[TARGET_COLUMN]

    model = create_model()

    print(f"\nTraining rows: {len(df)}")
    print(f"Features: {len(features)}")

    model.fit(X, y)

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        model,
        MODEL_PATH,
    )

    print(f"\n✓ Model saved to:")
    print(MODEL_PATH)

    print("=" * 60)

    return model


# ============================================================
# Load Model
# ============================================================

def load_model(model_path=MODEL_PATH):
    model_path = Path(model_path)

    if not model_path.exists():
        raise FileNotFoundError(
            f"ML model not found: {model_path}"
        )

    return joblib.load(model_path)


# ============================================================
# Predict Recommendation Score
# ============================================================

def predict_score(model, train_data):
    row = {
        "source": train_data["source"],
        "destination": train_data["destination"],
        "train_type": train_data["train_type"],
        "train_class": train_data["train_class"],
        "price": float(train_data["price"]),
        "duration_minutes": float(
            train_data["duration_minutes"]
        ),
        "available_seats": float(
            train_data["available_seats"]
        ),
        "total_seats": float(
            train_data["total_seats"]
        ),
    }

    input_df = pd.DataFrame([row])

    prediction = model.predict(input_df)

    score = float(
        np.asarray(prediction).flatten()[0]
    )

    return max(
        0,
        min(100, score),
    )


# ============================================================
# Train + Predict Helper
# ============================================================

def train_and_predict(train_data):
    """
    Train the model if required and return
    the recommendation score for one train.
    """

    if not MODEL_PATH.exists():
        train_model()

    model = load_model()

    return predict_score(
        model,
        train_data,
    )


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":
    trained_model = train_model()

    sample_train = {
        "source": "Bhopal",
        "destination": "New Delhi",
        "train_type": "Superfast",
        "train_class": "3A",
        "price": 1450,
        "duration_minutes": 865,
        "available_seats": 48,
        "total_seats": 72,
    }

    score = predict_score(
        trained_model,
        sample_train,
    )

    print(
        f"\nSample recommendation score: {score:.2f}/100"
    )
