from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.trains import router as train_router
from backend.routes.search import router as search_router
from backend.routes.bookings import router as booking_router
from backend.routes.database_trains import router as database_train_router
from backend.routes.seats import router as seats_router
from backend.routes.recommendations import router as recommendation_router


app = FastAPI(
    title="RailConnect AI API",
    description="AI-Powered Train Ticket Booking and Recommendation System",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(train_router)
app.include_router(search_router)
app.include_router(booking_router)
app.include_router(database_train_router)
app.include_router(seats_router)
app.include_router(recommendation_router)


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
