import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, resolveCompany } from "../supabase";

export default defineTool({
  name: "list_transactions",
  title: "List transactions",
  description: "List the signed-in user's income and expense transactions, newest first.",
  inputSchema: {
    type: z.enum(["income", "expense"]).nullable().describe("Filter by transaction type, or null for both."),
    from: z.string().nullable().describe("Start date (YYYY-MM-DD) or null."),
    to: z.string().nullable().describe("End date (YYYY-MM-DD) or null."),
    limit: z.number().int().min(1).max(200).nullable().describe("Max rows (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ type, from, to, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const { supabase, company } = await resolveCompany(ctx);
    if (!company) return { content: [{ type: "text", text: "Nenhuma empresa cadastrada ainda." }] };

    let query = supabase
      .from("transactions")
      .select("id, description, category, amount, type, date, payment_status, client_or_supplier")
      .eq("company_id", company.id)
      .order("date", { ascending: false })
      .limit(limit ?? 50);
    if (type) query = query.eq("type", type);
    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { transactions: data ?? [] },
    };
  },
});
