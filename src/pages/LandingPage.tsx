import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  CreditCard,
  BarChart3,
  FileText,
  TrendingUp,
  Zap,
  Shield,
  Globe,
  Sparkles,
} from "lucide-react";

const features = [
  { icon: Brain, title: "AI Business Advisor", desc: "Get personalized insights and recommendations powered by AI that understands your business." },
  { icon: BarChart3, title: "Financial Dashboard", desc: "Real-time revenue, expenses, profit overview, and financial health score at a glance." },
  { icon: Zap, title: "Smart Categorization", desc: "AI automatically categorizes bank transactions with machine learning that improves over time." },
  { icon: CreditCard, title: "Bank Integration", desc: "Connect bank accounts via Open Banking for automatic data sync and reconciliation." },
  { icon: FileText, title: "Invoice Generator", desc: "Create, send, and track invoices with automatic tax estimation and recurring billing." },
  { icon: TrendingUp, title: "Cash Flow Forecast", desc: "Predict future finances with AI-powered projections and receive risk alerts early." },
];

const stats = [
  { value: "10K+", label: "Businesses" },
  { value: "R$2B+", label: "Managed" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9★", label: "Rating" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(217_91%_60%_/_0.08),transparent_60%)]" />
        <div className="container relative mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-Powered Financial OS
            </div>
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl">
              The AI Copilot for{" "}
              <span className="text-gradient-hero">Your Business</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
              Contuit automates accounting, predicts cash flow, generates invoices, and acts as your personal CFO — all powered by AI.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="hero" size="xl" asChild>
                <Link to="/login">
                  Start Free Trial <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/features">See How It Works</Link>
              </Button>
            </div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mx-auto mt-20 max-w-5xl"
          >
            <div className="rounded-2xl border border-border bg-card p-2 shadow-lg">
              <div className="rounded-xl bg-surface-sunken p-6 md:p-8">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { label: "Revenue", value: "R$ 127,450", change: "+12.5%", positive: true },
                    { label: "Expenses", value: "R$ 84,230", change: "-3.2%", positive: true },
                    { label: "Profit", value: "R$ 43,220", change: "+18.7%", positive: true },
                    { label: "Health Score", value: "92/100", change: "Excellent", positive: true },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-card p-4 shadow-sm">
                      <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-xl font-bold text-foreground md:text-2xl">{stat.value}</p>
                      <p className="mt-1 text-xs font-medium text-primary">{stat.change}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="col-span-2 rounded-xl bg-card p-4 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Revenue vs Expenses</p>
                    <div className="flex items-end gap-1.5 h-32">
                      {[65, 45, 75, 55, 80, 60, 90, 50, 85, 70, 95, 75].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col gap-1">
                          <div className="rounded-sm bg-gradient-hero" style={{ height: `${h}%` }} />
                          <div className="rounded-sm bg-muted" style={{ height: `${h * 0.6}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-card p-4 shadow-sm">
                    <p className="text-sm font-medium text-muted-foreground mb-3">AI Insight</p>
                    <div className="flex items-start gap-2">
                      <Brain className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground leading-relaxed">
                        "Your revenue is trending 18% above last quarter. Consider reinvesting in marketing."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-surface-sunken py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-foreground md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground md:text-5xl">
              Everything you need to run your finances
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              From automated bookkeeping to AI-powered forecasts, Contuit handles it all.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-card hover:border-primary/20"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="rounded-3xl bg-gradient-dark p-12 text-center md:p-20">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-primary-foreground md:text-5xl">
              Ready to transform your finances?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/70">
              Join thousands of businesses already using Contuit to automate their financial operations.
            </p>
            <Button variant="hero" size="xl" className="mt-8" asChild>
              <Link to="/login">
                Get Started Free <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
