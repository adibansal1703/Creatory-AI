import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter", price: "₹0", period: "/14-day trial",
    desc: "Try every feature, no card required.",
    features: ["3 social accounts", "30 scheduled posts", "500 AI credits", "Basic analytics"],
    cta: "Start free",
  },
  {
    name: "Creator", price: "₹200", period: "/mo", popular: true,
    desc: "For solo creators ready to scale.",
    features: ["10 social accounts", "Unlimited scheduling", "10,000 AI credits", "Trend Radar", "Full analytics", "Brand voice memory"],
    cta: "Get Creator",
  },
  {
    name: "Agency", price: "₹500", period: "/mo",
    desc: "Multi-brand workspaces & white-label.",
    features: ["Unlimited accounts", "Unlimited posts", "50,000 AI credits", "Client workspaces", "White-label", "Priority support"],
    cta: "Get Agency",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm text-primary font-medium">Pricing</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
            Plans that scale with you
          </h2>
          <p className="mt-4 text-muted-foreground">Start free. Upgrade when you're ready. Cancel anytime.</p>
        </div>
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative glass rounded-3xl p-7 ${p.popular ? "border-primary/50 glow" : ""}`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-gradient-brand text-white font-medium">
                  Most popular
                </div>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <Button
                className={`mt-6 w-full ${p.popular ? "bg-gradient-brand border-0 hover:opacity-90" : ""}`}
                variant={p.popular ? "default" : "outline"}
              >
                {p.cta}
              </Button>
              <ul className="mt-7 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}