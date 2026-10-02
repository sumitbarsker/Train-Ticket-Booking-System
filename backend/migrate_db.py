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

            print("journey_date column added.")

            # Existing bookings ko temporary date assign karo
            connection.execute(
                text(
                    """
                    UPDATE bookings
                    SET journey_date = CURRENT_DATE
                    WHERE journey_date IS NULL
                    """
                )
            )

            print("Existing bookings updated.")

            # Ab column ko required bana do
            connection.execute(
                text(
                    """
                    ALTER TABLE bookings
                    ALTER COLUMN journey_date SET NOT NULL
                    """
                )
            )

            print("journey_date is now required.")

        else:
            print("journey_date column already exists.")

            # Safety check for any NULL values
            null_count = connection.execute(
                text(
                    """
                    SELECT COUNT(*)
                    FROM bookings
                    WHERE journey_date IS NULL
                    """
                )
            ).scalar()

            if null_count and null_count > 0:
                connection.execute(
                    text(
                        """
                        UPDATE bookings
                        SET journey_date = CURRENT_DATE
                        WHERE journey_date IS NULL
                        """
                    )
                )

                print(
                    f"Updated {null_count} old booking(s)."
                )

            connection.execute(
                text(
                    """
                    ALTER TABLE bookings
                    ALTER COLUMN journey_date SET NOT NULL
                    """
                )

            print("journey_date constraint verified.")


if __name__ == "__main__":
    migrate_booking_table()
