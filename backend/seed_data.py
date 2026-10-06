from .database import Base, SessionLocal, engine
from .models import Train


TRAIN_DATA = [
    {
        "number": "12155",
        "name": "Bhopal Express",
        "train_type": "Superfast",
        "source": "Bhopal",
        "destination": "New Delhi",
        "departure": "16:55",
        "arrival": "07:20",
        "duration": "14h 25m",
        "train_class": "3A",
        "price": 1450,
        "total_seats": 72,
        "available_seats": 48,
    },
    {
        "number": "12626",
        "name": "Kerala Express",
        "train_type": "Superfast",
        "source": "Bhopal",
        "destination": "New Delhi",
        "departure": "09:30",
        "arrival": "23:00",
        "duration": "13h 30m",
        "train_class": "3A",
        "price": 1320,
        "total_seats": 72,
        "available_seats": 31,
    },
    {
        "number": "12437",
        "name": "Secunderabad Rajdhani",
        "train_type": "Rajdhani",
        "source": "Bhopal",
        "destination": "New Delhi",
        "departure": "19:40",
        "arrival": "06:00",
        "duration": "10h 20m",
        "train_class": "3A",
        "price": 1850,
        "total_seats": 72,
        "available_seats": 22,
    },
    {
        "number": "12138",
        "name": "Punjab Mail",
        "train_type": "Superfast",
        "source": "Bhopal",
        "destination": "Mumbai",
        "departure": "20:15",
        "arrival": "10:35",
        "duration": "14h 20m",
        "train_class": "3A",
        "price": 1250,
        "total_seats": 72,
        "available_seats": 39,
    },
    {
        "number": "12172",
        "name": "Mumbai CSMT Express",
        "train_type": "Superfast",
        "source": "Bhopal",
        "destination": "Mumbai",
        "departure": "17:30",
        "arrival": "07:10",
        "duration": "13h 40m",
        "train_class": "3A",
        "price": 1180,
        "total_seats": 72,
        "available_seats": 45,
    },
    {
        "number": "12919",
        "name": "Malwa Express",
        "train_type": "Superfast",
        "source": "Bhopal",
        "destination": "Indore",
        "departure": "05:45",
        "arrival": "09:30",
        "duration": "3h 45m",
        "train_class": "CC",
        "price": 520,
        "total_seats": 72,
        "available_seats": 57,
    },
    {
        "number": "19324",
        "name": "Indore Intercity",
        "train_type": "Intercity",
        "source": "Bhopal",
        "destination": "Indore",
        "departure": "14:10",
        "arrival": "18:15",
        "duration": "4h 05m",
        "train_class": "CC",
        "price": 480,
        "total_seats": 72,
        "available_seats": 41,
    },
    {
        "number": "12187",
        "name": "Intercity Express",
        "train_type": "Intercity",
        "source": "Bhopal",
        "destination": "Jabalpur",
        "departure": "06:00",
        "arrival": "11:30",
        "duration": "5h 30m",
        "train_class": "CC",
        "price": 620,
        "total_seats": 72,
        "available_seats": 52,
    },
    {
        "number": "12808",
        "name": "Samta Express",
        "train_type": "Superfast",
        "source": "Bhopal",
        "destination": "Jabalpur",
        "departure": "21:00",
        "arrival": "02:30",
        "duration": "5h 30m",
        "train_class": "3A",
        "price": 850,
        "total_seats": 72,
        "available_seats": 28,
    },
    {
        "number": "12433",
        "name": "Chennai Rajdhani",
        "train_type": "Rajdhani",
        "source": "Bhopal",
        "destination": "Chennai",
        "departure": "20:25",
        "arrival": "15:10",
        "duration": "18h 45m",
        "train_class": "3A",
        "price": 2100,
        "total_seats": 72,
        "available_seats": 19,
    },
    {
        "number": "12622",
        "name": "Grand Trunk Express",
        "train_type": "Superfast",
        "source": "Bhopal",
        "destination": "Chennai",
        "departure": "23:15",
        "arrival": "21:00",
        "duration": "21h 45m",
        "train_class": "3A",
        "price": 1750,
        "total_seats": 72,
        "available_seats": 36,
    },
    {
        "number": "12903",
        "name": "Golden Temple Mail",
        "train_type": "Superfast",
        "source": "Bhopal",
        "destination": "Jaipur",
        "departure": "18:40",
        "arrival": "08:50",
        "duration": "14h 10m",
        "train_class": "3A",
        "price": 1280,
        "total_seats": 72,
        "available_seats": 44,
    },
]


def seed_database():
    print("=" * 60)
    print("RAILCONNECT AI - TRAIN DATA SEED")
    print("=" * 60)

    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    added = 0
    skipped = 0

    try:
        for train_data in TRAIN_DATA:
            existing_train = (
                db.query(Train)
                .filter(Train.number == train_data["number"])
                .first()
            )

            if existing_train:
                skipped += 1
                print(
                    f"  - Skipped: {train_data['number']} "
                    f"{train_data['name']} (already exists)"
                )
                continue

            train = Train(**train_data)
            db.add(train)
            added += 1

            print(
                f"  ✓ Added: {train_data['number']} "
                f"{train_data['name']}"
            )

        db.commit()

        total_trains = db.query(Train).count()

        print("\n" + "-" * 60)
        print(f"New trains added : {added}")
        print(f"Existing skipped  : {skipped}")
        print(f"Total trains      : {total_trains}")
        print("-" * 60)

        print("\n✓ Train database seeding completed successfully.")

    except Exception as error:
        db.rollback()
        print("\n✗ Error while seeding train data.")
        print(f"Error: {error}")

    finally:
        db.close()

    print("=" * 60)


if __name__ == "__main__":
    seed_database()
