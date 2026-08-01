import pandas as pd
from sqlalchemy import create_engine

CSV_PATH = "data/raw/owid-co2-data.csv"
DB_URI = "postgresql+psycopg2://atmosfer:atmosfer_dev@localhost:5432/atmosfer"

def main():
	print("Lecture du CSV...")
	df = pd.read_csv(CSV_PATH)
	print(f"{len(df)} lignes, {len(df.columns)} colonnes")

	engine = create_engine(DB_URI)

	print("Ecriture dans PostgreSQL (table raw_emissions)...")
	df.to_sql(
		"raw_emissions",
		engine,
		if_exists="replace",
		index=False,
		chunksize=5000,
	)
	print("Terminé.")

if __name__ == "__main__":
	main()
