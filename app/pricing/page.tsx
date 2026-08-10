import Link from "next/link";
import { ModuleHeader } from "@/components/module-header";

const plans = [
  { name: "Explore", eyebrow: "For first searches", price: "₦0", cadence: "forever", description: "For businesses testing creator discovery and building a first shortlist.", features: ["Unlimited creator profile access", "Save up to 10 creators", "Basic search and filters", "1 business workspace"], cta: "Start free", href: "/join/business", featured: false },
  { name: "Campaign", eyebrow: "For growing teams", price: "₦45,000", cadence: "per month", description: "For teams sourcing creators regularly and coordinating active campaigns.", features: ["Everything in Explore", "Unlimited shortlists", "AI-assisted campaign matching", "Rate and availability requests", "3 team seats", "Exportable creator comparisons"], cta: "Start Campaign", href: "/join/business", featured: true },
  { name: "Scale", eyebrow: "For agencies & brands", price: "Let’s talk", cadence: "annual plans", description: "For organizations running creator programs across brands, markets or clients.", features: ["Everything in Campaign", "Unlimited team seats", "Portfolio and client workspaces", "API and data exports", "Priority data refresh", "Dedicated success support"], cta: "Contact sales", href: "mailto:hello@creatorradar.ng?subject=CreatorRadar%20Scale", featured: false },
];

export default function PricingPage() {
  return (
    <main className="module-page pricing-page">
      <ModuleHeader />
      <section className="pricing-hero"><span className="section-kicker">Simple, local pricing</span><h1>Start with insight.<br/><em>Scale with confidence.</em></h1><p>Browse deeply for free, then upgrade when your team needs campaign workflows and collaboration.</p></section>
      <section className="pricing-grid">
        {plans.map((plan) => <article className={plan.featured ? "featured" : ""} key={plan.name}>{plan.featured && <span className="popular-badge">Most popular</span>}<span className="plan-eyebrow">{plan.eyebrow}</span><h2>{plan.name}</h2><div className="plan-price"><strong>{plan.price}</strong><span>{plan.cadence}</span></div><p>{plan.description}</p><Link className="plan-cta" href={plan.href}>{plan.cta} <span>→</span></Link><div className="plan-rule" /><strong className="includes">What&apos;s included</strong><ul>{plan.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul></article>)}
      </section>
      <section className="creator-pricing-banner"><div><span className="section-kicker light">Creators join free</span><h2>Build your profile, connect your channels and publish your rates.</h2><p>CreatorRadar does not charge creators to be discoverable. Paid promotion is never required for organic search placement.</p></div><Link href="/join/creator">Create your creator profile <span>→</span></Link></section>
      <section className="pricing-faq"><span className="section-kicker">Questions, answered</span><div><details open><summary>Can I browse before signing up?</summary><p>Yes. Guests can open three full creator profiles. A free business account unlocks continued profile access and persistent shortlists.</p></details><details><summary>Are creator rates guaranteed?</summary><p>Rates are creator-submitted starting prices. Final quotes can change with production scope, usage rights, category exclusivity and timing.</p></details><details><summary>Where do social metrics come from?</summary><p>CreatorRadar uses permitted platform APIs and creator-authorized data. Each profile shows its most recent sync status; unavailable metrics are never invented.</p></details></div></section>
    </main>
  );
}

