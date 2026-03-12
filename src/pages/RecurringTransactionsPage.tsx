import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Repeat, ArrowUpRight, ArrowDownRight, Calendar, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface RecurringTransaction {
  id: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  frequency: "weekly" | "monthly" | "yearly";
  nextExecutionDate: string;
  isActive: boolean;
  clientOrSupplier: string;
}

const frequencyLabels: Record<string, string> = {
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

const categories = ["Folha", "Aluguel", "Software", "Serviços", "Marketing", "Infraestrutura", "Consultoria"];

const sampleRecurring: RecurringTransaction[] = [
  { id: "1", description: "Salários da equipe", category: "Folha", amount: 35000, type: "expense", frequency: "monthly", nextExecutionDate: "2026-04-01", isActive: true, clientOrSupplier: "" },
  { id: "2", description: "Aluguel do escritório", category: "Aluguel", amount: 4500, type: "expense", frequency: "monthly", nextExecutionDate: "2026-04-01", isActive: true, clientOrSupplier: "Imobiliária Central" },
  { id: "3", description: "Adobe Creative Cloud", category: "Software", amount: 289, type: "expense", frequency: "monthly", nextExecutionDate: "2026-04-11", isActive: true, clientOrSupplier: "Adobe" },
  { id: "4", description: "Internet e Telefone", category: "Infraestrutura", amount: 450, type: "expense", frequency: "monthly", nextExecutionDate: "2026-03-28", isActive: true, clientOrSupplier: "Vivo" },
  { id: "5", description: "Contrato mensal — Empresa ABC", category: "Serviços", amount: 15000, type: "income", frequency: "monthly", nextExecutionDate: "2026-04-10", isActive: true, clientOrSupplier: "Empresa ABC" },
  { id: "6", description: "Contrato mensal — Loja XYZ", category: "Consultoria", amount: 8500, type: "income", frequency: "monthly", nextExecutionDate: "2026-04-10", isActive: true, clientOrSupplier: "Loja XYZ" },
  { id: "7", description: "Licenças Microsoft 365", category: "Software", amount: 1200, type: "expense", frequency: "yearly", nextExecutionDate: "2026-06-15", isActive: true, clientOrSupplier: "Microsoft" },
  { id: "8", description: "Limpeza semanal", category: "Infraestrutura", amount: 350, type: "expense", frequency: "weekly", nextExecutionDate: "2026-03-17", isActive: false, clientOrSupplier: "" },
];

export default function RecurringTransactionsPage() {
  const [items, setItems] = useState<RecurringTransaction[]>(sampleRecurring);
  const [showNew, setShowNew] = useState(false);
  const [newItem, setNewItem] = useState({ description: "", category: "", amount: "", type: "expense", frequency: "monthly", nextExecutionDate: "", clientOrSupplier: "" });

  const totalMonthlyIncome = items.filter(i => i.isActive && i.type === "income").reduce((s, i) => {
    if (i.frequency === "weekly") return s + i.amount * 4;
    if (i.frequency === "yearly") return s + i.amount / 12;
    return s + i.amount;
  }, 0);

  const totalMonthlyExpense = items.filter(i => i.isActive && i.type === "expense").reduce((s, i) => {
    if (i.frequency === "weekly") return s + i.amount * 4;
    if (i.frequency === "yearly") return s + i.amount / 12;
    return s + i.amount;
  }, 0);

  const upcomingItems = [...items].filter(i => i.isActive).sort((a, b) => a.nextExecutionDate.localeCompare(b.nextExecutionDate)).slice(0, 5);

  const toggleActive = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, isActive: !i.isActive } : i));
    toast.success("Status atualizado!");
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Recorrência removida!");
  };

  const handleCreate = () => {
    if (!newItem.description || !newItem.amount || !newItem.category || !newItem.nextExecutionDate) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    const item: RecurringTransaction = {
      id: Date.now().toString(),
      description: newItem.description,
      category: newItem.category,
      amount: parseFloat(newItem.amount),
      type: newItem.type as "income" | "expense",
      frequency: newItem.frequency as "weekly" | "monthly" | "yearly",
      nextExecutionDate: newItem.nextExecutionDate,
      isActive: true,
      clientOrSupplier: newItem.clientOrSupplier,
    };
    setItems(prev => [item, ...prev]);
    setShowNew(false);
    setNewItem({ description: "", category: "", amount: "", type: "expense", frequency: "monthly", nextExecutionDate: "", clientOrSupplier: "" });
    toast.success("Recorrência criada!");
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transações Recorrentes</h1>
          <p className="text-sm text-muted-foreground">Gerencie salários, aluguéis, assinaturas e receitas fixas</p>
        </div>
        <Dialog open={showNew} onOpenChange={setShowNew}>
          <DialogTrigger asChild>
            <Button variant="hero"><Plus className="mr-1.5 h-4 w-4" /> Nova Recorrência</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Transação Recorrente</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Descrição *</Label><Input placeholder="Ex: Salários da equipe" value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Valor (R$) *</Label><Input type="number" placeholder="0,00" value={newItem.amount} onChange={e => setNewItem(p => ({ ...p, amount: e.target.value }))} /></div>
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={newItem.type} onValueChange={v => setNewItem(p => ({ ...p, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="expense">Despesa</SelectItem><SelectItem value="income">Receita</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Frequência *</Label>
                  <Select value={newItem.frequency} onValueChange={v => setNewItem(p => ({ ...p, frequency: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select value={newItem.category} onValueChange={v => setNewItem(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Próxima Execução *</Label><Input type="date" value={newItem.nextExecutionDate} onChange={e => setNewItem(p => ({ ...p, nextExecutionDate: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Cliente / Fornecedor</Label><Input placeholder="Opcional" value={newItem.clientOrSupplier} onChange={e => setNewItem(p => ({ ...p, clientOrSupplier: e.target.value }))} /></div>
              </div>
              <Button variant="hero" className="w-full" onClick={handleCreate}>Salvar Recorrência</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Receita Recorrente Mensal</p>
          <p className="mt-1 text-2xl font-bold text-primary">R$ {Math.round(totalMonthlyIncome).toLocaleString("pt-BR")}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Despesa Recorrente Mensal</p>
          <p className="mt-1 text-2xl font-bold text-destructive">R$ {Math.round(totalMonthlyExpense).toLocaleString("pt-BR")}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-medium text-muted-foreground">Saldo Recorrente</p>
          <p className={`mt-1 text-2xl font-bold ${totalMonthlyIncome - totalMonthlyExpense >= 0 ? "text-primary" : "text-destructive"}`}>
            R$ {Math.round(totalMonthlyIncome - totalMonthlyExpense).toLocaleString("pt-BR")}
          </p>
        </motion.div>
      </div>

      {/* Upcoming */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Próximos Compromissos</h3>
        </div>
        <div className="space-y-2">
          {upcomingItems.map(item => (
            <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${item.type === "income" ? "bg-primary/10" : "bg-destructive/10"}`}>
                  {item.type === "income" ? <ArrowUpRight className="h-3.5 w-3.5 text-primary" /> : <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{item.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.nextExecutionDate).toLocaleDateString("pt-BR")} · {frequencyLabels[item.frequency]}</p>
                </div>
              </div>
              <p className={`text-sm font-semibold ${item.type === "income" ? "text-primary" : "text-foreground"}`}>
                {item.type === "income" ? "+" : "-"}R$ {item.amount.toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Full List */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_100px_110px_90px_80px] gap-4 px-5 py-3 text-xs font-semibold text-muted-foreground border-b border-border bg-secondary/50">
          <span>Descrição</span><span>Frequência</span><span>Categoria</span><span className="text-right">Valor</span><span>Status</span><span></span>
        </div>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
            className={`grid grid-cols-[1fr_100px_100px_110px_90px_80px] gap-4 items-center px-5 py-3.5 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors ${!item.isActive ? "opacity-50" : ""}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.type === "income" ? "bg-primary/10" : "bg-destructive/10"}`}>
                <Repeat className={`h-4 w-4 ${item.type === "income" ? "text-primary" : "text-destructive"}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.description}</p>
                {item.clientOrSupplier && <p className="text-xs text-muted-foreground truncate">{item.clientOrSupplier}</p>}
                <p className="text-[10px] text-muted-foreground">Próx: {new Date(item.nextExecutionDate).toLocaleDateString("pt-BR")}</p>
              </div>
            </div>
            <Badge variant="outline" className="w-fit text-xs">{frequencyLabels[item.frequency]}</Badge>
            <Badge variant="outline" className="w-fit text-xs">{item.category}</Badge>
            <p className={`text-sm font-semibold text-right ${item.type === "income" ? "text-primary" : "text-foreground"}`}>
              {item.type === "income" ? "+" : "-"}R$ {item.amount.toLocaleString("pt-BR")}
            </p>
            <Badge variant="outline" className={`w-fit text-xs ${item.isActive ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"}`}>
              {item.isActive ? "Ativo" : "Inativo"}
            </Badge>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleActive(item.id)}>
                {item.isActive ? <ToggleRight className="h-3.5 w-3.5 text-primary" /> : <ToggleLeft className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteItem(item.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
