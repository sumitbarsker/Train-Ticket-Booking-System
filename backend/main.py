from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

# Database models import karna zaroori hai
# taaki SQLAlchemy unke tables ko register kar sake.
import models

from routes import trains
from routes import search
from routes import bookings
from routes import recommendations
from routes import seats
from routes import database_trains


# --------------------------------------------------
# Database initialization
# --------------------------------------------------

Base.metadata.create_all(bind=engine)


# --------------------------------------------------
# FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="RailConnect AI",
    description=(
        "AI-Powered Train Ticket Booking "
        "and Recommendation System"
    ),
    version="1.0.0",
)


# --------------------------------------------------
# CORS configuration
# --------------------------------------------------

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


# --------------------------------------------------
# Basic routes
# --------------------------------------------------

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


# --------------------------------------------------
# API routers
# --------------------------------------------------

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
