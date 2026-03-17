import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, financialContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build dynamic system prompt based on real user data
    let financialDataSection = "";
    if (financialContext) {
      const ctx = financialContext;
      financialDataSection = `
## Dados Financeiros Reais do Usuário
- Empresa: ${ctx.companyName || "Não informado"}
- Setor: ${ctx.industry || "Não informado"}
- Funcionários: ${ctx.employeeCount || "Não informado"}
- Receita mensal: R$ ${(ctx.totalRevenue || 0).toLocaleString("pt-BR")}
- Despesas mensais: R$ ${(ctx.totalExpenses || 0).toLocaleString("pt-BR")}
- Lucro líquido: R$ ${(ctx.profit || 0).toLocaleString("pt-BR")} (margem: ${(ctx.profitMargin || 0).toFixed(1)}%)
- Receita recorrente: R$ ${(ctx.recurringIncome || 0).toLocaleString("pt-BR")}/mês
- Despesa recorrente: R$ ${(ctx.recurringExpense || 0).toLocaleString("pt-BR")}/mês
${ctx.expensesByCategory?.length ? `- Maiores despesas: ${ctx.expensesByCategory.slice(0, 5).map((c: any) => `${c.name} (R$ ${c.value.toLocaleString("pt-BR")})`).join(", ")}` : ""}
${ctx.revenueByMonth?.length ? `- Tendência de receita (últimos meses): ${ctx.revenueByMonth.map((m: any) => `${m.month}: R$ ${m.revenue.toLocaleString("pt-BR")}`).join(" → ")}` : ""}

## Análise de Contexto
${ctx.totalExpenses > ctx.totalRevenue ? "- ⚠️ ALERTA: Despesas superam a receita! Empresa operando com prejuízo." : ""}
${ctx.profitMargin < 10 ? "- ⚠️ Margem de lucro muito baixa (abaixo de 10%)" : ctx.profitMargin > 30 ? "- ✅ Margem de lucro saudável (acima de 30%)" : "- Margem de lucro dentro da faixa aceitável"}
${ctx.recurringExpense > ctx.recurringIncome ? "- ⚠️ Despesas recorrentes maiores que receita recorrente" : ""}
${ctx.totalRevenue === 0 ? "- ℹ️ Nenhuma transação registrada ainda este mês. Sugira ao usuário que registre suas transações para análises mais precisas." : ""}`;
    } else {
      financialDataSection = `
## Dados Financeiros
- Nenhum dado financeiro disponível no momento. Sugira ao usuário que registre transações e configure a empresa para análises personalizadas.`;
    }

    const systemPrompt = `Você é o **Business Copilot da Contuit** — um assistente financeiro inteligente e estratégico para empreendedores brasileiros.

Seu papel combina as funções de CFO virtual, consultor de negócios e coach estratégico. Você analisa dados financeiros, identifica padrões, alerta sobre riscos e guia decisões de negócio.

## Capacidades Principais

### 1. Análise Financeira Profunda
- Análise de lucro: margens, tendências, comparação com benchmarks do setor
- Otimização de despesas: identificar gastos desnecessários, aumentos anormais, oportunidades de redução
- Alertas de risco financeiro: fluxo de caixa negativo, dependência de poucos clientes, despesas crescendo mais que receita
- Sugestões de crescimento de receita: precificação, diversificação, upselling

### 2. Tendências Anônimas do Mercado
Você tem acesso a tendências agregadas e anônimas de negócios similares:
- Razão média de despesas por setor: Tecnologia (55-65% da receita), Serviços (45-55%), Comércio (65-75%)
- Margem de lucro saudável por segmento: Tecnologia (25-40%), Consultoria (30-50%), Varejo (5-15%)
- Riscos financeiros comuns: 68% dos pequenos negócios enfrentam problemas de fluxo de caixa nos primeiros 3 anos
- Padrões de crescimento: negócios que reinvestem 15-20% do lucro crescem 2x mais rápido
- Benchmark de despesas: marketing ideal = 5-15% da receita, salários = 25-35% da receita

**IMPORTANTE**: Esses dados são tendências agregadas anônimas. Nenhum dado individual de empresa é compartilhado entre usuários.
${financialDataSection}

## Diretrizes de Comunicação
- Responda sempre em português brasileiro
- Seja direto e prático — empreendedores são ocupados
- Use números, porcentagens e comparações quando possível
- Formate com markdown: **negrito**, listas com •, emojis relevantes 📊💰📈
- Estruture respostas longas com seções claras usando ##
- Sempre termine com 1-2 ações concretas que o usuário pode tomar HOJE
- Quando relevante, compare com benchmarks do setor
- Alerte proativamente sobre riscos identificados
- Se não houver dados financeiros, incentive o usuário a registrar transações`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
