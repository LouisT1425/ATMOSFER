from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import emissions, countries

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://172.22.61.4:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(emissions.router)
app.include_router(countries.router)

@app.get("/")
async def root():
    return {"message": "API CO2 en ligne (PostgreSQL + dbt)"}
