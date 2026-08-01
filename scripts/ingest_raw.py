import os
import pandas as pd
from sqlalchemy import create_engine, text, inspect

CSV_PATH = "/opt/airflow/data/raw/owid-co2-data.csv"
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_URI = f"postgresql+psycopg2://atmosfer:atmosfer_dev@{DB_HOST}:5432/atmosfer"

def main():
    print("Lecture du CSV...")
    df = pd.read_csv(CSV_PATH)
    print(f"{len(df)} lignes, {len(df.columns)} colonnes")

    engine = create_engine(DB_URI)
    inspector = inspect(engine)

    print("Ecriture dans PostgreSQL (table raw_emissions)...")
    if inspector.has_table("raw_emissions"):
        # La table existe déjà et des vues dbt en dépendent : on vide plutôt que de la recréer
        with engine.begin() as conn:
            conn.execute(text("TRUNCATE TABLE raw_emissions"))
        df.to_sql("raw_emissions", engine, if_exists="append", index=False, chunksize=5000)
    else:
        # Premier lancement : la table n'existe pas encore, on peut la créer normalement
        df.to_sql("raw_emissions", engine, if_exists="replace", index=False, chunksize=5000)

    print("Terminé.")

if __name__ == "__main__":
    main()
