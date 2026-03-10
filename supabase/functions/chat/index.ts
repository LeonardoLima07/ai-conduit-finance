import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é o Consultor de Negócios AI da Contuit — uma plataforma de contabilidade inteligente para empreendedores brasileiros.

Seu papel é ser um CFO virtual e consultor de negócios. Você analisa dados financeiros e dá conselhos práticos e acionáveis.

Diretrizes:
- Responda sempre em português brasileiro
- Seja direto e prático — empreendedores são ocupados
- Use números e porcentagens quando possível
- Formate com markdown: use **negrito**, listas com •, e emojis relevantes
- Quando não tiver dados reais, use os dados de exemplo da plataforma para demonstrar
- Áreas de expertise: receitas, despesas, margens, impostos brasileiros (ICMS, ISS, IRPJ), fluxo de caixa, contratações, investimentos
- Sempre termine com uma sugestão acionável

Dados financeiros atuais do usuário (exemplo):
- Receita mensal: R$ 127.450
- Despesas mensais: R$ 84.230
- Lucro líquido: R$ 43.220
- Margem de lucro: 33.9%
- Health Score: 92/100
- Maiores despesas: Salários (R$ 35.000), Marketing (R$ 15.000), Aluguel (R$ 12.000)
- Reserva de caixa: R$ 185.000
- Número de funcionários: 8
- Segmento: Tecnologia / Consultoria`;

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
