from backend.database import SessionLocal
from backend.models import Train


TRAIN_DATA = [
    {
        "name": "Bhopal Express",
        "number": "12156",
        "source": "Bhopal",
        "destination": "New Delhi",
        "departure": "20:10",
        "arrival": "05:45",
        "duration": "09h 35m",
        "price": 850,
        "seats": 72,
        "total_seats": 72,
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
        "seats": 56,
        "total_seats": 56,
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
        "seats": 54,
        "total_seats": 54,
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
        "seats": 72,
        "total_seats": 72,
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
        "seats": 56,
        "total_seats": 56,
        "train_class": "CC",
        "train_type": "Intercity",
    },
]


def seed_trains():
    db = SessionLocal()

    try:
        for train_data in TRAIN_DATA:
            train = (
                db.query(Train)
                .filter(
                    Train.number == train_data["number"]
                )
                .first()
            )

            if train:
                train.name = train_data["name"]
                train.source = train_data["source"]
                train.destination = train_data["destination"]
                train.departure = train_data["departure"]
                train.arrival = train_data["arrival"]
                train.duration = train_data["duration"]
                train.price = train_data["price"]
                train.seats = train_data["seats"]
                train.total_seats = train_data["total_seats"]
                train.train_class = train_data["train_class"]
                train.train_type = train_data["train_type"]

                print(
                    f"Updated: {train.name}"
                )

            else:
                train = Train(**train_data)
                db.add(train)

                print(
                    f"Added: {train_data['name']}"
                )

        db.commit()

        print(
            "Train database updated successfully."
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_trains()
