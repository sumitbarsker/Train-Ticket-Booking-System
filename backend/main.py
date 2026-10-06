from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from . import models
from .routes import (
    trains,
    search,
    bookings,
    recommendations,
    seats,
    database_trains,
)


# Create database tables automatically when the application starts.
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="RailConnect AI",
    description="AI-Powered Train Ticket Booking and Recommendation System",
    version="1.0.0",
)


# ---------------------------------------------------------
# CORS CONFIGURATION
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# ROOT & HEALTH CHECK
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "RailConnect AI API is running",
        "status": "success",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RailConnect AI Backend",
    }


# ---------------------------------------------------------
# API ROUTES
# ---------------------------------------------------------

app.include_router(
    trains.router,
    prefix="/trains",
    tags=["Trains"],
)

app.include_router(
    search.router,
    prefix="/search",
    tags=["Search"],
)

app.include_router(
    bookings.router,
    prefix="/bookings",
    tags=["Bookings"],
)

app.include_router(
    recommendations.router,
    prefix="/recommendations",
    tags=["AI Recommendations"],
)

app.include_router(
    seats.router,
    prefix="/seats",
    tags=["Seats"],
)

app.include_router(
    database_trains.router,
    prefix="/database-trains",
    tags=["Database Trains"],
)
