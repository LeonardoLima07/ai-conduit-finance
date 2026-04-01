import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Building2, Target, Receipt, LayoutDashboard, Sparkles, Loader2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import StepBusinessInfo from "@/components/onboarding/StepBusinessInfo";
import StepGoals from "@/components/onboarding/StepGoals";
import StepFirstTransaction, { type OnboardingTransaction } from "@/components/onboarding/StepFirstTransaction";
import StepDashboardPreview from "@/components/onboarding/StepDashboardPreview";
import StepAIInsight from "@/components/onboarding/StepAIInsight";

const steps = [
  { title: "Sobre sua empresa", subtitle: "Informações básicas do seu negócio", icon: Building2 },
  { title: "Seus objetivos", subtitle: "O que você quer alcançar?", icon: Target },
  { title: "Primeira transação", subtitle: "Adicione receitas ou despesas", icon: Receipt },
  { title: "Seu dashboard", subtitle: "Prévia dos seus números", icon: LayoutDashboard },
  { title: "Insight da IA", subtitle: "Sua primeira análise inteligente", icon: Sparkles },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [transactions, setTransactions] = useState<OnboardingTransaction[]>([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleChange = (key: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const canAdvance = () => {
    if (step === 0) return !!(formData.companyName && formData.industry);
    if (step === 1) return ((formData.goals as string[]) || []).length > 0;
    return true;
  };

  const handleFinish = async () => {
    if (!user) { toast.error("Você precisa estar logado."); return; }
    setSaving(true);

    try {
      // Upsert company
      const { data: existing } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      let companyId: string;

      const companyPayload = {
        name: formData.companyName as string,
        cnpj: (formData.cnpj as string) || null,
        industry: (formData.industry as string) || null,
        employee_count: (formData.employees as string) || null,
        monthly_revenue: (formData.revenue as string) || null,
        goals: (formData.goals as string[]) || null,
      };

      if (existing && existing.length > 0) {
        companyId = existing[0].id;
        const { error } = await supabase.from("companies").update(companyPayload).eq("id", companyId);
        if (error) throw error;
      } else {
        const { data: created, error } = await supabase
          .from("companies")
          .insert({ ...companyPayload, user_id: user.id })
          .select("id")
          .single();
        if (error) throw error;
        companyId = created.id;
      }

      // Insert transactions
      if (transactions.length > 0) {
        const txRows = transactions.map((tx) => ({
          company_id: companyId,
          description: tx.description,
          amount: Number(tx.amount),
          type: tx.type,
          category: tx.category,
          date: new Date().toISOString().split("T")[0],
          payment_status: "paid" as const,
        }));
        const { error } = await supabase.from("transactions").insert(txRows);
        if (error) throw error;
      }

      toast.success("Tudo pronto! Bem-vindo à Contuit 🚀");
      navigate("/dashboard");
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao salvar: " + (e.message || "Tente novamente."));
    } finally {
      setSaving(false);
    }
  };

  const StepIcon = steps[step].icon;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background">
      <div className="w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium">Passo {step + 1} de {steps.length}</span>
            <span className="text-xs text-muted-foreground">{Math.round(((step + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--gradient-hero)" }}
              animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-between mt-4">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                    i < step ? "bg-primary text-primary-foreground" :
                    i === step ? "bg-gradient-to-br from-primary to-purple-600 text-primary-foreground shadow-md" :
                    "bg-secondary text-muted-foreground"
                  }`}>
                    {i < step ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={`hidden sm:block text-[10px] ${i <= step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-1">
                <StepIcon className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-bold text-foreground">{steps[step].title}</h1>
              </div>
              <p className="text-sm text-muted-foreground ml-8">{steps[step].subtitle}</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 max-h-[50vh] overflow-y-auto">
              {step === 0 && <StepBusinessInfo data={formData} onChange={handleChange} />}
              {step === 1 && <StepGoals data={formData} onChange={handleChange} />}
              {step === 2 && <StepFirstTransaction transactions={transactions} onChange={setTransactions} />}
              {step === 3 && <StepDashboardPreview transactions={transactions} companyName={(formData.companyName as string) || ""} />}
              {step === 4 && (
                <StepAIInsight
                  transactions={transactions}
                  goals={(formData.goals as string[]) || []}
                  revenue={(formData.revenue as string) || ""}
                  industry={(formData.industry as string) || ""}
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-5 flex justify-between">
          <Button variant="outline" onClick={() => setStep((p) => p - 1)} disabled={step === 0}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
          {step < steps.length - 1 ? (
            <Button variant="hero" onClick={() => setStep((p) => p + 1)} disabled={!canAdvance()}>
              Próximo <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="hero" onClick={handleFinish} disabled={saving}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
              {saving ? "Configurando..." : "Ir para o Dashboard"}
            </Button>
          )}
        </div>

        {/* Skip option */}
        {step < 3 && (
          <button
            onClick={() => setStep(steps.length - 1)}
            className="mt-3 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Pular e configurar depois →
          </button>
        )}
      </div>
    </div>
  );
}
