from fastapi import APIRouter, Query

from backend.routes.trains import trains


router = APIRouter(
    prefix="/search",
    tags=["Train Search"],
)


@router.get("/trains")
def search_trains(
    source: str = Query(..., min_length=2),
    destination: str = Query(..., min_length=2),
):
    source = source.strip().lower()
    destination = destination.strip().lower()

    results = [
        train
        for train in trains
        if train["source"].lower() == source
        and train["destination"].lower() == destination
    ]

    return {
        "source": source.title(),
        "destination": destination.title(),
        "count": len(results),
        "trains": results,
    }
