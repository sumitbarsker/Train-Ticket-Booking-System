import os
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split


MODEL_DIR = os.path.join(
    os.path.dirname(__file__),
    "ml_models",
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "train_recommendation_model.pkl",
)


def create_training_data():
    data = {
        "price": [
            450, 550, 600, 700, 750,
            800, 850, 900, 950, 1000,
            1050, 1100, 1200, 1250, 1300,
            1400, 1450, 1500, 1600, 1800,
            650, 720, 880, 980, 1150,
            1350, 1550, 500, 760, 890,
        ],

        "duration_hours": [
            4, 5, 5, 6, 7,
            8, 8, 9, 9, 10,
            10, 8, 7, 8, 9,
            6, 7, 8, 6, 5,
            6, 7, 8, 9, 10,
            7, 6, 5, 8, 9,
        ],

        "available_seats": [
            55, 51, 48, 45, 42,
            40, 38, 36, 34, 32,
            30, 28, 25, 22, 20,
            27, 24, 18, 15, 12,
            46, 39, 31, 29, 21,
            26, 19, 50, 37, 23,
        ],

        "train_speed_score": [
            8, 9, 9, 8, 7,
            8, 8, 7, 7, 6,
            6, 9, 10, 9, 8,
            10, 10, 9, 10, 10,
            8, 7, 8, 7, 6,
            9, 10, 9, 8, 7,
        ],

        "comfort_score": [
            7, 7, 8, 8, 8,
            8, 8, 8, 9, 8,
            8, 9, 9, 9, 8,
            10, 10, 9, 10, 10,
            9, 8, 8, 8, 7,
            9, 10, 9, 8, 8,
        ],

        "recommendation_score": [
            91, 92, 89, 87, 82,
            84, 83, 79, 78, 73,
            71, 85, 94, 91, 82,
            96, 95, 88, 93, 90,
            86, 81, 80, 76, 70,
            89, 92, 94, 84, 77,
        ],
    }

    return pd.DataFrame(data)


def get_features():
    return [
        "price",
        "duration_hours",
        "available_seats",
        "train_speed_score",
        "comfort_score",
    ]


def train_model():
    df = create_training_data()

    features = get_features()

    X = df[features]
    y = df["recommendation_score"]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
    )

    model = RandomForestRegressor(
        n_estimators=150,
        random_state=42,
        max_depth=8,
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

    print("=" * 50)
    print("TRAIN RECOMMENDATION MODEL")
    print("=" * 50)
    print(f"Training samples : {len(X_train)}")
    print(f"Testing samples  : {len(X_test)}")
    print(f"MAE              : {mae:.2f}")
    print(f"R2 Score         : {r2:.2f}")
    print("=" * 50)

    os.makedirs(
        MODEL_DIR,
        exist_ok=True,
    )

    joblib.dump(
        model,
        MODEL_PATH,
    )

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
