import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, resolveCompany } from "../supabase";

export default defineTool({
  name: "financial_summary",
  title: "Financial summary",
  description:
    "Summarize revenue, expenses, profit, margin and top expense categories for a period (default: last 30 days).",
  inputSchema: {
    days: z.number().int().min(1).max(365).nullable().describe("Look-back window in days (default 30)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ days }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const { supabase, company } = await resolveCompany(ctx);
    if (!company) return { content: [{ type: "text", text: "Nenhuma empresa cadastrada ainda." }] };

    const window = days ?? 30;
    const from = new Date(Date.now() - window * 86_400_000).toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from("transactions")
      .select("amount, type, category, date")
      .eq("company_id", company.id)
      .gte("date", from);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const rows = data ?? [];
    const revenue = rows.filter((r) => r.type === "income").reduce((s, r) => s + Number(r.amount), 0);
    const expenses = rows.filter((r) => r.type === "expense").reduce((s, r) => s + Number(r.amount), 0);
    const profit = revenue - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    const byCategory = new Map<string, number>();
    for (const r of rows) {
      if (r.type !== "expense") continue;
      byCategory.set(r.category, (byCategory.get(r.category) ?? 0) + Number(r.amount));
    }
    const topExpenseCategories = [...byCategory.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const summary = {
      company: company.name,
      periodDays: window,
      transactionCount: rows.length,
      revenue,
      expenses,
      profit,
      profitMargin: Number(margin.toFixed(1)),
      topExpenseCategories,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(summary) }],
      structuredContent: { summary },
    };
  },
});
