import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const industries = [
  "Comércio / Varejo", "Serviços", "Tecnologia", "Saúde", "Educação",
  "Alimentação", "Construção", "Consultoria", "Marketing", "Outro",
];

const employeeRanges = ["Apenas eu (MEI)", "2–5", "6–15", "16–50", "51–100", "100+"];

const revenueRanges = [
  "Até R$ 10.000/mês", "R$ 10.000 – R$ 30.000", "R$ 30.000 – R$ 80.000",
  "R$ 80.000 – R$ 200.000", "R$ 200.000 – R$ 500.000", "Acima de R$ 500.000",
];

interface Props {
  data: Record<string, string | string[]>;
  onChange: (key: string, value: string | string[]) => void;
}

export default function StepBusinessInfo({ data, onChange }: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">Nome da Empresa</Label>
        <Input
          placeholder="Minha Empresa LTDA"
          value={(data.companyName as string) || ""}
          onChange={(e) => onChange("companyName", e.target.value)}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">Setor / Indústria</Label>
        <div className="grid grid-cols-2 gap-2">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => onChange("industry", ind)}
              className={`rounded-xl border px-3 py-2.5 text-sm text-left transition-all duration-200 ${
                data.industry === ind
                  ? "border-primary bg-primary/10 text-primary font-medium shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">Funcionários</Label>
        <div className="grid grid-cols-3 gap-2">
          {employeeRanges.map((range) => (
            <button
              key={range}
              onClick={() => onChange("employees", range)}
              className={`rounded-xl border px-3 py-2.5 text-sm text-center transition-all duration-200 ${
                data.employees === range
                  ? "border-primary bg-primary/10 text-primary font-medium shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-foreground">Faturamento mensal</Label>
        <div className="grid grid-cols-2 gap-2">
          {revenueRanges.map((range) => (
            <button
              key={range}
              onClick={() => onChange("revenue", range)}
              className={`rounded-xl border px-3 py-2.5 text-sm text-left transition-all duration-200 ${
                data.revenue === range
                  ? "border-primary bg-primary/10 text-primary font-medium shadow-sm"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-secondary"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
