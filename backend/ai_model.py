import os
import joblib
import pandas as pd

from sklearn.ensemble import RandomForestRegressor


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
            550,
            700,
            850,
            920,
            1000,
            1250,
            1450,
            1600,
            750,
            1100,
        ],
        "duration_hours": [
            5,
            6,
            8,
            9,
            10,
            8,
            7,
            6,
            9,
            8,
        ],
        "available_seats": [
            51,
            45,
            42,
            36,
            30,
            18,
            27,
            12,
            40,
            25,
        ],
        "train_speed_score": [
            9,
            9,
            8,
            7,
            7,
            9,
            10,
            10,
            8,
            9,
        ],
        "comfort_score": [
            7,
            7,
            8,
            8,
            8,
            9,
            10,
            10,
            7,
            9,
        ],
        "recommendation_score": [
            92,
            88,
            85,
            80,
            76,
            84,
            91,
            86,
            79,
            87,
        ],
    }

    return pd.DataFrame(data)


def train_model():
    df = create_training_data()

    features = [
        "price",
        "duration_hours",
        "available_seats",
        "train_speed_score",
        "comfort_score",
    ]

    X = df[features]
    y = df["recommendation_score"]

    model = RandomForestRegressor(
        n_estimators=100,
        random_state=42,
    )

    model.fit(X, y)

    os.makedirs(MODEL_DIR, exist_ok=True)

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
