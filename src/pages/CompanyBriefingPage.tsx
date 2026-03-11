import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Users, DollarSign, Target, Save, Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const industries = [
  "Comércio / Varejo", "Serviços", "Tecnologia", "Saúde", "Educação",
  "Alimentação", "Construção", "Consultoria", "Marketing", "Indústria",
];
const employeeRanges = ["Apenas eu (MEI)", "2–5", "6–15", "16–50", "51–100", "100+"];
const revenueRanges = [
  "Até R$ 10.000/mês", "R$ 10.000 – R$ 30.000", "R$ 30.000 – R$ 80.000",
  "R$ 80.000 – R$ 200.000", "R$ 200.000 – R$ 500.000", "Acima de R$ 500.000",
];
const goalOptions = [
  "Reduzir custos", "Aumentar receita", "Contratar funcionários",
  "Expandir mercado", "Automatizar processos", "Melhorar fluxo de caixa",
  "Lançar novo produto", "Internacionalizar",
];

export default function CompanyBriefingPage() {
  const [companyName, setCompanyName] = useState("Minha Empresa LTDA");
  const [cnpj, setCnpj] = useState("");
  const [industry, setIndustry] = useState("Tecnologia");
  const [employees, setEmployees] = useState("6–15");
  const [revenue, setRevenue] = useState("R$ 80.000 – R$ 200.000");
  const [products, setProducts] = useState("");
  const [goals, setGoals] = useState<string[]>(["Aumentar receita", "Melhorar fluxo de caixa"]);
  const [challenges, setChallenges] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleGoal = (g: string) => {
    setGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const handleSave = async () => {
    setSaving(true);
    // In production, save to companies table
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success("Briefing atualizado! A AI agora está personalizada para sua empresa.");
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
          <Brain className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Briefing da Empresa</h1>
          <p className="text-sm text-muted-foreground">Personalize a AI para seu negócio</p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-sm text-foreground">
          <strong>Por que preencher?</strong> Essas informações permitem que a AI analise seu negócio com contexto real — recomendações de contratação, precificação, investimentos e estratégias serão personalizadas para sua realidade.
        </p>
      </div>

      {/* Company Info */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2 text-foreground"><Building2 className="h-5 w-5 text-primary" /><h2 className="font-semibold">Dados da Empresa</h2></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Nome da Empresa</Label><Input value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
          <div className="space-y-2"><Label>CNPJ</Label><Input value={cnpj} onChange={e => setCnpj(e.target.value)} placeholder="12.345.678/0001-90" /></div>
        </div>
        <div className="space-y-2">
          <Label>Setor / Indústria</Label>
          <div className="flex flex-wrap gap-2">
            {industries.map(ind => (
              <button key={ind} onClick={() => setIndustry(ind)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${industry === ind ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-card text-muted-foreground hover:border-primary/30"}`}>
                {ind}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2"><Label>Produtos / Serviços</Label><Input value={products} onChange={e => setProducts(e.target.value)} placeholder="Ex: Consultoria de TI, Desenvolvimento Web" /></div>
      </motion.div>

      {/* Team & Revenue */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2 text-foreground"><Users className="h-5 w-5 text-primary" /><h2 className="font-semibold">Equipe & Faturamento</h2></div>
        <div className="space-y-2">
          <Label>Número de Funcionários</Label>
          <div className="flex flex-wrap gap-2">
            {employeeRanges.map(r => (
              <button key={r} onClick={() => setEmployees(r)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${employees === r ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-card text-muted-foreground hover:border-primary/30"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Faturamento Mensal</Label>
          <div className="flex flex-wrap gap-2">
            {revenueRanges.map(r => (
              <button key={r} onClick={() => setRevenue(r)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${revenue === r ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-card text-muted-foreground hover:border-primary/30"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Goals */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2 text-foreground"><Target className="h-5 w-5 text-primary" /><h2 className="font-semibold">Objetivos & Desafios</h2></div>
        <div className="space-y-2">
          <Label>Objetivos de Negócio (selecione vários)</Label>
          <div className="flex flex-wrap gap-2">
            {goalOptions.map(g => (
              <button key={g} onClick={() => toggleGoal(g)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${goals.includes(g) ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-card text-muted-foreground hover:border-primary/30"}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2"><Label>Maiores Desafios</Label><Textarea value={challenges} onChange={e => setChallenges(e.target.value)} placeholder="Descreva os principais desafios que sua empresa enfrenta..." rows={3} /></div>
      </motion.div>

      <Button variant="hero" size="lg" className="w-full" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Salvar e Personalizar AI
      </Button>
    </div>
  );
}
