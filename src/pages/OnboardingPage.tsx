import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Building2, Users, DollarSign, Target, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const industries = [
  "Comércio / Varejo", "Serviços", "Tecnologia", "Saúde", "Educação",
  "Alimentação", "Construção", "Consultoria", "Marketing", "Outro",
];

const employeeRanges = ["Apenas eu (MEI)", "2–5", "6–15", "16–50", "51–100", "100+"];

const revenueRanges = [
  "Até R$ 10.000/mês", "R$ 10.000 – R$ 30.000", "R$ 30.000 – R$ 80.000",
  "R$ 80.000 – R$ 200.000", "R$ 200.000 – R$ 500.000", "Acima de R$ 500.000",
];

const goals = [
  "Reduzir custos", "Aumentar receita", "Contratar funcionários",
  "Expandir para novos mercados", "Automatizar processos", "Melhorar fluxo de caixa",
];

interface StepProps {
  data: Record<string, string | string[]>;
  onChange: (key: string, value: string | string[]) => void;
}

function StepCompanyInfo({ data, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Nome da Empresa</Label>
        <Input
          placeholder="Minha Empresa LTDA"
          value={(data.companyName as string) || ""}
          onChange={(e) => onChange("companyName", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>CNPJ</Label>
        <Input
          placeholder="12.345.678/0001-90"
          value={(data.cnpj as string) || ""}
          onChange={(e) => onChange("cnpj", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label>Setor / Indústria</Label>
        <div className="grid grid-cols-2 gap-2">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => onChange("industry", ind)}
              className={`rounded-lg border px-3 py-2 text-sm text-left transition-all ${
                data.industry === ind
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepTeamSize({ data, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Quantos funcionários?</Label>
        <div className="grid grid-cols-2 gap-2">
          {employeeRanges.map((range) => (
            <button
              key={range}
              onClick={() => onChange("employees", range)}
              className={`rounded-lg border px-3 py-2.5 text-sm text-left transition-all ${
                data.employees === range
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Principais produtos / serviços</Label>
        <Input
          placeholder="Ex: Consultoria de marketing, E-commerce de roupas..."
          value={(data.products as string) || ""}
          onChange={(e) => onChange("products", e.target.value)}
        />
      </div>
    </div>
  );
}

function StepRevenue({ data, onChange }: StepProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Faturamento mensal aproximado</Label>
        <div className="grid grid-cols-1 gap-2">
          {revenueRanges.map((range) => (
            <button
              key={range}
              onClick={() => onChange("revenue", range)}
              className={`rounded-lg border px-4 py-3 text-sm text-left transition-all ${
                data.revenue === range
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Preço médio dos seus produtos/serviços</Label>
        <Input
          placeholder="Ex: R$ 500"
          value={(data.avgPrice as string) || ""}
          onChange={(e) => onChange("avgPrice", e.target.value)}
        />
      </div>
    </div>
  );
}

function StepGoals({ data, onChange }: StepProps) {
  const selectedGoals = (data.goals as string[]) || [];
  const toggleGoal = (goal: string) => {
    onChange(
      "goals",
      selectedGoals.includes(goal)
        ? selectedGoals.filter((g) => g !== goal)
        : [...selectedGoals, goal]
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Quais são seus principais objetivos? (selecione vários)</Label>
        <div className="grid grid-cols-1 gap-2">
          {goals.map((goal) => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`rounded-lg border px-4 py-3 text-sm text-left transition-all ${
                selectedGoals.includes(goal)
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border bg-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Maiores desafios atuais</Label>
        <Input
          placeholder="Ex: Fluxo de caixa instável, muitos impostos..."
          value={(data.challenges as string) || ""}
          onChange={(e) => onChange("challenges", e.target.value)}
        />
      </div>
    </div>
  );
}

const steps = [
  { title: "Sobre sua empresa", subtitle: "Conte-nos sobre o seu negócio", icon: Building2, component: StepCompanyInfo },
  { title: "Equipe", subtitle: "Tamanho e estrutura da sua equipe", icon: Users, component: StepTeamSize },
  { title: "Financeiro", subtitle: "Seus números financeiros", icon: DollarSign, component: StepRevenue },
  { title: "Objetivos", subtitle: "Para onde você quer ir", icon: Target, component: StepGoals },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Record<string, string | string[]>>({});
  const navigate = useNavigate();

  const handleChange = (key: string, value: string | string[]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const StepComponent = steps[currentStep].component;

  const handleFinish = () => {
    // In production, save to Supabase and configure AI agent
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-background">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    i <= currentStep
                      ? "bg-gradient-hero text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {i < currentStep ? "✓" : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`hidden sm:block h-0.5 w-8 lg:w-16 transition-all ${i < currentStep ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                {(() => { const Icon = steps[currentStep].icon; return <Icon className="h-6 w-6 text-primary" />; })()}
                <h1 className="text-2xl font-bold text-foreground">{steps[currentStep].title}</h1>
              </div>
              <p className="text-sm text-muted-foreground">{steps[currentStep].subtitle}</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <StepComponent data={data} onChange={handleChange} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((p) => p - 1)}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button variant="hero" onClick={() => setCurrentStep((p) => p + 1)}>
              Próximo <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="hero" onClick={handleFinish}>
              <Sparkles className="mr-1 h-4 w-4" /> Configurar meu AI Agent
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
