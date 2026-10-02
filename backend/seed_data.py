from database import Base, SessionLocal, engine
from models import Train


TRAIN_DATA = [
    {
        "number": "12155",
        "name": "Bhopal Express",
        "train_type": "Superfast",
        "source": "Bhopal",
        "destination": "New Delhi",
        "departure": "16:35",
        "arrival": "05:55",
        "duration": "13h 20m",
        "train_class": "3A",
        "price": 1250,
        "total_seats": 72,
        "available_seats": 48,
    },
    {
        "number": "12625",
        "name": "Kerala Express",
        "train_type": "Express",
        "source": "Bhopal",
        "destination": "New Delhi",
        "departure": "06:40",
        "arrival": "19:20",
        "duration": "12h 40m",
        "train_class": "3A",
        "price": 1180,
        "total_seats": 72,
        "available_seats": 31,
    },
    {
        "number": "12437",
        "name": "Secunderabad Rajdhani",
        "train_type": "Rajdhani",
        "source": "Bhopal",
        "destination": "New Delhi",
        "departure": "21:15",
        "arrival": "08:15",
        "duration": "11h 00m",
        "train_class": "2A",
        "price": 1850,
        "total_seats": 54,
        "available_seats": 22,
    },
    {
        "number": "11057",
        "name": "Mumbai CSMT Express",
        "train_type": "Superfast",
        "source": "Bhopal",
        "destination": "Mumbai",
        "departure": "17:10",
        "arrival": "07:30",
        "duration": "14h 20m",
        "train_class": "3A",
        "price": 1350,
        "total_seats": 72,
        "available_seats": 39,
    },
    {
        "number": "12138",
        "name": "Punjab Mail",
        "train_type": "Express",
        "source": "Bhopal",
        "destination": "Mumbai",
        "departure": "21:05",
        "arrival": "10:20",
        "duration": "13h 15m",
        "train_class": "SL",
        "price": 620,
        "total_seats": 72,
        "available_seats": 55,
    },
    {
        "number": "12920",
        "name": "Malwa Express",
        "train_type": "Superfast",
        "source": "Bhopal",
        "destination": "Indore",
        "departure": "07:10",
        "arrival": "12:15",
        "duration": "5h 05m",
        "train_class": "CC",
        "price": 750,
        "total_seats": 78,
        "available_seats": 43,
    },
    {
        "number": "19324",
        "name": "Indore Intercity",
        "train_type": "Intercity",
        "source": "Bhopal",
        "destination": "Indore",
        "departure": "15:30",
        "arrival": "20:45",
        "duration": "5h 15m",
        "train_class": "CC",
        "price": 680,
        "total_seats": 78,
        "available_seats": 61,
    },
    {
        "number": "12808",
        "name": "Samta Express",
        "train_type": "Superfast",
        "source": "Bhopal",
        "destination": "Jabalpur",
        "departure": "08:25",
        "arrival": "14:40",
        "duration": "6h 15m",
        "train_class": "3A",
        "price": 890,
        "total_seats": 72,
        "available_seats": 36,
    },
    {
        "number": "22187",
        "name": "Intercity Express",
        "train_type": "Intercity",
        "source": "Bhopal",
        "destination": "Jabalpur",
        "departure": "18:20",
        "arrival": "00:35",
        "duration": "6h 15m",
        "train_class": "CC",
        "price": 720,
        "total_seats": 78,
        "available_seats": 49,
    },
    {
        "number": "12434",
        "name": "Chennai Rajdhani",
        "train_type": "Rajdhani",
        "source": "Bhopal",
        "destination": "Chennai",
        "departure": "18:50",
        "arrival": "17:20",
        "duration": "22h 30m",
        "train_class": "2A",
        "price": 2350,
        "total_seats": 54,
        "available_seats": 18,
    },
    {
        "number": "12616",
        "name": "Grand Trunk Express",
        "train_type": "Superfast",
        "source": "Bhopal",
        "destination": "Chennai",
        "departure": "23:10",
        "arrival": "04:30",
        "duration": "29h 20m",
        "train_class": "3A",
        "price": 1680,
        "total_seats": 72,
        "available_seats": 27,
    },
    {
        "number": "12924",
        "name": "Golden Temple Mail",
        "train_type": "Express",
        "source": "Bhopal",
        "destination": "Jaipur",
        "departure": "19:25",
        "arrival": "08:40",
        "duration": "13h 15m",
        "train_class": "3A",
        "price": 1320,
        "total_seats": 72,
        "available_seats": 42,
    },
]


def seed_database():
    print("Initializing database...")

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        added = 0
        skipped = 0

        for train_data in TRAIN_DATA:
            existing_train = (
                db.query(Train)
                .filter(
                    Train.number
                    == train_data["number"]
                )
                .first()
            )

            if existing_train:
                skipped += 1
                continue

            train = Train(**train_data)

            db.add(train)
            added += 1

        db.commit()

        print()
        print("Database seeding completed.")
        print(f"New trains added: {added}")
        print(f"Existing trains skipped: {skipped}")
        print(f"Total train records: {db.query(Train).count()}")

    except Exception as error:
        db.rollback()
        print("Database seeding failed.")
        print(f"Error: {error}")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
