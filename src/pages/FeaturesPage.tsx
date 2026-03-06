import { motion } from "framer-motion";
import {
  Brain, BarChart3, Zap, CreditCard, FileText, TrendingUp,
  PieChart, Users, Upload, Shield, Globe, Sparkles,
} from "lucide-react";

const allFeatures = [
  { icon: BarChart3, title: "Financial Dashboard", desc: "Real-time overview of revenue, expenses, profit, and financial health score with interactive charts." },
  { icon: Zap, title: "AI Transaction Categorization", desc: "Automatic categorization of bank transactions using machine learning that improves with every interaction." },
  { icon: CreditCard, title: "Bank Integration", desc: "Open Banking support with automatic bank data sync for seamless reconciliation." },
  { icon: FileText, title: "Invoice Generator", desc: "Create and send professional invoices, set up recurring billing, and track payments with automatic tax estimation." },
  { icon: PieChart, title: "Accounting Reports", desc: "Income statement, balance sheet, and cash flow reports generated automatically from your data." },
  { icon: TrendingUp, title: "Cash Flow Forecast", desc: "AI-powered future financial projections with risk alerts to help you plan ahead." },
  { icon: Sparkles, title: "Expense Analysis", desc: "Detect unnecessary spending and receive AI-generated suggestions for savings opportunities." },
  { icon: Brain, title: "AI Business Advisor", desc: "Your personal AI CFO that analyzes company performance, suggests improvements, and answers business questions." },
  { icon: Users, title: "Multi-Company Dashboard", desc: "Accountants can manage multiple clients from a single dashboard with role-based access." },
  { icon: Upload, title: "File Import", desc: "Import spreadsheets, bank statements, and financial documents with automatic data extraction." },
  { icon: Shield, title: "Security & Compliance", desc: "Bank-grade encryption, LGPD compliance, and audit trails for complete peace of mind." },
  { icon: Globe, title: "Global Ready", desc: "Multi-currency support and adaptable tax rules for expansion beyond Brazil." },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl font-bold text-foreground md:text-6xl">
              Powerful features for{" "}
              <span className="text-gradient-hero">modern businesses</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to automate accounting, manage finances, and grow your business with AI.
            </p>
          </motion.div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {allFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
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
    </div>
  );
}
