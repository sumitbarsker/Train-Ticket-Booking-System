from backend.database import SessionLocal
from backend.models import Train


train_data = [
    {
        "name": "Bhopal Express",
        "number": "12156",
        "source": "Bhopal",
        "destination": "New Delhi",
        "departure": "20:10",
        "arrival": "05:45",
        "duration": "09h 35m",
        "price": 850,
        "seats": 42,
        "train_class": "3A",
        "train_type": "Express",
    },
    {
        "name": "Shatabdi Express",
        "number": "12002",
        "source": "Bhopal",
        "destination": "New Delhi",
        "departure": "06:00",
        "arrival": "14:25",
        "duration": "08h 25m",
        "price": 1250,
        "seats": 18,
        "train_class": "CC",
        "train_type": "Superfast",
    },
    {
        "name": "Rajdhani Express",
        "number": "12434",
        "source": "Bhopal",
        "destination": "New Delhi",
        "departure": "16:55",
        "arrival": "23:50",
        "duration": "06h 55m",
        "price": 1450,
        "seats": 27,
        "train_class": "2A",
        "train_type": "Rajdhani",
    },
    {
        "name": "Malwa Express",
        "number": "12919",
        "source": "Indore",
        "destination": "New Delhi",
        "departure": "17:30",
        "arrival": "08:10",
        "duration": "14h 40m",
        "price": 920,
        "seats": 36,
        "train_class": "3A",
        "train_type": "Express",
    },
    {
        "name": "Intercity Express",
        "number": "12198",
        "source": "Bhopal",
        "destination": "Jabalpur",
        "departure": "07:15",
        "arrival": "12:40",
        "duration": "05h 25m",
        "price": 550,
        "seats": 51,
        "train_class": "CC",
        "train_type": "Intercity",
    },
]


def seed_trains():
    db = SessionLocal()

    try:
        existing_trains = db.query(Train).count()

        if existing_trains > 0:
            print("Train data already exists.")
            return

        for data in train_data:
            train = Train(**data)
            db.add(train)

        db.commit()

        print(f"{len(train_data)} trains added successfully.")

    except Exception as error:
        db.rollback()
        print(f"Error while adding train data: {error}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_trains()
