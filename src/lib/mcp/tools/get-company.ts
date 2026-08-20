import { defineTool } from "@lovable.dev/mcp-js";
import { notAuthenticated, resolveCompany } from "../supabase";

export default defineTool({
  name: "get_company",
  title: "Get company profile",
  description: "Return the signed-in user's company profile (name, industry, employees, goals).",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const { company } = await resolveCompany(ctx);
    if (!company) {
      return { content: [{ type: "text", text: "Nenhuma empresa cadastrada ainda." }] };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(company) }],
      structuredContent: { company },
    };
  },
});
