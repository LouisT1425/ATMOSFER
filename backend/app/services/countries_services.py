from database import SCHEMA

def get_countries(conn):
	cur = conn.cursor()
	cur.execute(f"SELECT DISTINCT country from {SCHEMA}.mart_country_emissions ORDER BY country")
	return [row["country"] for row in cur.fetchall()]
