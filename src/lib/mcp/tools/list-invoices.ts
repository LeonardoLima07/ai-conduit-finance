import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, resolveCompany } from "../supabase";

export default defineTool({
  name: "list_invoices",
  title: "List invoices",
  description: "List the signed-in user's invoices with amount, tax, status and due date.",
  inputSchema: {
    status: z.string().nullable().describe("Filter by status (e.g. paid, pending) or null for all."),
    limit: z.number().int().min(1).max(200).nullable().describe("Max rows (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const { supabase, company } = await resolveCompany(ctx);
    if (!company) return { content: [{ type: "text", text: "Nenhuma empresa cadastrada ainda." }] };

    let query = supabase
      .from("invoices")
      .select("id, invoice_number, amount, tax_amount, status, issued_at, due_date, client_id")
      .eq("company_id", company.id)
      .order("issued_at", { ascending: false })
      .limit(limit ?? 50);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { invoices: data ?? [] },
    };
  },
});
