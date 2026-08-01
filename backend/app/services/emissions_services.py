from database import SCHEMA

def get_country_emissions(conn, country, date=None):
    cur = conn.cursor()
    if date is not None:
        cur.execute(
            f"""SELECT year, co2, co2_per_capita, total_ghg
                FROM {SCHEMA}.mart_country_emissions
                WHERE country = %s AND year = %s""",
            (country, date)
        )
    else:
        cur.execute(
            f"""SELECT year, co2, co2_per_capita, total_ghg
                FROM {SCHEMA}.mart_country_emissions
                WHERE country = %s
                ORDER BY year""",
            (country,)
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


def get_compare(countries, conn):
    cur = conn.cursor()
    placeholders = ",".join(["%s"] * len(countries))
    cur.execute(
        f"""SELECT year, country, co2
            FROM {SCHEMA}.mart_country_emissions
            WHERE country IN ({placeholders})
            ORDER BY year""",
        countries
    )
    rows = cur.fetchall()

    by_year = {}
    for row in rows:
        by_year.setdefault(row["year"], {"year": row["year"]})[row["country"]] = row["co2"]

    return list(by_year.values())


def get_top_countries(limit, since, conn):
    cur = conn.cursor()
    if since is not None:
        cur.execute(
            f"""SELECT country, SUM(co2) AS total_emissions
                FROM {SCHEMA}.mart_country_emissions
                WHERE year >= %s
                GROUP BY country
                ORDER BY total_emissions DESC
                LIMIT %s""",
            (since, limit)
        )
    else:
        cur.execute(
            f"""SELECT country, SUM(co2) AS total_emissions
                FROM {SCHEMA}.mart_country_emissions
                GROUP BY country
                ORDER BY total_emissions DESC
                LIMIT %s""",
            (limit,)
        )
    return cur.fetchall()
