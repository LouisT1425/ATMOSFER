"""Shared whitelist of emissions metrics exposed to the API.

Column names are interpolated into raw SQL by the query builders in this
package, so every metric key users can request MUST be validated against
this whitelist first -- never interpolate a client-supplied string directly.
"""

from fastapi import HTTPException

# key -> (sql column, human label)
SECTOR_METRICS = {
    "coal_co2": "Charbon",
    "oil_co2": "Pétrole",
    "gas_co2": "Gaz",
    "cement_co2": "Ciment",
    "flaring_co2": "Torchage",
    "other_industry_co2": "Autre industrie",
    "land_use_change_co2": "Changement d'usage des sols",
}

GHG_METRICS = {
    "methane": "Méthane",
    "nitrous_oxide": "Protoxyde d'azote",
}

# Metrics that represent an absolute volume (safe to SUM/compare across countries)
ABSOLUTE_METRICS = {
    "co2": "CO2 total",
    "total_ghg": "GES total",
    **SECTOR_METRICS,
    **GHG_METRICS,
}

# Metrics that only make sense per-country (not summable)
INTENSITY_METRICS = {
    "co2_per_capita": "CO2 par habitant",
}

ALL_METRICS = {**ABSOLUTE_METRICS, **INTENSITY_METRICS}


def validate_metric(metric: str, allowed: dict = ABSOLUTE_METRICS) -> str:
    if metric not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"metric invalide: {metric!r}. Valeurs possibles: {sorted(allowed)}",
        )
    return metric
