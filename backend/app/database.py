import os
from dotenv import load_dotenv
import psycopg2
import psycopg2.extras

load_dotenv()

DB_CONFIG = dict(
	host=os.getenv("DB_HOST"),
	port=os.getenv("DB_PORT"),
	dbname=os.getenv("DB_NAME"),
	user=os.getenv("DB_USER"),
	password=os.getenv("DB_PASSWORD")
)

SCHEMA = os.getenv("DB_SCHEMA","dbt_dev")

def get_db():
	conn = psycopg2.connect(**DB_CONFIG, cursor_factory=psycopg2.extras.RealDictCursor)
	try:
		yield conn
	finally:
		conn.close()
