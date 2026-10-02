from sqlalchemy import text

from backend.database import engine


TRAIN_CAPACITIES = {
    "12156": 60,
    "12002": 60,
    "12434": 60,
    "12919": 60,
    "12198": 60,
}


def migrate_booking_table(connection):
    print("Checking bookings table...")

    columns = connection.execute(
        text(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'bookings'
            """
        )
    ).fetchall()

    existing_columns = {
        column[0]
        for column in columns
    }

    if "journey_date" not in existing_columns:
        print("Adding journey_date column...")

        connection.execute(
            text(
                """
                ALTER TABLE bookings
                ADD COLUMN journey_date DATE
                """
            )
        )

        connection.execute(
            text(
                """
                UPDATE bookings
                SET journey_date = CURRENT_DATE
                WHERE journey_date IS NULL
                """
            )
        )

        connection.execute(
            text(
                """
                ALTER TABLE bookings
                ALTER COLUMN journey_date SET NOT NULL
                """
            )
        )

        print("journey_date migration completed.")

    else:
        print("journey_date already exists.")

        connection.execute(
            text(
                """
                UPDATE bookings
                SET journey_date = CURRENT_DATE
                WHERE journey_date IS NULL
                """
            )
        )

        connection.execute(
            text(
                """
                ALTER TABLE bookings
                ALTER COLUMN journey_date SET NOT NULL
                """
            )
        )


def migrate_train_table(connection):
    print("Checking trains table...")

    columns = connection.execute(
        text(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'trains'
            """
        )
    ).fetchall()

    existing_columns = {
        column[0]
        for column in columns
    }

    if "total_seats" not in existing_columns:
        print("Adding total_seats column...")

        connection.execute(
            text(
                """
                ALTER TABLE trains
                ADD COLUMN total_seats INTEGER
                """
            )
        )

        print("total_seats column added.")

    else:
        print("total_seats column already exists.")

    # Existing trains ko capacity assign karo
    for train_number, capacity in TRAIN_CAPACITIES.items():
        connection.execute(
            text(
                """
                UPDATE trains
                SET total_seats = :capacity
                WHERE number = :train_number
                """
            ),
            {
                "capacity": capacity,
                "train_number": train_number,
            },
        )

    # Agar koi unknown train ho to default capacity
    connection.execute(
        text(
            """
            UPDATE trains
            SET total_seats = 60
            WHERE total_seats IS NULL
            """
        )
    )

    connection.execute(
        text(
            """
            ALTER TABLE trains
            ALTER COLUMN total_seats SET NOT NULL
            """
        )
    )

    print("Train seat capacities updated.")


def migrate_database():
    print("Starting database migration...")

    with engine.begin() as connection:
        migrate_booking_table(connection)
        migrate_train_table(connection)

    print("Database migration completed successfully.")


if __name__ == "__main__":
    migrate_database()
