from sqlalchemy import inspect, text

from .database import Base, engine
from .models import (
    AIRecommendationLog,
    Booking,
    Passenger,
    SearchHistory,
    Train,
)


def show_database_status():
    inspector = inspect(engine)

    print("\n" + "=" * 60)
    print("RAILCONNECT AI - DATABASE STATUS")
    print("=" * 60)

    tables = inspector.get_table_names()

    if not tables:
        print("No tables found.")
        return

    print("\nExisting tables:")

    for table in tables:
        print(f"  ✓ {table}")

        columns = inspector.get_columns(table)

        for column in columns:
            column_name = column["name"]
            column_type = str(column["type"])

            print(f"      - {column_name}: {column_type}")

    print("=" * 60)


def create_tables():
    print("\nCreating missing database tables...")

    Base.metadata.create_all(bind=engine)

    print("✓ Database tables are ready.")


def check_database_connection():
    print("\nChecking database connection...")

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        print("✓ Database connection successful.")
        return True

    except Exception as error:
        print("✗ Database connection failed.")
        print(f"Error: {error}")
        return False


def migrate_database():
    print("\n" + "=" * 60)
    print("RAILCONNECT AI DATABASE MIGRATION")
    print("=" * 60)

    if not check_database_connection():
        print("\nMigration stopped because the database is not reachable.")
        return

    create_tables()
    show_database_status()

    print("\nMigration completed successfully.")
    print("Your database is ready for RailConnect AI.")
    print("=" * 60)


if __name__ == "__main__":
    migrate_database()
