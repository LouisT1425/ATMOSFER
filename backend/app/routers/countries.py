from fastapi import APIRouter, Depends
from database import get_db
from services.countries_services import get_countries

router = APIRouter()

# Countries available in the dataset
@router.get("/countries")
async def countries(conn = Depends(get_db)):
    return get_countries(conn)
