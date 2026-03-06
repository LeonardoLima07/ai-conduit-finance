import { Brain, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const revenueData = [
  { month: "Jul", revenue: 85000, expenses: 62000 },
  { month: "Aug", revenue: 92000, expenses: 65000 },
  { month: "Sep", revenue: 88000, expenses: 58000 },
  { month: "Oct", revenue: 105000, expenses: 72000 },
  { month: "Nov", revenue: 115000, expenses: 68000 },
  { month: "Dec", revenue: 127450, expenses: 84230 },
];

const categoryData = [
  { name: "Salaries", value: 35000 },
  { name: "Rent", value: 12000 },
  { name: "Marketing", value: 15000 },
  { name: "Software", value: 8500 },
  { name: "Supplies", value: 5200 },
  { name: "Other", value: 8530 },
];

const kpis = [
  { label: "Revenue", value: "R$ 127,450", change: "+12.5%", positive: true, icon: TrendingUp },
  { label: "Expenses", value: "R$ 84,230", change: "-3.2%", positive: true, icon: ArrowDownRight },
  { label: "Net Profit", value: "R$ 43,220", change: "+18.7%", positive: true, icon: ArrowUpRight },
  { label: "Health Score", value: "92/100", change: "Excellent", positive: true, icon: Brain },
];

const aiInsights = [
  { type: "success", text: "Your business can safely hire another employee based on current cash flow margins." },
  { type: "warning", text: "Marketing spend increased 23% but conversions only grew 8%. Consider optimizing campaigns." },
  { type: "info", text: "You can increase profit by adjusting prices by 7% — competitors in your segment charge 12% more." },
];

const transactions = [
  { desc: "Client Payment — Empresa ABC", amount: "+R$ 15,000", category: "Revenue", date: "Today" },
  { desc: "Adobe Creative Cloud", amount: "-R$ 289", category: "Software", date: "Today" },
  { desc: "Google Ads", amount: "-R$ 3,200", category: "Marketing", date: "Yesterday" },
  { desc: "Client Payment — Loja XYZ", amount: "+R$ 8,500", category: "Revenue", date: "Yesterday" },
  { desc: "Office Rent", amount: "-R$ 4,500", category: "Rent", date: "Mar 1" },
];

export default function DashboardPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your financial overview for December 2025</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
              <kpi.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="mt-1 text-xs font-medium text-primary">{kpi.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" fill="url(#revGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="hsl(220, 9%, 46%)" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
          </div>
          <div className="space-y-3">
            {aiInsights.map((insight, i) => (
              <div key={i} className="rounded-lg bg-secondary p-3">
                <p className="text-sm text-foreground leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Expenses by Category */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
              <Bar dataKey="value" fill="hsl(217, 91%, 60%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{tx.desc}</p>
                  <p className="text-xs text-muted-foreground">{tx.category} · {tx.date}</p>
                </div>
                <p className={`text-sm font-semibold ${tx.amount.startsWith("+") ? "text-primary" : "text-foreground"}`}>
                  {tx.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
