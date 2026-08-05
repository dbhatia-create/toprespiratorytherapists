export const PRICING = {
  baseCity: 289,
  spotlightCity: 689,
} as const;

// New shape (BFF-backed wizard). `cities` + `featured` flag + opt-out list.
interface QuoteInputNew {
  cities: { city: string; state: string }[];
  featured: boolean;
  excludedFeatured: string[];
}

// Legacy shape kept for backward compatibility with existing callers (e.g.
// /api/apply route, lib/bff.ts's sendApplyToBff).
interface QuoteInputLegacy {
  locations: { city: string; state: string }[];
  featuredLocations: string[];
}

export type QuoteInput = QuoteInputNew | QuoteInputLegacy;

export interface QuoteLineItem {
  label: string;
  amount: number;
}

export interface Quote {
  lineItems: QuoteLineItem[];
  total: number;
}

/** Helper kept for legacy callers that build "city|state" keys. */
export function locationKey(loc: { city: string; state: string }): string {
  return `${loc.city}|${loc.state}`;
}

function isNewShape(input: QuoteInput): input is QuoteInputNew {
  return "cities" in input;
}

export function calculateQuote(input: QuoteInput): Quote {
  // Normalize both shapes into the same internal representation.
  let cities: { city: string; state: string }[];
  let featuredCount: number;

  if (isNewShape(input)) {
    cities = input.cities;
    if (input.featured && cities.length > 0) {
      featuredCount = cities.filter(
        (loc) => !input.excludedFeatured.includes(`${loc.city}|${loc.state}`),
      ).length;
    } else {
      featuredCount = 0;
    }
  } else {
    cities = input.locations;
    featuredCount = input.featuredLocations.length;
  }

  const lineItems: QuoteLineItem[] = [];
  const cityCount = Math.max(1, cities.length);

  lineItems.push({
    label: `Company listing × ${cityCount} cit${cityCount > 1 ? "ies" : "y"}`,
    amount: PRICING.baseCity * cityCount,
  });

  if (featuredCount > 0) {
    lineItems.push({
      label: `City Spotlight × ${featuredCount} cit${featuredCount > 1 ? "ies" : "y"}`,
      amount: PRICING.spotlightCity * featuredCount,
    });
  }

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);
  return { lineItems, total };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
