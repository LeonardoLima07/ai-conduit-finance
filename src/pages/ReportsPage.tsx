import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
  { month: "Jan", revenue: 72000, expenses: 55000, profit: 17000 },
  { month: "Feb", revenue: 68000, expenses: 52000, profit: 16000 },
  { month: "Mar", revenue: 80000, expenses: 58000, profit: 22000 },
  { month: "Apr", revenue: 75000, expenses: 54000, profit: 21000 },
  { month: "May", revenue: 85000, expenses: 60000, profit: 25000 },
  { month: "Jun", revenue: 92000, expenses: 63000, profit: 29000 },
  { month: "Jul", revenue: 85000, expenses: 62000, profit: 23000 },
  { month: "Aug", revenue: 92000, expenses: 65000, profit: 27000 },
  { month: "Sep", revenue: 88000, expenses: 58000, profit: 30000 },
  { month: "Oct", revenue: 105000, expenses: 72000, profit: 33000 },
  { month: "Nov", revenue: 115000, expenses: 68000, profit: 47000 },
  { month: "Dec", revenue: 127450, expenses: 84230, profit: 43220 },
];

const expenseBreakdown = [
  { name: "Salaries", value: 35000, color: "hsl(217, 91%, 60%)" },
  { name: "Marketing", value: 15000, color: "hsl(240, 80%, 65%)" },
  { name: "Rent", value: 12000, color: "hsl(280, 70%, 60%)" },
  { name: "Software", value: 8500, color: "hsl(200, 70%, 50%)" },
  { name: "Supplies", value: 5200, color: "hsl(160, 60%, 45%)" },
  { name: "Other", value: 8530, color: "hsl(220, 9%, 46%)" },
];

export default function ReportsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">Financial statements and analytics for 2025</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Revenue", value: "R$ 1,084,450" },
          { label: "Total Expenses", value: "R$ 751,230" },
          { label: "Net Profit", value: "R$ 333,220" },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* P&L Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Profit & Loss — 12 Months</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" fill="url(#profitGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" stroke="hsl(220, 9%, 46%)" fill="transparent" strokeWidth={2} strokeDasharray="4 4" />
              <Area type="monotone" dataKey="profit" stroke="hsl(160, 60%, 45%)" fill="transparent" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Pie */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                {expenseBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {expenseBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">R$ {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
