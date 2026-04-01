import { Target, TrendingUp, PiggyBank, Rocket } from "lucide-react";

const goals = [
  { id: "increase-profit", label: "Aumentar lucro", icon: TrendingUp, desc: "Otimizar receitas e reduzir custos" },
  { id: "organize-finances", label: "Organizar finanças", icon: Target, desc: "Ter controle total das entradas e saídas" },
  { id: "reduce-costs", label: "Reduzir custos", icon: PiggyBank, desc: "Identificar e eliminar gastos desnecessários" },
  { id: "scale-business", label: "Escalar o negócio", icon: Rocket, desc: "Crescer de forma sustentável e previsível" },
];

interface Props {
  data: Record<string, string | string[]>;
  onChange: (key: string, value: string | string[]) => void;
}

export default function StepGoals({ data, onChange }: Props) {
  const selected = (data.goals as string[]) || [];
  const toggle = (id: string) => {
    onChange("goals", selected.includes(id) ? selected.filter((g) => g !== id) : [...selected, id]);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Selecione um ou mais objetivos</p>
      <div className="grid grid-cols-1 gap-3">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selected.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggle(goal.id)}
              className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary"
              }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {goal.label}
                </p>
                <p className="text-xs text-muted-foreground">{goal.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
