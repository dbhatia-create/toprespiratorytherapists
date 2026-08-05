"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import FadeIn from "@/components/ui/FadeIn";
import Button from "@/components/ui/Button";
import { FormField, Input, Select, Checkbox } from "@/components/ui/FormField";
import OrderSummarySidebar from "@/components/checkout/OrderSummarySidebar";
import { useCheckoutStore } from "@/lib/store/checkoutStore";
import { paymentSchema, type PaymentData } from "@/lib/checkoutSchema";
import { ALL_STATES } from "@/lib/markets";
import type { SiteConfig } from "@/lib/config";

const formatCardNumber = (v: string) =>
  v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export default function Step3Payment({ config }: { config: SiteConfig }) {
  const payment = useCheckoutStore((s) => s.payment);
  const contact = useCheckoutStore((s) => s.contact);
  const plaqueShipping = useCheckoutStore((s) => s.plaqueShipping);
  const setPayment = useCheckoutStore((s) => s.setPayment);
  const goNext = useCheckoutStore((s) => s.goNext);
  const goBack = useCheckoutStore((s) => s.goBack);

  const [sameAsContact, setSameAsContact] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: payment,
  });

  function handleSameAsContactChange(checked: boolean) {
    setSameAsContact(checked);
    if (checked) {
      setValue("cardholderName", `${contact.firstName} ${contact.lastName}`.trim());
    }
  }

  function handleSameAsShippingChange(checked: boolean) {
    setSameAsShipping(checked);
    if (checked && plaqueShipping) {
      setValue("billingAddress", plaqueShipping.street);
      setValue("billingCity", plaqueShipping.city);
      setValue("billingState", plaqueShipping.state);
      setValue("billingZip", plaqueShipping.zip);
    }
  }

  function onSubmit(values: PaymentData) {
    setPayment(values);
    // No real processor call yet — advancing the step is the entire
    // "charge" simulation, matching the current site's existing apply flow.
    goNext();
  }

  return (
    <FadeIn>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-primary mb-1 flex items-center gap-2">
              <Lock size={16} className="text-muted" /> Complete Your Purchase
            </h2>
          </div>

          <div className="rounded-lg border border-accent/40 bg-accent/5 px-4 py-3">
            <p className="text-sm text-dark">
              <strong className="text-primary">Please stay on this page</strong> and complete the
              checkout — closing this window after paying but before finishing may leave your
              listing incomplete.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Checkbox
                label="Same as contact name"
                checked={sameAsContact}
                onChange={(e) => handleSameAsContactChange(e.target.checked)}
              />
              <FormField label="Cardholder Name" required error={errors.cardholderName?.message}>
                <Input
                  {...register("cardholderName")}
                  disabled={sameAsContact}
                  error={errors.cardholderName?.message}
                />
              </FormField>
            </div>

            <Controller
              name="cardNumber"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Credit Card Number"
                  required
                  className="sm:col-span-2"
                  error={errors.cardNumber?.message}
                >
                  <Input
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                    error={errors.cardNumber?.message}
                  />
                </FormField>
              )}
            />

            <Controller
              name="expiry"
              control={control}
              render={({ field }) => (
                <FormField label="Expiration Date" required error={errors.expiry?.message}>
                  <Input
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(formatExpiry(e.target.value))}
                    error={errors.expiry?.message}
                  />
                </FormField>
              )}
            />

            <FormField label="CVV" required error={errors.cvv?.message}>
              <Input inputMode="numeric" maxLength={4} {...register("cvv")} error={errors.cvv?.message} />
            </FormField>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-primary mb-1">Billing Address</h2>
            {config.shippingRequired && plaqueShipping && (
              <Checkbox
                label="Same as shipping address"
                checked={sameAsShipping}
                onChange={(e) => handleSameAsShippingChange(e.target.checked)}
                className="mb-3"
              />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Billing Address"
                required
                className="sm:col-span-2"
                error={errors.billingAddress?.message}
              >
                <Input
                  {...register("billingAddress")}
                  disabled={sameAsShipping}
                  error={errors.billingAddress?.message}
                />
              </FormField>

              <FormField
                label="Address Line 2 (optional)"
                className="sm:col-span-2"
                error={errors.billingAddress2?.message}
              >
                <Input
                  {...register("billingAddress2")}
                  disabled={sameAsShipping}
                  error={errors.billingAddress2?.message}
                />
              </FormField>

              <FormField label="Billing City" required error={errors.billingCity?.message}>
                <Input
                  {...register("billingCity")}
                  disabled={sameAsShipping}
                  error={errors.billingCity?.message}
                />
              </FormField>

              <FormField label="Billing State" required error={errors.billingState?.message}>
                <Select
                  {...register("billingState")}
                  disabled={sameAsShipping}
                  error={errors.billingState?.message}
                >
                  <option value="">Select...</option>
                  {ALL_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Billing ZIP Code" required error={errors.billingZip?.message}>
                <Input
                  {...register("billingZip")}
                  disabled={sameAsShipping}
                  error={errors.billingZip?.message}
                />
              </FormField>
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="ghost" onClick={goBack}>
              Back
            </Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>

        <OrderSummarySidebar config={config} />
      </div>
    </FadeIn>
  );
}
