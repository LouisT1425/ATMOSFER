export interface Country {
  country: string;
  iso_code: string;
}

export interface CountryEmissionRow {
  year: number;
  iso_code: string;
  population: number | null;
  co2: number | null;
  co2_per_capita: number | null;
  total_ghg: number | null;
  coal_co2: number | null;
  oil_co2: number | null;
  gas_co2: number | null;
  cement_co2: number | null;
  flaring_co2: number | null;
  other_industry_co2: number | null;
  land_use_change_co2: number | null;
  methane: number | null;
  nitrous_oxide: number | null;
}

export interface GlobalEmissionRow {
  year: number;
  world_co2: number;
  world_total_ghg: number;
  nb_countries_reporting: number;
}

export interface GlobalSectors {
  year: number;
  world_co2: number;
  world_total_ghg: number;
  coal_co2: number;
  oil_co2: number;
  gas_co2: number;
  cement_co2: number;
  flaring_co2: number;
  other_industry_co2: number;
  land_use_change_co2: number;
  methane: number;
  nitrous_oxide: number;
}

/** { year, [countryName]: value }[] */
export type CompareRow = { year: number } & Record<string, number | undefined>;

export interface TopCountryRow {
  country: string;
  iso_code: string;
  total_emissions: number;
}

export interface MapRow {
  country: string;
  iso_code: string;
  year: number;
  population: number | null;
  co2: number | null;
  co2_per_capita: number | null;
  total_ghg: number | null;
}

export interface ShareRow {
  country: string;
  iso_code: string;
  year: number;
  co2: number;
}

export const SECTOR_METRICS = [
  { key: "coal_co2", label: "Charbon" },
  { key: "oil_co2", label: "Pétrole" },
  { key: "gas_co2", label: "Gaz" },
  { key: "cement_co2", label: "Ciment" },
  { key: "flaring_co2", label: "Torchage" },
  { key: "other_industry_co2", label: "Autre industrie" },
  { key: "land_use_change_co2", label: "Usage des sols" },
] as const;

export const COMPARE_METRICS = [
  { key: "co2", label: "CO2 total" },
  { key: "total_ghg", label: "GES total" },
  ...SECTOR_METRICS,
  { key: "methane", label: "Méthane" },
  { key: "nitrous_oxide", label: "Protoxyde d'azote" },
] as const;

export type SectorKey = (typeof SECTOR_METRICS)[number]["key"];
export type MetricKey = (typeof COMPARE_METRICS)[number]["key"];
