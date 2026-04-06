import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, Calendar, MoreHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useFinancialData } from "@/hooks/useFinancialData";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { TransactionLimitBanner } from "@/components/UpgradePrompt";

const statusStyles: Record<string, string> = {
  paid: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  overdue: "bg-destructive/10 text-destructive border-destructive/20",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Atrasado",
  cancelled: "Cancelado",
};

export default function TransactionsPage() {
  const { data, isLoading, refetch } = useFinancialData();
  const { canAddTransaction, incrementTransactionCount, transactionsUsed, transactionsLimit } = useSubscription();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("Todos");
  const [showNew, setShowNew] = useState(false);
  const [newTx, setNewTx] = useState({ description: "", amount: "", date: "", type: "expense", category: "Serviços", clientOrSupplier: "" });
  const [saving, setSaving] = useState(false);

  const transactions = data?.transactions ?? [];

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return ["Todos", ...Array.from(cats).sort()];
  }, [transactions]);

  const filtered = transactions.filter((t) => {
    if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !(t.clientOrSupplier || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType === "income" && t.type !== "income") return false;
    if (filterType === "expense" && t.type !== "expense") return false;
    if (filterCategory !== "Todos" && t.category !== filterCategory) return false;
    return true;
  });

  const totalIncome = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const handleSave = async () => {
    if (!data?.companyId) { toast.error("Nenhuma empresa cadastrada."); return; }
    if (!newTx.description || !newTx.amount) { toast.error("Preencha descrição e valor."); return; }
    if (!canAddTransaction()) { toast.error("Limite de transações atingido. Faça upgrade do seu plano."); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from("transactions").insert({
        company_id: data.companyId,
        description: newTx.description,
        amount: parseFloat(newTx.amount),
        date: newTx.date || new Date().toISOString().split("T")[0],
        type: newTx.type,
        category: newTx.category,
        client_or_supplier: newTx.clientOrSupplier || null,
        payment_status: "pending",
      });
      if (error) throw error;
      await incrementTransactionCount();
      toast.success("Transação criada!");
      setShowNew(false);
      setNewTx({ description: "", amount: "", date: "", type: "expense", category: "Serviços", clientOrSupplier: "" });
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar.");
    } finally { setSaving(false); }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      {transactionsLimit && <TransactionLimitBanner used={transactionsUsed} limit={transactionsLimit} />}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transações</h1>
          <p className="text-sm text-muted-foreground">Registros financeiros da sua empresa</p>
        </div>
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="mr-1.5 h-4 w-4" /> Nova Transação</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Transação</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Descrição</Label><Input placeholder="Ex: Pagamento do cliente ABC" value={newTx.description} onChange={e => setNewTx(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Valor (R$)</Label><Input type="number" placeholder="0,00" value={newTx.amount} onChange={e => setNewTx(p => ({ ...p, amount: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Data</Label><Input type="date" value={newTx.date} onChange={e => setNewTx(p => ({ ...p, date: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={newTx.type} onValueChange={v => setNewTx(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="income">Receita</SelectItem><SelectItem value="expense">Despesa</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input placeholder="Ex: Marketing" value={newTx.category} onChange={e => setNewTx(p => ({ ...p, category: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2"><Label>Cliente / Fornecedor</Label><Input placeholder="Ex: Empresa ABC" value={newTx.clientOrSupplier} onChange={e => setNewTx(p => ({ ...p, clientOrSupplier: e.target.value }))} /></div>
              <Button variant="hero" className="w-full" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar Transação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Total Receitas</p>
          <p className="mt-1 text-2xl font-bold text-primary">R$ {totalIncome.toLocaleString("pt-BR")}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Total Despesas</p>
          <p className="mt-1 text-2xl font-bold text-destructive">R$ {totalExpense.toLocaleString("pt-BR")}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Saldo</p>
          <p className={`mt-1 text-2xl font-bold ${totalIncome - totalExpense >= 0 ? "text-primary" : "text-destructive"}`}>R$ {(totalIncome - totalExpense).toLocaleString("pt-BR")}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar transações..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px]"><Filter className="mr-1.5 h-3.5 w-3.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {/* Transaction List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_120px_140px_100px_100px_40px] gap-4 px-5 py-3 text-xs font-semibold text-muted-foreground border-b border-border bg-secondary/50">
          <span>Descrição</span><span>Data</span><span>Categoria</span><span className="text-right">Valor</span><span>Status</span><span></span>
        </div>
        {filtered.map((tx, i) => (
          <motion.div key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
            className="grid grid-cols-[1fr_120px_140px_100px_100px_40px] gap-4 items-center px-5 py-3.5 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tx.type === "income" ? "bg-primary/10" : "bg-destructive/10"}`}>
                {tx.type === "income" ? <ArrowUpRight className="h-4 w-4 text-primary" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                {tx.clientOrSupplier && <p className="text-xs text-muted-foreground truncate">{tx.clientOrSupplier}</p>}
              </div>
            </div>
            <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(tx.date).toLocaleDateString("pt-BR")}</span>
            <Badge variant="outline" className="w-fit text-xs">{tx.category}</Badge>
            <p className={`text-sm font-semibold text-right ${tx.type === "income" ? "text-primary" : "text-foreground"}`}>
              {tx.type === "income" ? "+" : "-"}R$ {tx.amount.toLocaleString("pt-BR")}
            </p>
            <Badge variant="outline" className={`w-fit text-xs ${statusStyles[tx.paymentStatus] || ""}`}>{statusLabels[tx.paymentStatus] || tx.paymentStatus}</Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">Nenhuma transação encontrada.</div>
        )}
      </div>
    </div>
  );
}
