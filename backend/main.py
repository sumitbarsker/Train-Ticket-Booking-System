from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.trains import router as train_router
from backend.routes.search import router as search_router
from backend.routes.bookings import router as booking_router


app = FastAPI(
    title="RailConnect AI API",
    description="AI-Powered Train Ticket Booking and Recommendation System",
    version="1.0.0",
)


# React frontend ke liye CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# API routes
app.include_router(train_router)
app.include_router(search_router)
app.include_router(booking_router)


@app.get("/")
def root():
    return {
        "message": "RailConnect AI API is running",
        "status": "success",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RailConnect AI Backend",
    }
