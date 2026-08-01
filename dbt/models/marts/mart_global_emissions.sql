select
	year,
	world_co2,
	world_total_ghg,
	nb_countries_reporting
from {{ ref('int_global_yearly_totals') }}
order by year
