# ATMOSFER

A small data pipeline and API for exploring global CO2 and GHG emissions, broken down by country, year, and emission source (coal, oil, gas, cement, flaring, land use change).

Built as a personal project to get hands-on with a real ELT stack rather than another one-off script: Postgres as the warehouse, dbt for the transformation layer, Airflow for orchestration, FastAPI on top to serve the data.

## Motivation

The idea started from being annoyed that emissions data is genuinely hard to look at. It exists, it's public, organizations like Our World in Data do excellent work compiling it, but actually answering a simple question — how much does country X emit compared to country Y, which sector actually drives a given country's footprint, is a country's trend going up or down — usually means downloading a CSV with 80 columns and figuring it out yourself, or trusting whatever a news article decided to highlight that week.

I wanted that data sitting somewhere I could query it directly and get a straight answer, without re-deriving it by hand every time. That's the whole premise of ATMOSFER: take the raw numbers and make the actual questions (compare countries, see what a country's emissions are made of, track the global trend) answerable through a couple of API calls instead of a spreadsheet exercise. The data engineering stack came second, as the right way to do that properly instead of writing one more disposable script.

## What it does

Raw emissions data (CSV, ~50k rows / 79 columns from [Our World in Data's CO2 dataset](https://github.com/owid/co2-data)) gets loaded into Postgres, cleaned and modeled through three dbt layers, and served through a REST API. Airflow runs the whole thing on a daily schedule: ingest → transform → test.

```
owid-co2-data.csv
       │
       ▼
[ingest_raw_data]  Python script, pandas -> Postgres (raw_emissions)
       │
       ▼
[dbt_run]          staging -> intermediate -> marts
       │
       ▼
[dbt_test]         not_null / unique checks on the marts
       │
       ▼
FastAPI            reads directly from the mart tables
```

The three steps above are one Airflow DAG (`atmosfer_pipeline`), scheduled `@daily`.

## Why this stack

The point of this project was specifically to practice the raw → staging → intermediate → marts pattern and have Airflow own the scheduling, instead of doing everything by hand in a Python script like most tutorial projects do. A few decisions worth mentioning:

- **Raw and transformed data live in separate schemas** (`public` for the raw table, `dbt_dev` for everything dbt builds). Keeps "what came from the source" and "what dbt computed" physically separate, not just a naming convention.
- **Staging models are views, marts are tables.** Staging stays cheap and always in sync with the source; marts are materialized because the API reads them directly and shouldn't pay for recomputation on every request.
- **The ingestion script uses `TRUNCATE + append`, not `DROP + CREATE`.** Once dbt has views depending on `raw_emissions`, dropping and recreating that table on every run fails (Postgres won't drop a table with dependent views). Truncating and re-inserting avoids that without touching the dependent views.
- **FastAPI has zero transformation logic.** Every route is a straight SQL query against a mart table. All the actual data modeling — per-source shares, yearly aggregates, whatever — lives in dbt where it's tested and versioned, not scattered across Python service functions.

## Stack

- PostgreSQL 16 — one instance for app data, a separate one for Airflow's own metadata
- dbt-core 1.8 (dbt-postgres adapter)
- Airflow 2.9, LocalExecutor, custom image with dbt/pandas baked in
- FastAPI + psycopg2
- Everything containerized, one `docker-compose.yml`

## Project structure

```
atmosfer/
├── airflow/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── dags/
│       └── atmosfer_pipeline.py
├── backend/
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── routers/
│       └── services/
├── frontend/                 # React + Vite dashboard, consumes the API above
│   └── src/
│       ├── api/
│       ├── components/
│       └── theme/
├── dbt/
│   ├── dbt_project.yml
│   ├── profiles.yml
│   └── models/
│       ├── staging/          # stg_emissions: typing + cleanup of the raw table
│       ├── intermediate/     # per-country and global yearly aggregates
│       └── marts/            # what the API actually queries
├── scripts/
│   └── ingest_raw.py
├── data/
│   └── raw/                  # CSV lives here, not tracked in git
└── docker-compose.yml
```

## Data model

- `stg_emissions` — the raw CSV, cast to proper types, filtered to rows with a country and a year. ~15 columns kept out of 79; the rest weren't relevant to the routes below.
- `int_country_yearly_summary` — one row per country/year, with each emission source's share of that country's total CO2 for the year.
- `int_global_yearly_totals` — world CO2/GHG totals per year (sourced from OWID's own `World` row, not summed across every entity — the raw dataset also carries continents, income groups, and the `World` row itself as regular rows, so a naive `SUM` triple-counts), plus a count of reporting countries and a global sector breakdown.
- `mart_country_emissions` / `mart_global_emissions` — same shape as the two models above, materialized as tables for the API to hit directly. `mart_country_emissions` carries `iso_code` (`NULL` for continents/income-group aggregates, populated for the 215 real countries) and the seven emission-source columns (coal, oil, gas, cement, flaring, other industry, land-use change).

## API

| Route | Description |
|---|---|
| `GET /countries` | Real countries in the dataset (`{country, iso_code}`), aggregates excluded |
| `GET /emissions/{country}` | Yearly emissions for one country, incl. per-sector breakdown; optional `?date=YYYY` |
| `GET /global_emissions` | World CO2/GHG totals by year |
| `GET /global_emissions/sectors?year=YYYY` | World emissions broken down by sector for one year (latest if omitted) |
| `GET /compare?countries=X&countries=Y&metric=co2` | Side-by-side metric by year for multiple countries; `metric` is any column in `services/metrics.py`'s whitelist (co2, total_ghg, a sector, methane, nitrous_oxide) |
| `GET /top-countries?limit=N&since=YYYY&metric=co2` | Top N emitters by metric; summed across all years, or from `since` onward |
| `GET /map?year=YYYY` | Per-capita + total emissions for every country, for a given year (latest if omitted) |
| `GET /shares?year=YYYY` | Each country's CO2 for a given year, for share-of-global charts |

## Running it

Requires Docker and Docker Compose. No local Python setup needed to run the pipeline — everything happens inside containers.

```bash
git clone https://github.com/LouisT1425/ATMOSFER.git
cd ATMOSFER
```

Download the dataset and drop it in `data/raw/`:
```bash
curl -L -o data/raw/owid-co2-data.csv https://github.com/owid/co2-data/raw/master/owid-co2-data.csv
```

Start everything:
```bash
docker compose up -d --build
```

Airflow UI: `http://localhost:8080` (`admin` / `admin`). Trigger `atmosfer_pipeline` manually the first time instead of waiting for the daily schedule.

The API isn't containerized yet (see below), so run it separately once the pipeline has populated the marts:
```bash
python3 -m venv venv && source venv/bin/activate
pip install -r backend/requirements.txt
cd backend/app && uvicorn main:app --reload
```

Docs at `http://127.0.0.1:8000/docs`.

### Frontend

React + Vite dashboard (country/sector breakdowns, cross-country comparison, share-of-global donuts, top emitters, a per-capita world map). Needs the API above running on `http://localhost:8000` (CORS is already scoped to `http://localhost:5173`, Vite's default port).

```bash
cd frontend
npm install --legacy-peer-deps   # react-simple-maps hasn't updated its React peer range for React 19 yet
npm run dev
```

Open `http://localhost:5173`.

## Known limitations / what's not done

- FastAPI isn't in docker-compose yet — it's the odd one out, still run manually. Next step is a proper Dockerfile for it and wiring it into the same network as everything else.
- Frontend isn't containerized either, and its production bundle is ~750 kB (mostly Recharts + the map's topojson/d3 stack + three font families) — fine for `npm run dev`, but would be worth code-splitting (lazy-load the map) before actually deploying it.
- No CI. Would want GitHub Actions running `dbt test` and a pytest suite against the API on every push.
- No incremental loading — the ingestion script truncates and reloads the full CSV every run, which is fine at this data volume but wouldn't scale to a real streaming or high-frequency source.
- File permissions between the host and the Airflow containers (UID 50000) need `chown` on `dbt/logs` and `dbt/target` the first time you run things locally outside Docker — a rough edge of mixing local dbt runs with containerized ones.

## License

MIT
