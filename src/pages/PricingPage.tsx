import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "Basic accounting and invoicing for getting started.",
    features: ["Financial dashboard", "Invoice generator", "Up to 50 transactions/mo", "Email support"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Business",
    price: "R$ 97",
    period: "/month",
    desc: "Full financial automation for growing businesses.",
    features: ["Everything in Starter", "Bank integration", "Unlimited transactions", "AI categorization", "Accounting reports", "Priority support"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Pro",
    price: "R$ 197",
    period: "/month",
    desc: "Advanced analytics and forecasting.",
    features: ["Everything in Business", "Cash flow forecast", "Expense analysis", "Multi-company dashboard", "Custom reports", "API access"],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Master",
    price: "R$ 397",
    period: "/month",
    desc: "Full AI Business Agent with personalized insights.",
    features: ["Everything in Pro", "AI Business Advisor", "Custom AI agent", "Dedicated account manager", "White-label options", "SLA guarantee"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-bold text-foreground md:text-6xl">
              Simple, transparent{" "}
              <span className="text-gradient-hero">pricing</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as your business grows. No hidden fees.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className={`relative rounded-2xl border p-6 transition-all ${
                plan.popular
                  ? "border-primary bg-card shadow-glow"
                  : "border-border bg-card hover:shadow-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-hero px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
              <Button
                variant={plan.popular ? "hero" : "outline"}
                className="mt-6 w-full"
                asChild
              >
                <Link to="/login">{plan.cta}</Link>
              </Button>
              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
