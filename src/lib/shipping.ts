import type { ShippingZone } from "./types";
import { roundCurrency } from "./pricing";

const COUNTRY_ALIASES: Record<string, string[]> = {
  AT: ["AT", "Österreich", "Oesterreich", "Austria"],
  DE: ["DE", "Deutschland", "Germany"],
  CH: ["CH", "Schweiz", "Switzerland"],
};

function normalizeCountry(country: string): string {
  const c = country.trim();
  for (const [code, aliases] of Object.entries(COUNTRY_ALIASES)) {
    if (aliases.some((a) => a.toLowerCase() === c.toLowerCase())) return code;
  }
  return c.toUpperCase();
}

function zipInRange(zip: string, from?: string, to?: string): boolean {
  if (!from && !to) return true;
  const z = zip.replace(/\s/g, "");
  if (from && z < from) return false;
  if (to && z > to) return false;
  return true;
}

function zipMatchesPrefix(zip: string, prefixes?: string[]): boolean {
  if (!prefixes || prefixes.length === 0) return true;
  const z = zip.replace(/\s/g, "");
  return prefixes.some((p) => z.startsWith(p));
}

function zoneMatches(
  zone: ShippingZone,
  country: string,
  zip: string
): boolean {
  const norm = normalizeCountry(country);
  const countryMatch = zone.countries.some(
    (c) => normalizeCountry(c) === norm
  );
  if (!countryMatch) return false;
  if (!zipMatchesPrefix(zip, zone.zipPrefixes)) return false;
  if (!zipInRange(zip, zone.zipFrom, zone.zipTo)) return false;
  return true;
}

export function calculateShipping(
  zones: ShippingZone[],
  subtotalGross: number,
  country: string,
  zip: string,
  distanceKm = 0
): number {
  const active = zones.filter((z) => z.active).sort((a, b) => a.sortOrder - b.sortOrder);

  let matched: ShippingZone | undefined;
  for (const zone of active) {
    if (zoneMatches(zone, country, zip)) {
      matched = zone;
      break;
    }
  }

  if (!matched) {
    const fallback = active.find((z) => z.countries.includes("*"));
    matched = fallback ?? active[active.length - 1];
  }

  if (!matched) return 0;

  if (matched.freeFrom != null && subtotalGross >= matched.freeFrom) {
    return 0;
  }

  let cost = matched.baseCost;
  if (matched.costPerKm && distanceKm > 0) {
    cost += matched.costPerKm * distanceKm;
  }

  return roundCurrency(cost);
}

export const DEFAULT_SHIPPING_ZONES: Omit<ShippingZone, "id">[] = [
  {
    name: "Österreich – Standard",
    countries: ["AT", "Österreich"],
    baseCost: 4.9,
    freeFrom: 50,
    sortOrder: 1,
    active: true,
  },
  {
    name: "Österreich – Schneebergland (NÖ)",
    countries: ["AT", "Österreich"],
    zipPrefixes: ["26", "27", "28"],
    baseCost: 2.9,
    freeFrom: 35,
    costPerKm: 0.15,
    sortOrder: 0,
    active: true,
  },
  {
    name: "Deutschland",
    countries: ["DE", "Deutschland"],
    baseCost: 9.9,
    freeFrom: 80,
    sortOrder: 2,
    active: true,
  },
  {
    name: "Schweiz",
    countries: ["CH", "Schweiz"],
    baseCost: 14.9,
    sortOrder: 3,
    active: true,
  },
];

export const COUNTRIES = [
  { value: "Österreich", label: "Österreich" },
  { value: "Deutschland", label: "Deutschland" },
  { value: "Schweiz", label: "Schweiz" },
];
