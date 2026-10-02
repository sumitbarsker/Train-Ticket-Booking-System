from sqlalchemy import text

from backend.database import engine


def migrate_booking_table():
    print("Checking bookings table...")

    with engine.begin() as connection:
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

            print(
                "journey_date column added successfully."
            )
        else:
            print(
                "journey_date column already exists."
            )


if __name__ == "__main__":
    migrate_booking_table()
