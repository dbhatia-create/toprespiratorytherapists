import Container from "@/components/Container";
import Button from "@/components/Button";
import FadeIn from "@/components/FadeIn";
import { CheckCircle } from "lucide-react";
import { PRICING, formatCurrency } from "@/lib/pricing";
import { siteConfig } from "@/site.config";
import { howItWorksFaqItems } from "@/content/faq";

export const metadata = { title: `How It Works — ${siteConfig.name}` };

export default function HowItWorksPage() {
  return (
    <section className="py-20 lg:py-28 bg-navy-dark relative overflow-hidden">
      <div className="absolute inset-0 carbon opacity-20 pointer-events-none" />
      <Container className="relative">
        <div className="max-w-3xl mx-auto">
          <FadeIn variant="luxe">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-teal-light mb-5 flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-teal-light glow-teal" />
              The Listing Process
            </p>
            <h1 className="race-head text-4xl sm:text-5xl font-light text-pearl mb-4">
              How It <span className="race-head--accent">Works</span>
            </h1>
            <p className="text-muted text-lg mb-12">
              Getting your respiratory practice listed is simple. Here&apos;s what to expect.
            </p>
          </FadeIn>

          <div className="space-y-10 mb-16">
            {[
              {
                step: "01",
                title: "Submit Your Application",
                body: "Complete our online application with your practice details, city selections, respiratory specialties, provider credentials, and preferred listing tier. The process takes about 10 minutes.",
              },
              {
                step: "02",
                title: "We Review and Build Your Profile",
                body: "Our team reviews your application, confirms your information, and publishes a polished respiratory practice profile on " + siteConfig.name + ".",
              },
              {
                step: "03",
                title: "Patients Find Your Practice",
                body: "Your listing appears in our directory when patients and referring physicians search for respiratory therapists in your city. Featured listings receive top placement and a highlighted badge.",
              },
            ].map(({ step, title, body }, i) => (
              <FadeIn key={step} variant="luxe" delay={i * 0.08}>
                <div className="flex gap-6">
                  <div className="race-head h-12 w-12 rounded-full border border-gold/40 text-gold-light flex items-center justify-center text-lg font-light flex-shrink-0 glow-gold">
                    {step}
                  </div>
                  <div>
                    <h3 className="race-head font-normal text-pearl text-lg mb-2">{title}</h3>
                    <p className="text-muted leading-relaxed">{body}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <div className="h-px waterline mb-16" />

          {/* Why get listed */}
          <FadeIn variant="luxe">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-teal-light mb-5 flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rotate-45 bg-teal-light glow-teal" />
              Why Get Listed
            </p>
            <h2 className="race-head text-3xl font-light text-pearl mb-8">
              Reach patients searching for{" "}
              <span className="race-head--accent">respiratory care</span>
            </h2>
          </FadeIn>

          <div className="space-y-6 mb-16">
            {howItWorksFaqItems.map(({ question, answer }, i) => (
              <FadeIn key={question} variant="luxe" delay={i * 0.06}>
                <div className="glass rounded-2xl p-6">
                  <h3 className="race-head font-normal text-pearl text-lg mb-2">{question}</h3>
                  <p className="text-muted leading-relaxed text-sm">{answer}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Pricing */}
          <FadeIn variant="luxe">
            <div className="glass rounded-2xl p-8 mb-10">
              <h2 className="race-head text-2xl font-normal text-pearl mb-2">Pricing</h2>
              <p className="text-muted mb-6">One-time annual fee. No recurring charges.</p>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[11px] font-semibold text-teal-light uppercase tracking-[0.3em] mb-2">
                    Basic Listing
                  </p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-pearl/40 line-through tabular-nums">{formatCurrency(PRICING.baseCity * 2)}</span>
                    <span className="text-[10px] font-bold text-teal-light bg-teal/15 border border-teal/30 rounded px-1.5 py-0.5 uppercase tracking-wide">50% Off</span>
                  </div>
                  <p className="race-head text-3xl font-light tabular-nums text-pearl">
                    {formatCurrency(PRICING.baseCity)}
                  </p>
                  <p className="text-muted text-sm">per city / year</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gold-light uppercase tracking-[0.3em] mb-2">
                    Featured Listing
                  </p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-pearl/40 line-through tabular-nums">+{formatCurrency(PRICING.spotlightCity * 2)}</span>
                    <span className="text-[10px] font-bold text-gold bg-gold/15 border border-gold/30 rounded px-1.5 py-0.5 uppercase tracking-wide">50% Off</span>
                  </div>
                  <p className="race-head text-3xl font-light tabular-nums text-foil">
                    +{formatCurrency(PRICING.spotlightCity)}
                  </p>
                  <p className="text-muted text-sm">first city</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gold/10 border border-gold/30 px-3 py-1">
                    <span className="text-xs font-semibold text-gold-light">+{formatCurrency(PRICING.spotlightCity)} each additional city</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <ul className="space-y-2 text-sm text-muted">
                  {[
                    "Only 1 Featured Listing available per city",
                    "Annual term: 12 months, paid once",
                    "Featured listings receive priority placement",
                    `Additional featured cities at ${formatCurrency(PRICING.spotlightCity)} each`,
                    "All listed practices receive a recognition award",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-teal flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>

          <Button href="/apply" variant="primary" size="lg">
            List Your Practice
          </Button>
        </div>
      </Container>
    </section>
  );
}
