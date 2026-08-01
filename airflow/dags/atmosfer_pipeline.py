from datetime import datetime
from airflow import DAG
from airflow.operators.bash import BashOperator

default_args = {
	"owner": "louis",
	"retries": 1,
}

with DAG(
	dag_id="atmosfer_pipeline",
	default_args=default_args,
	description="Ingestion CSV -> dbt run -> dbt test",
	schedule_interval="@daily",
	start_date=datetime(2026, 1, 1),
	catchup=False,
	tags=["atmosfer"],
) as dag:

	ingest = BashOperator(
		task_id="ingest_raw_data",
		bash_command="python /opt/airflow/scripts/ingest_raw.py",
	)

	dbt_run = BashOperator(
		task_id="dbt_run",
		bash_command="cd /opt/airflow/dbt && dbt run --profiles-dir /opt/airflow/dbt",
	)

	dbt_test = BashOperator(
		task_id="dbt_test",
		bash_command="cd /opt/airflow/dbt && dbt test --profiles-dir /opt/airflow/dbt",
	)

	ingest >> dbt_run >> dbt_test
