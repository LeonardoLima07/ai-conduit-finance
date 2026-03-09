import { Play, BookOpen, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const categories = ["Todos", "Primeiros Passos", "Notas Fiscais", "Relatórios", "AI Assistant", "Finanças"];

const tutorials = [
  {
    id: 1, title: "Como começar no Contuit", duration: "5 min",
    category: "Primeiros Passos", thumbnail: "🚀",
    description: "Aprenda a configurar sua conta e dar os primeiros passos na plataforma.",
  },
  {
    id: 2, title: "Emitindo sua primeira nota fiscal", duration: "8 min",
    category: "Notas Fiscais", thumbnail: "📄",
    description: "Guia completo para criar e enviar notas fiscais com cálculo automático de impostos.",
  },
  {
    id: 3, title: "Entendendo o Dashboard Financeiro", duration: "6 min",
    category: "Finanças", thumbnail: "📊",
    description: "Como ler e interpretar os gráficos e métricas do seu painel financeiro.",
  },
  {
    id: 4, title: "Usando o AI Business Advisor", duration: "7 min",
    category: "AI Assistant", thumbnail: "🤖",
    description: "Descubra como fazer perguntas ao seu assistente AI e obter insights personalizados.",
  },
  {
    id: 5, title: "Relatórios contábeis explicados", duration: "10 min",
    category: "Relatórios", thumbnail: "📈",
    description: "Entenda DRE, balanço patrimonial e fluxo de caixa de forma simples.",
  },
  {
    id: 6, title: "Impostos por estado brasileiro", duration: "12 min",
    category: "Notas Fiscais", thumbnail: "🏛️",
    description: "Como o Contuit calcula impostos automaticamente baseado no estado do cliente.",
  },
  {
    id: 7, title: "Analisando despesas com AI", duration: "6 min",
    category: "AI Assistant", thumbnail: "💡",
    description: "Use a inteligência artificial para identificar gastos desnecessários.",
  },
  {
    id: 8, title: "Previsão de fluxo de caixa", duration: "8 min",
    category: "Finanças", thumbnail: "🔮",
    description: "Como usar as projeções de AI para planejar o futuro financeiro da sua empresa.",
  },
  {
    id: 9, title: "Configurando cobrança recorrente", duration: "5 min",
    category: "Notas Fiscais", thumbnail: "🔄",
    description: "Automatize faturas recorrentes para clientes com contratos mensais.",
  },
];

export default function EducationPage() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [playingId, setPlayingId] = useState<number | null>(null);

  const filtered = activeCategory === "Todos"
    ? tutorials
    : tutorials.filter((t) => t.category === activeCategory);

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> Central de Aprendizado
        </h1>
        <p className="text-sm text-muted-foreground">
          Tutoriais e guias para aproveitar ao máximo o Contuit
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tutorial Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((tutorial, i) => (
          <motion.div
            key={tutorial.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:shadow-card hover:border-primary/20 cursor-pointer"
            onClick={() => setPlayingId(playingId === tutorial.id ? null : tutorial.id)}
          >
            {/* Thumbnail */}
            <div className="relative bg-gradient-dark flex items-center justify-center h-36">
              <span className="text-5xl">{tutorial.thumbnail}</span>
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 group-hover:bg-foreground/10 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-5 w-5 ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-foreground/80 px-2 py-0.5 text-xs text-primary-foreground">
                <Clock className="h-3 w-3" /> {tutorial.duration}
              </div>
            </div>

            <div className="p-4">
              <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mb-2">
                {tutorial.category}
              </span>
              <h3 className="text-sm font-semibold text-foreground">{tutorial.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{tutorial.description}</p>
            </div>

            {/* Expanded player placeholder */}
            {playingId === tutorial.id && (
              <div className="border-t border-border bg-secondary p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Play className="h-4 w-4 text-primary" />
                  <span>Vídeo será carregado aqui quando conectado ao backend</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
