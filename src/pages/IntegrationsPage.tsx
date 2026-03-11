import { motion } from "framer-motion";
import { Building2, FileText, Brain, Plug, ArrowRight, Lock, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: typeof Building2;
  status: "available" | "coming_soon" | "beta";
  features: string[];
}

const integrations: Integration[] = [
  {
    id: "open-banking",
    name: "Open Banking",
    description: "Conecte suas contas bancárias para importar transações automaticamente e reconciliar pagamentos em tempo real.",
    category: "Bancário",
    icon: Building2,
    status: "coming_soon",
    features: ["Importação automática de extratos", "Reconciliação de pagamentos", "Saldo em tempo real", "Multi-banco"],
  },
  {
    id: "nfe-integration",
    name: "Nota Fiscal Eletrônica",
    description: "Emita NF-e e NFS-e diretamente pela plataforma com cálculo automático de impostos brasileiros.",
    category: "Fiscal",
    icon: FileText,
    status: "coming_soon",
    features: ["Emissão de NF-e/NFS-e", "Cálculo automático ICMS/ISS", "Consulta de CNPJ", "Armazenamento XML"],
  },
  {
    id: "ai-advanced",
    name: "AI Avançada",
    description: "Modelos de inteligência artificial especializados em análise financeira brasileira com previsão de fluxo de caixa.",
    category: "Inteligência",
    icon: Brain,
    status: "available",
    features: ["Previsão de fluxo de caixa", "Detecção de anomalias", "Análise de tendências", "Recomendações personalizadas"],
  },
  {
    id: "erp-connector",
    name: "Conectores ERP",
    description: "Integre com sistemas ERP como TOTVS, SAP Business One e Bling para sincronizar dados financeiros.",
    category: "ERP",
    icon: Plug,
    status: "coming_soon",
    features: ["Sincronização de dados", "Importação de cadastros", "Exportação de relatórios", "API bidirecional"],
  },
  {
    id: "payment-gateway",
    name: "Gateways de Pagamento",
    description: "Conecte com Pix, boletos e cartões para rastrear recebimentos automaticamente.",
    category: "Pagamentos",
    icon: Zap,
    status: "coming_soon",
    features: ["Pix automático", "Boleto registrado", "Conciliação de cartões", "Notificações de pagamento"],
  },
  {
    id: "accounting-export",
    name: "Exportação Contábil",
    description: "Exporte dados no formato do seu contador — SPED, EFD e planilhas compatíveis com os principais softwares contábeis.",
    category: "Contábil",
    icon: Globe,
    status: "beta",
    features: ["Exportação SPED", "Planilhas contábeis", "Relatórios DRE", "Balancete mensal"],
  },
];

const statusStyles: Record<string, { label: string; class: string }> = {
  available: { label: "Disponível", class: "bg-primary/10 text-primary border-primary/20" },
  coming_soon: { label: "Em breve", class: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  beta: { label: "Beta", class: "bg-accent/10 text-accent-foreground border-accent/20" },
};

export default function IntegrationsPage() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrações</h1>
        <p className="text-sm text-muted-foreground">Conecte a Contuit com seus sistemas e serviços</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integrations.map((int, i) => (
          <motion.div
            key={int.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5 flex flex-col"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <int.icon className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline" className={statusStyles[int.status].class}>
                {statusStyles[int.status].label}
              </Badge>
            </div>
            <h3 className="text-sm font-semibold text-foreground">{int.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed flex-1">{int.description}</p>
            <div className="mt-4 space-y-1.5">
              {int.features.map(f => (
                <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  {f}
                </div>
              ))}
            </div>
            <Button
              variant={int.status === "available" ? "default" : "outline"}
              size="sm"
              className="mt-4 w-full"
              onClick={() => {
                if (int.status === "available") toast.success(`${int.name} já está ativa!`);
                else toast.info(`${int.name} estará disponível em breve.`);
              }}
            >
              {int.status === "available" ? (
                <>Configurar <ArrowRight className="ml-1 h-3.5 w-3.5" /></>
              ) : (
                <><Lock className="mr-1 h-3.5 w-3.5" /> Notificar quando disponível</>
              )}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
