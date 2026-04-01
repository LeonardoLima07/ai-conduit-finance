import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownCircle, ArrowUpCircle, Check } from "lucide-react";

export interface OnboardingTransaction {
  type: "income" | "expense";
  description: string;
  amount: string;
  category: string;
}

const incomeCategories = ["Vendas", "Serviços", "Assinaturas", "Outros"];
const expenseCategories = ["Salários", "Aluguel", "Marketing", "Fornecedores", "Software", "Outros"];

interface Props {
  transactions: OnboardingTransaction[];
  onChange: (txs: OnboardingTransaction[]) => void;
}

export default function StepFirstTransaction({ transactions, onChange }: Props) {
  const [type, setType] = useState<"income" | "expense">("income");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const categories = type === "income" ? incomeCategories : expenseCategories;

  const addTx = () => {
    if (!desc || !amount || !category) return;
    onChange([...transactions, { type, description: desc, amount, category }]);
    setDesc("");
    setAmount("");
    setCategory("");
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Adicione pelo menos uma transação para ver a Contuit em ação.
      </p>

      {/* Type selector */}
      <div className="grid grid-cols-2 gap-3">
        {(["income", "expense"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setType(t); setCategory(""); }}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-medium transition-all duration-200 ${
              type === t
                ? t === "income"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                  : "border-red-500 bg-red-500/10 text-red-600"
                : "border-border bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            {t === "income" ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
            {t === "income" ? "Receita" : "Despesa"}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="space-y-3">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Descrição</Label>
          <Input placeholder="Ex: Venda de consultoria" value={desc} onChange={(e) => setDesc(e.target.value)} className="mt-1 h-10" />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Valor (R$)</Label>
          <Input placeholder="5.000" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 h-10" />
        </div>
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Categoria</Label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-lg border px-2 py-1.5 text-xs transition-all ${
                  category === c
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={addTx}
        disabled={!desc || !amount || !category}
        className="w-full rounded-xl bg-primary/10 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        + Adicionar transação
      </button>

      {/* Added list */}
      {transactions.length > 0 && (
        <div className="space-y-2 rounded-xl border border-border bg-secondary/50 p-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Adicionadas</p>
          {transactions.map((tx, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-primary" />
                <span className="text-foreground">{tx.description}</span>
              </div>
              <span className={tx.type === "income" ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                {tx.type === "income" ? "+" : "-"}R$ {Number(tx.amount).toLocaleString("pt-BR")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
