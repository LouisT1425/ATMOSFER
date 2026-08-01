from database import SCHEMA

ALLOWED_METRICS = {
    "co2", "total_ghg", "coal_co2", "oil_co2", "gas_co2",
    "cement_co2", "flaring_co2", "other_industry_co2",
    "land_use_change_co2", "methane", "nitrous_oxide",
}


def _validate_metric(metric: str) -> str:
    if metric not in ALLOWED_METRICS:
        raise ValueError(f"Invalid metric: {metric}")
    return metric


def get_country_emissions(conn, country, date=None):
    cur = conn.cursor()
    if date is not None:
        cur.execute(
            f"""SELECT year, iso_code, population, co2, co2_per_capita, total_ghg,
                       coal_co2, oil_co2, gas_co2, cement_co2, flaring_co2,
                       other_industry_co2, land_use_change_co2, methane, nitrous_oxide
                FROM {SCHEMA}.mart_country_emissions
                WHERE country = %s AND year = %s""",
            (country, date),
        )
    else:
        cur.execute(
            f"""SELECT year, iso_code, population, co2, co2_per_capita, total_ghg,
                       coal_co2, oil_co2, gas_co2, cement_co2, flaring_co2,
                       other_industry_co2, land_use_change_co2, methane, nitrous_oxide
                FROM {SCHEMA}.mart_country_emissions
                WHERE country = %s
                ORDER BY year""",
            (country,),
        )
    return cur.fetchall()


def get_global_emissions(conn):
    cur = conn.cursor()
    cur.execute(
        f"""SELECT year, world_co2, world_total_ghg, nb_countries_reporting
            FROM {SCHEMA}.mart_global_emissions
            ORDER BY year"""
    )
    return cur.fetchall()


def get_global_sectors(conn, year=None):
    cur = conn.cursor()
    cur.execute(
        f"""SELECT year, world_co2, world_total_ghg, coal_co2, oil_co2, gas_co2,
                   cement_co2, flaring_co2, other_industry_co2, land_use_change_co2,
                   methane, nitrous_oxide
            FROM {SCHEMA}.mart_global_emissions
            WHERE year = COALESCE(%s, (SELECT max(year) FROM {SCHEMA}.mart_global_emissions))"""
        ,
        (year,),
    )
    return cur.fetchone()


def get_compare(countries, metric, conn):
    metric = _validate_metric(metric)
    cur = conn.cursor()
    placeholders = ",".join(["%s"] * len(countries))
    cur.execute(
        f"""SELECT year, country, {metric} AS value
            FROM {SCHEMA}.mart_country_emissions
            WHERE country IN ({placeholders})
            ORDER BY year""",
        countries,
    )
    rows = cur.fetchall()

    by_year = {}
    for row in rows:
        by_year.setdefault(row["year"], {"year": row["year"]})[row["country"]] = row["value"]

    return list(by_year.values())


def get_top_countries(limit, metric, since, conn):
    metric = _validate_metric(metric)
    cur = conn.cursor()
    if since is not None:
        cur.execute(
            f"""SELECT country, iso_code, SUM({metric}) AS total_emissions
                FROM {SCHEMA}.mart_country_emissions
                WHERE year >= %s AND {metric} IS NOT NULL
                GROUP BY country, iso_code
                ORDER BY total_emissions DESC
                LIMIT %s""",
            (since, limit),
        )
    else:
        cur.execute(
            f"""SELECT country, iso_code, SUM({metric}) AS total_emissions
                FROM {SCHEMA}.mart_country_emissions
                WHERE {metric} IS NOT NULL
                GROUP BY country, iso_code
                ORDER BY total_emissions DESC
                LIMIT %s""",
            (limit,),
        )
    return cur.fetchall()


def get_map(conn, year=None):
    cur = conn.cursor()
    cur.execute(
        f"""SELECT country, iso_code, year, population, co2, co2_per_capita, total_ghg
            FROM {SCHEMA}.mart_country_emissions
            WHERE year = COALESCE(%s, (SELECT max(year) FROM {SCHEMA}.mart_country_emissions))
              AND iso_code IS NOT NULL""",
        (year,),
    )
    return cur.fetchall()


def get_shares(conn, year=None):
    cur = conn.cursor()
    cur.execute(
        f"""SELECT country, iso_code, year, co2
            FROM {SCHEMA}.mart_country_emissions
            WHERE year = COALESCE(%s, (SELECT max(year) FROM {SCHEMA}.mart_country_emissions))
              AND co2 IS NOT NULL
            ORDER BY co2 DESC""",
        (year,),
    )
    return cur.fetchall()
