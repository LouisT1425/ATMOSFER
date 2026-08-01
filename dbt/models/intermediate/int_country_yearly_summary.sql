with stg as (
	select * from {{ ref('stg_emissions') }}
),

summary as (
	select
		country,
		iso_code,
		year,
		population,
		gdp,
		co2,
		co2_per_capita,
		total_ghg,
		methane,
		nitrous_oxide,

		coal_co2,
		oil_co2,
		gas_co2,
		cement_co2,
		flaring_co2,
		other_industry_co2,
		land_use_change_co2,

		case when co2 > 0 then round((coal_co2 / co2 * 100)::numeric, 2) end as coal_share_pct,
		case when co2 > 0 then round((oil_co2 / co2 * 100)::numeric, 2) end as oil_share_pct,
		case when co2 > 0 then round((gas_co2 / co2 * 100)::numeric, 2) end as gas_share_pct

	from stg
	where co2 is not null
)

select * from summary
