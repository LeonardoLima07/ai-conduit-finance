import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, resolveCompany } from "../supabase";

export default defineTool({
  name: "create_transaction",
  title: "Create transaction",
  description: "Record a new income or expense transaction for the signed-in user's company.",
  inputSchema: {
    description: z.string().trim().min(1).describe("What the transaction is for."),
    category: z.string().trim().min(1).describe("Category, e.g. Marketing, Salários."),
    amount: z.number().positive().describe("Amount in BRL."),
    type: z.enum(["income", "expense"]).describe("income or expense."),
    date: z.string().nullable().describe("Date (YYYY-MM-DD) or null for today."),
    payment_status: z.enum(["paid", "pending"]).nullable().describe("Payment status or null for paid."),
    client_or_supplier: z.string().nullable().describe("Client or supplier name, or null."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const { supabase, company } = await resolveCompany(ctx);
    if (!company) {
      return {
        content: [{ type: "text", text: "Cadastre sua empresa no Contuit antes de criar transações." }],
        isError: true,
      };
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        company_id: company.id,
        description: input.description,
        category: input.category,
        amount: input.amount,
        type: input.type,
        date: input.date ?? new Date().toISOString().slice(0, 10),
        payment_status: input.payment_status ?? "paid",
        client_or_supplier: input.client_or_supplier ?? null,
      })
      .select()
      .single();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { transaction: data },
    };
  },
});
