with source as (
	select * from {{ source('raw', 'raw_emissions') }}
),

cleaned as (
	select
		country,
		iso_code,
		cast(year as integer) as year,
		cast(population as bigint) as population,
		cast(gdp as double precision) as gdp,

		-- émissions CO2 par source
		cast(co2 as double precision) as co2,
		cast(coal_co2 as double precision) as coal_co2,
		cast(oil_co2 as double precision) as oil_co2,
		cast(gas_co2 as double precision) as gas_co2,
		cast(cement_co2 as double precision) as cement_co2,
		cast(flaring_co2 as double precision) as flaring_co2,
		cast(other_industry_co2 as double precision) as other_industry_co2,
		cast(land_use_change_co2 as double precision) as land_use_change_co2,

		-- autres gaz à effet de serre
		cast(methane as double precision) as methane,
		cast(nitrous_oxide as double precision) as nitrous_oxide,
		cast(total_ghg as double precision) as total_ghg,
		cast(total_ghg_excluding_lucf as double precision) as total_ghg_excluding_lucf,

		-- indicateurs par habitants
		cast(co2_per_capita as double precision) as co2_per_capita

	from source
	where country is not null
		and year is not null
)

select * from cleaned
