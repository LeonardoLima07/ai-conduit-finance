import { Brain, Send, Loader2, Lightbulb, TrendingUp, ShieldAlert, DollarSign, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { useFinancialData } from "@/hooks/useFinancialData";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const suggestedQuestions = [
  { icon: DollarSign, text: "Posso contratar mais um funcionário?" },
  { icon: TrendingUp, text: "Como aumentar minha margem de lucro?" },
  { icon: ShieldAlert, text: "Quais despesas estão prejudicando meu negócio?" },
  { icon: Target, text: "Qual receita preciso para atingir minha meta?" },
];

const strategicQuestions = [
  "Que ação você pode tomar este mês para aumentar sua receita em 10%?",
  "Qual despesa você poderia reduzir sem afetar suas operações?",
  "Qual meta financeira você quer atingir nos próximos 90 dias?",
  "Se pudesse investir R$ 10.000 no negócio agora, onde teria mais retorno?",
  "Qual processo interno consome mais tempo e poderia ser automatizado?",
  "Você está cobrando o preço justo pelo valor que entrega?",
];

export default function AdvisorPage() {
  const { data } = useFinancialData();

  const buildWelcome = (): Msg => {
    if (!data || data.totalRevenue === 0) {
      return {
        role: "assistant",
        content: "Olá! 👋 Sou o **Business Copilot** da Contuit — seu parceiro estratégico financeiro.\n\nAinda não encontrei dados financeiros registrados. Para que eu possa te ajudar com análises precisas:\n\n• 📝 Registre suas **transações** (receitas e despesas)\n• 🏢 Complete o **briefing da empresa**\n• 🔄 Cadastre suas **recorrências** (salários, aluguéis, contratos)\n\nCom esses dados, posso analisar sua saúde financeira, identificar oportunidades e alertar sobre riscos.\n\nComo posso ajudar hoje?",
      };
    }
    return {
      role: "assistant",
      content: `Olá! 👋 Sou o **Business Copilot** da Contuit — seu parceiro estratégico financeiro.\n\nAnalisei os dados da **${data.companyName}** e identifiquei:\n\n• 💰 Receita mensal: **R$ ${data.totalRevenue.toLocaleString("pt-BR")}**\n• 📊 Despesas: **R$ ${data.totalExpenses.toLocaleString("pt-BR")}**\n• ${data.profit >= 0 ? "✅" : "⚠️"} Lucro: **R$ ${data.profit.toLocaleString("pt-BR")}** (margem ${data.profitMargin.toFixed(1)}%)\n• 🔄 Receita recorrente: **R$ ${data.recurringIncome.toLocaleString("pt-BR")}**/mês\n\nComo posso ajudar hoje?`,
    };
  };

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showStrategic, setShowStrategic] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Update welcome message when data loads
  useEffect(() => {
    setMessages([buildWelcome()]);
  }, [data]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setShowStrategic(false);
    const userMsg: Msg = { role: "user", content: text };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages.map(m => ({ role: m.role, content: m.content })),
          financialContext: data ? {
            companyName: data.companyName,
            industry: data.industry,
            employeeCount: data.employeeCount,
            totalRevenue: data.totalRevenue,
            totalExpenses: data.totalExpenses,
            profit: data.profit,
            profitMargin: data.profitMargin,
            recurringIncome: data.recurringIncome,
            recurringExpense: data.recurringExpense,
            expensesByCategory: data.expensesByCategory,
            revenueByMonth: data.revenueByMonth,
          } : null,
        }),
      });

      if (resp.status === 429) { toast.error("Limite de requisições excedido. Aguarde um momento."); setIsLoading(false); return; }
      if (resp.status === 402) { toast.error("Créditos insuficientes. Adicione créditos ao seu workspace."); setIsLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error("Failed to start stream");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsert = (chunk: string) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && prev.length > allMessages.length) {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...prev, { role: "assistant", content: assistantSoFar }];
        });
      };

      let streamDone = false;
      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao conectar com o Business Copilot.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh)] flex-col">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Business Copilot</h1>
            <p className="text-xs text-muted-foreground">CFO virtual • Consultor estratégico • Coach financeiro</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-4" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && !messages.find((_, i) => i === messages.length - 1 && messages[i]?.role === "assistant") && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-secondary px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
        )}

        {messages.length === 1 && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button key={q.text} onClick={() => sendMessage(q.text)}
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                  <q.icon className="h-3 w-3" />
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {showStrategic && messages.length <= 2 && (
          <div className="mt-6 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Perguntas Estratégicas</h3>
              <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">Coach Mode</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Reflita sobre essas perguntas para melhorar suas decisões financeiras:</p>
            <div className="grid gap-2">
              {strategicQuestions.map((q) => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="text-left rounded-lg border border-border/50 bg-background px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                  💡 {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input placeholder="Pergunte sobre seu negócio, finanças ou estratégia..." value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)} disabled={isLoading} />
          <Button variant="hero" size="icon" onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
