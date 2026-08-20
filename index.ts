import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

// ---- Tools expostos ao modelo (espelham src/lib/mcp/tools/*.ts) ----
const tools = [
  {
    type: "function",
    function: {
      name: "get_financial_summary",
      description:
        "Resume receita, despesas, lucro, margem e as principais categorias de despesa em um período. Use para visão geral ou perguntas sobre saúde financeira em uma janela de tempo específica.",
      parameters: {
        type: "object",
        properties: {
          days: { type: "integer", minimum: 1, maximum: 365, description: "Janela em dias, padrão 30." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_transactions",
      description:
        "Lista transações de receita ou despesa, mais recentes primeiro. Use para detalhar transações específicas, filtrar por tipo ou por período.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["income", "expense"] },
          from: { type: "string", description: "Data inicial YYYY-MM-DD" },
          to: { type: "string", description: "Data final YYYY-MM-DD" },
          limit: { type: "integer", minimum: 1, maximum: 200 },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_recurring_transactions",
      description:
        "Lista compromissos financeiros recorrentes (salários, aluguéis, assinaturas) com valor e próxima data de execução.",
      parameters: {
        type: "object",
        properties: { only_active: { type: "boolean", description: "Padrão true." } },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_invoices",
      description: "Lista notas fiscais/faturas com valor, imposto, status e vencimento.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Ex: paid, pending, overdue" },
          limit: { type: "integer", minimum: 1, maximum: 200 },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_company",
      description: "Retorna o perfil da empresa: nome, setor, número de funcionários e metas.",
      parameters: { type: "object", properties: {} },
    },
  },
];

type Company = {
  id: string;
  name: string;
  industry: string | null;
  employee_count: string | null;
  monthly_revenue: number | null;
  goals: unknown;
};

async function runTool(
  name: string,
  args: Record<string, unknown>,
  supabase: ReturnType<typeof createClient>,
  company: Company | null,
) {
  if (!company) return { error: "Nenhuma empresa cadastrada ainda." };

  switch (name) {
    case "get_financial_summary": {
      const days = (args.days as number) ?? 30;
      const from = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("transactions")
        .select("amount, type, category, date")
        .eq("company_id", company.id)
        .gte("date", from);
      if (error) return { error: error.message };
      const rows = data ?? [];
      const revenue = rows.filter((r: any) => r.type === "income").reduce((s: number, r: any) => s + Number(r.amount), 0);
      const expenses = rows.filter((r: any) => r.type === "expense").reduce((s: number, r: any) => s + Number(r.amount), 0);
      const profit = revenue - expenses;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      const byCategory = new Map<string, number>();
      for (const r of rows) {
        if (r.type !== "expense") continue;
        byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + Number(r.amount));
      }
      const topExpenseCategories = [...byCategory.entries()]
        .map(([n, v]) => ({ name: n, value: v }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      return {
        company: company.name,
        periodDays: days,
        transactionCount: rows.length,
        revenue,
        expenses,
        profit,
        profitMargin: Number(margin.toFixed(1)),
        topExpenseCategories,
      };
    }
    case "list_transactions": {
      let query = supabase
        .from("transactions")
        .select("id, description, category, amount, type, date, payment_status, client_or_supplier")
        .eq("company_id", company.id)
        .order("date", { ascending: false })
        .limit((args.limit as number) ?? 50);
      if (args.type) query = query.eq("type", args.type as string);
      if (args.from) query = query.gte("date", args.from as string);
      if (args.to) query = query.lte("date", args.to as string);
      const { data, error } = await query;
      if (error) return { error: error.message };
      return { transactions: data ?? [] };
    }
    case "list_recurring_transactions": {
      let query = supabase
        .from("recurring_transactions")
        .select("id, description, category, amount, type, frequency, next_execution_date, is_active")
        .eq("company_id", company.id)
        .order("next_execution_date", { ascending: true });
      if ((args.only_active as boolean) ?? true) query = query.eq("is_active", true);
      const { data, error } = await query;
      if (error) return { error: error.message };
      return { recurring: data ?? [] };
    }
    case "list_invoices": {
      let query = supabase
        .from("invoices")
        .select("id, invoice_number, amount, tax_amount, status, issued_at, due_date, client_id")
        .eq("company_id", company.id)
        .order("issued_at", { ascending: false })
        .limit((args.limit as number) ?? 50);
      if (args.status) query = query.eq("status", args.status as string);
      const { data, error } = await query;
      if (error) return { error: error.message };
      return { invoices: data ?? [] };
    }
    case "get_company":
      return company;
    default:
      return { error: `Ferramenta desconhecida: ${name}` };
  }
}

function buildFinancialSection(ctx: any): string {
  return `
## Resumo Financeiro (contexto inicial — pode estar desatualizado; use as ferramentas disponíveis para números precisos ou fora dessa janela)
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
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, financialContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Resolve usuário + empresa a partir do token real da sessão (RLS-scoped).
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    let company: Company | null = null;
    if (jwt) {
      const { data: userData } = await supabase.auth.getUser(jwt);
      if (userData?.user) {
        const { data } = await supabase
          .from("companies")
          .select("id, name, industry, employee_count, monthly_revenue, goals")
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        company = (data as Company) ?? null;
      }
    }

    const financialDataSection = financialContext
      ? buildFinancialSection(financialContext)
      : "\n## Dados Financeiros\n- Nenhum dado financeiro disponível no momento. Sugira ao usuário que registre transações e configure a empresa para análises personalizadas.";

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

## Ferramentas
Você tem acesso a get_financial_summary, list_transactions, list_recurring_transactions, list_invoices e get_company para consultar dados reais e atualizados da empresa do usuário. Use-as sempre que a pergunta pedir números de um período diferente do resumo acima, detalhes de transações específicas, contas a receber/pagar, recorrências ou qualquer dado que o resumo não cobre. NUNCA invente, estime de cabeça ou arredonde valores financeiros sem ter consultado uma ferramenta ou o resumo fornecido — se não houver dado suficiente mesmo após consultar as ferramentas, diga isso claramente ao usuário em vez de adivinhar.

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

    const workingMessages: any[] = [{ role: "system", content: systemPrompt }, ...messages];
    const canUseTools = !!company;
    let finalContent = "";

    // Fase 1: resolve tool calls (não-streaming), até 4 rounds.
    for (let round = 0; round < 4; round++) {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: workingMessages,
          ...(canUseTools ? { tools, tool_choice: "auto" } : {}),
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          return new Response(
            JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        if (resp.status === 402) {
          return new Response(
            JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        const t = await resp.text();
        console.error("AI gateway error:", resp.status, t);
        return new Response(JSON.stringify({ error: "Erro no serviço de AI" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await resp.json();
      const choice = data.choices?.[0];
      const msg = choice?.message;
      if (!msg) throw new Error("Resposta inválida do gateway de IA");

      if (msg.tool_calls?.length) {
        workingMessages.push({ role: "assistant", content: msg.content ?? null, tool_calls: msg.tool_calls });
        for (const tc of msg.tool_calls) {
          let args: Record<string, unknown> = {};
          try {
            args = JSON.parse(tc.function.arguments || "{}");
          } catch {
            // ignore malformed args, tool handles missing fields
          }
          const result = await runTool(tc.function.name, args, supabase, company);
          workingMessages.push({
            role: "tool",
            tool_call_id: tc.id,
            content: JSON.stringify(result),
          });
        }
        continue; // deixa o modelo ver os resultados e decidir o próximo passo
      }

      finalContent = msg.content ?? "";
      break;
    }

    if (!finalContent) finalContent = "Desculpe, não consegui gerar uma resposta agora. Tente novamente.";

    // Fase 2: entrega ao cliente no mesmo formato SSE que o frontend já parseia.
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const chunkSize = 24;
        for (let i = 0; i < finalContent.length; i += chunkSize) {
          const piece = finalContent.slice(i, i + chunkSize);
          const payload = { choices: [{ delta: { content: piece } }] };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
