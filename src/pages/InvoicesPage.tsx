import { FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const invoices = [
  { id: "INV-001", client: "Empresa ABC", amount: "R$ 15,000", status: "Paid", date: "Dec 5, 2025" },
  { id: "INV-002", client: "Loja XYZ", amount: "R$ 8,500", status: "Paid", date: "Dec 3, 2025" },
  { id: "INV-003", client: "Tech Corp", amount: "R$ 22,000", status: "Pending", date: "Dec 1, 2025" },
  { id: "INV-004", client: "Startup Inc", amount: "R$ 5,200", status: "Overdue", date: "Nov 28, 2025" },
  { id: "INV-005", client: "Consultoria MN", amount: "R$ 12,800", status: "Draft", date: "Nov 25, 2025" },
];

const statusStyles: Record<string, string> = {
  Paid: "bg-primary/10 text-primary",
  Pending: "bg-yellow-500/10 text-yellow-600",
  Overdue: "bg-destructive/10 text-destructive",
  Draft: "bg-muted text-muted-foreground",
};

export default function InvoicesPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground">Create, manage, and track your invoices</p>
        </div>
        <Button variant="hero" size="default">
          <Plus className="mr-1 h-4 w-4" /> New Invoice
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search invoices..." className="pl-9" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer">
                <td className="px-5 py-4 text-sm font-medium text-foreground">{inv.id}</td>
                <td className="px-5 py-4 text-sm text-foreground">{inv.client}</td>
                <td className="px-5 py-4 text-sm font-semibold text-foreground">{inv.amount}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[inv.status]}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{inv.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
