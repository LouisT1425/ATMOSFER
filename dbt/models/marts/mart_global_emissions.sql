select
    year,
    world_co2,
    world_total_ghg,
    nb_countries_reporting,
    coal_co2,
    oil_co2,
    gas_co2,
    cement_co2,
    flaring_co2,
    other_industry_co2,
    land_use_change_co2,
    methane,
    nitrous_oxide
from {{ ref('int_global_yearly_totals') }}
order by year
