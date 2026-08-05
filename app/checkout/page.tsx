import type { Metadata } from "next";
import CheckoutWizard from "@/components/checkout/CheckoutWizard";
import { topRespiratoryTherapistsConfig } from "@/lib/config";
import { siteConfig } from "@/site.config";

export const metadata: Metadata = {
  title: `Checkout — ${siteConfig.name}`,
  description: `Complete your listing purchase on ${siteConfig.name}.`,
};

export default function CheckoutPage() {
  return <CheckoutWizard config={topRespiratoryTherapistsConfig} />;
}
