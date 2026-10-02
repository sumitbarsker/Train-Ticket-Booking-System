import os
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split


BASE_DIR = os.path.dirname(__file__)

DATA_PATH = os.path.join(
    BASE_DIR,
    "ml_data",
    "train_data.csv",
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "ml_models",
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "train_recommendation_model.pkl",
)


FEATURES = [
    "price",
    "duration_hours",
    "available_seats",
    "train_speed_score",
    "comfort_score",
]

TARGET = "recommendation_score"


def load_training_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"Training dataset not found: {DATA_PATH}"
        )

    df = pd.read_csv(DATA_PATH)

    required_columns = FEATURES + [TARGET]

    missing_columns = [
        column
        for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing columns in dataset: {missing_columns}"
        )

    return df


def train_model():
    df = load_training_data()

    X = df[FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
    )

    model = RandomForestRegressor(
        n_estimators=150,
        max_depth=8,
        random_state=42,
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    mae = mean_absolute_error(
        y_test,
        predictions,
    )

    r2 = r2_score(
        y_test,
        predictions,
    )

    print("=" * 55)
    print("RAILCONNECT AI - TRAIN RECOMMENDATION MODEL")
    print("=" * 55)
    print(f"Dataset samples : {len(df)}")
    print(f"Training samples: {len(X_train)}")
    print(f"Testing samples : {len(X_test)}")
    print(f"MAE             : {mae:.2f}")
    print(f"R2 Score        : {r2:.2f}")
    print("=" * 55)

    os.makedirs(
        MODEL_DIR,
        exist_ok=True,
    )

    joblib.dump(
        model,
        MODEL_PATH,
    )

    print(f"Model saved to: {MODEL_PATH}")

    return model


def get_model():
    if not os.path.exists(MODEL_PATH):
        return train_model()

    return joblib.load(MODEL_PATH)


def predict_recommendation(
    price,
    duration_hours,
    available_seats,
    train_speed_score,
    comfort_score,
):
    model = get_model()

    input_data = pd.DataFrame(
        [
            {
                "price": price,
                "duration_hours": duration_hours,
                "available_seats": available_seats,
                "train_speed_score": train_speed_score,
                "comfort_score": comfort_score,
            }
        ]
    )

    prediction = model.predict(input_data)[0]

    return round(
        max(0, min(100, prediction)),
        2,
    )


if __name__ == "__main__":
    train_model()
