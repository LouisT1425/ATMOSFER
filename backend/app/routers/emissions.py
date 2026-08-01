from fastapi import APIRouter, Depends, Query
from database import get_db
from services.emissions_services import (
    get_country_emissions,
    get_global_emissions,
    get_global_sectors,
    get_compare,
    get_top_countries,
    get_map,
    get_shares,
)

router = APIRouter()

@router.get("/emissions/{country}")
def emissions(country: str, date: int | None = None, conn=Depends(get_db)):
    return get_country_emissions(conn, country, date)

@router.get("/global_emissions")
def global_emissions(conn=Depends(get_db)):
    return get_global_emissions(conn)

@router.get("/global_emissions/sectors")
def global_emissions_sectors(year: int | None = None, conn=Depends(get_db)):
    return get_global_sectors(conn, year)

@router.get("/compare")
def compare(countries: list[str] = Query(...), metric: str = "co2", conn=Depends(get_db)):
    return get_compare(countries, metric, conn)

@router.get("/top-countries")
def top_countries(limit: int, metric: str = "co2", since: int | None = None, conn=Depends(get_db)):
    return get_top_countries(limit, metric, since, conn)

@router.get("/map")
def map_route(year: int | None = None, conn=Depends(get_db)):
    return get_map(conn, year)

@router.get("/shares")
def shares(year: int | None = None, conn=Depends(get_db)):
    return get_shares(conn, year)
