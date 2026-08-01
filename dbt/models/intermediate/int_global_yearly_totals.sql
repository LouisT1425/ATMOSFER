with stg as (
    select * from {{ ref('stg_emissions') }}
)

select
    year,
    co2                 as world_co2,
    total_ghg           as world_total_ghg,
    coal_co2,
    oil_co2,
    gas_co2,
    cement_co2,
    flaring_co2,
    other_industry_co2,
    land_use_change_co2,
    methane,
    nitrous_oxide,
    (
        select count(distinct country)
        from stg s2
        where s2.year = stg.year
          and s2.co2 is not null
          and s2.iso_code is not null
          and s2.iso_code != ''
    ) as nb_countries_reporting
from stg
where country = 'World'
order by year
