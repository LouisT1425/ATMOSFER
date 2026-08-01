from fastapi import APIRouter, Depends, Query
from database import get_db
from services.emissions_services import get_country_emissions, get_global_emissions, get_compare, get_top_countries

router = APIRouter()

# Emission by country (optional: by specific year)
@router.get("/emissions/{country}")
def emissions(country: str, date: int | None = None, conn = Depends(get_db)):
    return get_country_emissions(conn, country, date)

# Global emissions by country
@router.get("/global_emissions")
def global_emissions(conn = Depends(get_db)):
    return get_global_emissions(conn)

# Compares the emissions of x countries, sorted by year.
# Request : http://127.0.0.1:8000/compare?countries=France&countries=China
@router.get("/compare")
def compare(countries: list[str] = Query(...), conn = Depends(get_db)):
    return get_compare(countries, conn)

@router.get("/top-countries")
def top_countries(limit: int, since: int | None=None, conn = Depends(get_db)):
    return get_top_countries(limit, since, conn) 
