import { z } from "zod";
import { topRespiratoryTherapistsConfig, type SiteConfig } from "./config";
import { isValidLuhn } from "./luhn";

const stateSchema = z.string().min(2, "Select a state");
const zipSchema = z.string().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code");
const phoneSchema = z.string().min(10, "Enter a valid phone number");

/** True if "MM/YY" is this month or later (i.e. not yet expired). */
function isExpiryInFuture(value: string): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

// ---------------------------------------------------------------------------
// Screen 1 — Select Market
// ---------------------------------------------------------------------------

const selectedMarketSchema = z.object({
  marketId: z.string(),
  city: z.string(),
  state: z.string(),
  featured: z.boolean(),
});

export const marketSelectionSchema = z
  .object({
    selectedMarkets: z.array(selectedMarketSchema).min(1, "Select at least one market to continue"),
    specialtyIds: z.array(z.string()),
    specialtyRequired: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.specialtyRequired && data.specialtyIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["specialtyIds"],
        message: "Select at least one industry to continue",
      });
    }
  });

export type MarketSelectionData = z.infer<typeof marketSelectionSchema>;

// ---------------------------------------------------------------------------
// Screen 2 — Contact Information
// ---------------------------------------------------------------------------

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  title: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  email: z.string().email("Enter a valid email address"),
  phone: phoneSchema,
  notes: z.string().optional(),
  plaqueStreet: z.string().min(3, "Street address is required"),
  plaqueCity: z.string().min(1, "City is required"),
  plaqueState: stateSchema,
  plaqueZip: zipSchema,
});

export type ContactData = z.infer<typeof contactSchema>;

// ---------------------------------------------------------------------------
// Screen 3 — Payment (extended with full billing address)
// ---------------------------------------------------------------------------

export const paymentSchema = z.object({
  cardholderName: z.string().min(2, "Name on card is required"),
  cardNumber: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .pipe(
      z
        .string()
        .refine((v) => v.length >= 13 && v.length <= 19, "Enter a valid card number")
        .refine(isValidLuhn, "Enter a valid card number"),
    ),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format")
    .refine(isExpiryInFuture, "This card has expired"),
  cvv: z.string().min(3, "Enter a valid security code").max(4),
  billingAddress: z.string().min(5, "Billing address is required"),
  billingAddress2: z.string().optional(),
  billingCity: z.string().min(2, "Billing city is required"),
  billingState: stateSchema,
  billingZip: zipSchema,
});

export type PaymentData = z.infer<typeof paymentSchema>;

// ---------------------------------------------------------------------------
// Screen 5 — Listing Information (Complete Now vs Complete Later)
// ---------------------------------------------------------------------------

const businessAddressSchema = z.object({
  street: z.string().min(3, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: stateSchema,
  zip: zipSchema,
});

const businessHoursDaySchema = z.object({
  open: z.boolean(),
  from: z.string(),
  to: z.string(),
});

const businessHoursSchema = z.object({
  mon: businessHoursDaySchema,
  tue: businessHoursDaySchema,
  wed: businessHoursDaySchema,
  thu: businessHoursDaySchema,
  fri: businessHoursDaySchema,
  sat: businessHoursDaySchema,
  sun: businessHoursDaySchema,
});

// Plain object (no .superRefine) so it can be used as a discriminatedUnion
// member — zod requires union members to be ZodObject, not ZodEffects.
function buildListingInfoNowObjectSchema(config: SiteConfig) {
  const bioMaxChars = config.listingFields.bioMaxChars;
  return z.object({
    listingChoice: z.literal("now"),
    businessName: z.string().min(2, "Business/firm name is required"),
    people: z.string().min(1, `${config.listingFields.peopleLabel} is required`),
    listingPhone: phoneSchema,
    listingEmail: z.string().email("Enter a valid email address"),
    website: z.string().optional(),
    sameAsBilling: z.boolean(),
    businessAddress: businessAddressSchema.nullable(),
    bio: z.string().max(bioMaxChars, `Bio must be ${bioMaxChars} characters or fewer`),
    hours: businessHoursSchema,
    assetPermission: z.boolean(),
  });
}

export function buildListingInfoNowSchema(config: SiteConfig) {
  return buildListingInfoNowObjectSchema(config).superRefine((data, ctx) => {
    if (!data.sameAsBilling && !data.businessAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["businessAddress"],
        message: "Business address is required when different from billing address",
      });
    }
  });
}

export const listingInfoLaterSchema = z.object({
  listingChoice: z.literal("later"),
});

export const listingInfoSchema = z.discriminatedUnion("listingChoice", [
  buildListingInfoNowObjectSchema(topRespiratoryTherapistsConfig),
  listingInfoLaterSchema,
]);

export type ListingInfoData = z.infer<typeof listingInfoSchema>;
