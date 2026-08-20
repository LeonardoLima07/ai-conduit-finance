import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, resolveCompany } from "../supabase";

export default defineTool({
  name: "list_recurring_transactions",
  title: "List recurring commitments",
  description: "List recurring income and expenses (salaries, rent, subscriptions) with next execution dates.",
  inputSchema: {
    only_active: z.boolean().nullable().describe("Return only active recurrences (default true)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ only_active }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const { supabase, company } = await resolveCompany(ctx);
    if (!company) return { content: [{ type: "text", text: "Nenhuma empresa cadastrada ainda." }] };

    let query = supabase
      .from("recurring_transactions")
      .select("id, description, category, amount, type, frequency, next_execution_date, is_active")
      .eq("company_id", company.id)
      .order("next_execution_date", { ascending: true });
    if (only_active ?? true) query = query.eq("is_active", true);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { recurring: data ?? [] },
    };
  },
});
