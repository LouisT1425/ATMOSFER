from database import SCHEMA

def get_countries(conn):
    cur = conn.cursor()
    cur.execute(f"""
        SELECT DISTINCT country, iso_code
        FROM {SCHEMA}.mart_country_emissions
        WHERE iso_code IS NOT NULL
        ORDER BY country
    """)
    return cur.fetchall()
