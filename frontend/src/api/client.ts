const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, params?: Record<string, string | number | string[] | undefined>): Promise<T> {
  const url = new URL(BASE_URL + path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const v of value) url.searchParams.append(key, v);
      } else {
        url.searchParams.append(key, String(value));
      }
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, detail || res.statusText);
  }
  return res.json() as Promise<T>;
}

import type {
  Country,
  CountryEmissionRow,
  GlobalEmissionRow,
  GlobalSectors,
  CompareRow,
  TopCountryRow,
  MapRow,
  ShareRow,
} from "./types";

export const api = {
  countries: () => request<Country[]>("/countries"),
  countryEmissions: (country: string) =>
    request<CountryEmissionRow[]>(`/emissions/${encodeURIComponent(country)}`),
  globalEmissions: () => request<GlobalEmissionRow[]>("/global_emissions"),
  globalSectors: (year?: number) => request<GlobalSectors>("/global_emissions/sectors", { year }),
  compare: (countries: string[], metric: string) =>
    request<CompareRow[]>("/compare", { countries, metric }),
  topCountries: (limit: number, metric: string, since?: number) =>
    request<TopCountryRow[]>("/top-countries", { limit, metric, since }),
  map: (year?: number) => request<MapRow[]>("/map", { year }),
  shares: (year?: number) => request<ShareRow[]>("/shares", { year }),
};
