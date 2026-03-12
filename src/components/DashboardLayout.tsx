import {
  BarChart3, FileText, PieChart, Settings, Brain, CreditCard,
  TrendingUp, LogOut, ChevronLeft, ChevronRight, BookOpen,
  MessageSquare, Users, ClipboardList, Wallet, Plug, Building2, Repeat,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Link } from "react-router-dom";
import { useState } from "react";

const navItems = [
  { icon: BarChart3, label: "Dashboard", to: "/dashboard" },
  { icon: CreditCard, label: "Transações", to: "/dashboard/transactions" },
  { icon: TrendingUp, label: "Previsão", to: "/dashboard/forecast" },
  { icon: Wallet, label: "Fluxo de Caixa", to: "/dashboard/cash-flow" },
  { icon: FileText, label: "Notas Fiscais", to: "/dashboard/invoices" },
  { icon: Users, label: "Clientes", to: "/dashboard/clients" },
  { icon: PieChart, label: "Relatórios", to: "/dashboard/reports" },
  { icon: ClipboardList, label: "Relatório Mensal", to: "/dashboard/monthly-report" },
  { icon: Brain, label: "AI Advisor", to: "/dashboard/advisor" },
  { icon: Building2, label: "Briefing", to: "/dashboard/briefing" },
  { icon: Plug, label: "Integrações", to: "/dashboard/integrations" },
  { icon: BookOpen, label: "Aprender", to: "/dashboard/education" },
  { icon: MessageSquare, label: "Feedback", to: "/dashboard/feedback" },
  { icon: Settings, label: "Configurações", to: "/dashboard/settings" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside
        className={`flex flex-col border-r border-border bg-card transition-all duration-200 ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
                <span className="text-sm font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-lg font-bold text-foreground">Contuit</span>
            </Link>
          )}
          {collapsed && (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
              <span className="text-sm font-bold text-primary-foreground">C</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeClassName="bg-primary/10 text-primary"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-2 space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            {!collapsed && <span>Recolher</span>}
          </button>
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
