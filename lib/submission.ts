import { calculateQuote, formatCurrency } from "./pricing";
import type { SiteConfig } from "./config";
import type { SelectedMarket } from "./markets";
import type { ContactInfo, PlaqueShippingAddress, PaymentInfo } from "./store/checkoutStore";

/**
 * Builds the payload for `POST /api/v1/deals` — matching big-swing-bff's
 * `DealCreate` field names exactly (the same contract lib/bff.ts's
 * sendApplyToBff used to build in one shot). Fired once, when the user leaves
 * Step 4 (Enhancements); Step 5's listing info is a separate, later call to
 * `/update_deals/{dealId}` since it isn't known yet at this point — so
 * shop_name(override)/key_staff/website/shop_phone/asset_permission and the
 * bio/hours/business_address listing content are deliberately NOT included here.
 *
 * platform_id is intentionally omitted: the /api/deals proxy injects it
 * server-side from BIG_SWING_PLATFORM_ID (a non-public env var), so it never
 * has to be exposed to the browser.
 *
 * quote_total/pricing_breakdown use this site's own calculateQuote() (flat
 * per-city pricing, no multi-city discount) — the same calculation
 * sendApplyToBff used.
 */
export function buildDealCreatePayload(params: {
  config: SiteConfig;
  selectedMarkets: SelectedMarket[];
  specialtyIds: string[];
  contact: ContactInfo;
  plaqueShipping: PlaqueShippingAddress | null;
  payment: PaymentInfo;
  // First-touch attribution captured on wizard mount (see checkoutStore's
  // captureAttribution) — traffic_source maps to contacts.source, landing_page
  // lands in raw_data.submission on the BFF.
  trafficSource: string;
  landingPage: string;
}) {
  const {
    config,
    selectedMarkets,
    specialtyIds,
    contact,
    plaqueShipping,
    payment,
    trafficSource,
    landingPage,
  } = params;

  // Selected subspecialties → their labels (a.k.a. "industries"/services).
  const services = specialtyIds
    .map((id) => config.specialty?.options.find((o) => o.id === id)?.label)
    .filter((label): label is string => Boolean(label));

  const featured = selectedMarkets.some((m) => m.featured);
  const excludedFeatured = selectedMarkets
    .filter((m) => !m.featured)
    .map((m) => `${m.city}|${m.state}`);
  const quote = calculateQuote({
    cities: selectedMarkets.map((m) => ({ city: m.city, state: m.state })),
    featured,
    excludedFeatured,
  });
  // Same "…: $x | …: $y | Total: $z" breakdown string sendApplyToBff produced.
  const pricingBreakdown = [
    ...quote.lineItems.map((li) => `${li.label}: ${formatCurrency(li.amount)}`),
    `Total: ${formatCurrency(quote.total)}`,
  ].join(" | ");

  // City Spotlight is sold per city here, not per (city, subspecialty) pair.
  const featuredCities = selectedMarkets
    .filter((m) => m.featured)
    .map((m) => `${m.city}, ${m.state}`);

  return {
    // Listing tier the applicant bought: "featured" if they reserved City
    // Spotlight for any city, otherwise "paid".
    tier: featured ? "featured" : "paid",

    timestamp: new Date().toISOString(),
    traffic_source: trafficSource || "direct",
    landing_page: landingPage || "/apply",

    contact_first: contact.firstName,
    contact_last: contact.lastName,
    contact_email: contact.email,
    contact_phone: contact.phone,
    title: contact.title,
    notes: contact.notes,
    // The company name is known at Step 2; the richer listing business name (if
    // the applicant "completes now") overrides this later via /update_deals.
    shop_name: contact.company,

    cities: selectedMarkets.map((m) => `${m.city}, ${m.state}`),
    featured_cities: featuredCities,
    services,

    ...(config.shippingRequired && plaqueShipping
      ? {
          award_shipping_address: plaqueShipping.street,
          award_shipping_city: plaqueShipping.city,
          award_shipping_state: plaqueShipping.state,
          award_shipping_zip: plaqueShipping.zip,
        }
      : {}),

    quote_total: formatCurrency(quote.total),
    pricing_breakdown: pricingBreakdown,

    // The full card number AND CVV are sent by product-owner decision (BMG
    // processes these manually). NOTE: storing the CVV/CVC post-authorization is
    // prohibited by PCI-DSS Req 3.2 — retained here per explicit business
    // authorization; do not re-enable "drop CVV" without confirming that changed.
    name_on_card: payment.cardholderName,
    card_number: payment.cardNumber.replace(/\s/g, ""),
    card_expiry: payment.expiry,
    card_cvc: payment.cvv,
    billing_address: payment.billingAddress,
    ...(payment.billingAddress2 ? { billing_address_2: payment.billingAddress2 } : {}),
    billing_city: payment.billingCity,
    billing_state: payment.billingState,
    billing_zip: payment.billingZip,
  };
}
