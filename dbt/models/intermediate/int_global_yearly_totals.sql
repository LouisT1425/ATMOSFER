with stg as (
	select * from {{ ref('stg_emissions') }}
)

select
	year,
	sum(co2) as world_co2,
	sum(total_ghg) as world_total_ghg,
	count(distinct country) as nb_countries_reporting
from stg
where co2 is not null
group by year
order by year
