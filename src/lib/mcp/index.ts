import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getCompanyTool from "./tools/get-company";
import listTransactionsTool from "./tools/list-transactions";
import createTransactionTool from "./tools/create-transaction";
import financialSummaryTool from "./tools/financial-summary";
import listInvoicesTool from "./tools/list-invoices";
import listRecurringTool from "./tools/list-recurring";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "contuit-ai-finance-copilot",
  title: "Contuit: AI Finance Copilot",
  version: "0.1.0",
  instructions:
    "Ferramentas financeiras do Contuit para a empresa do usuário autenticado. Use financial_summary para visão geral de receita, despesas e margem; list_transactions e list_invoices para detalhes; list_recurring_transactions para compromissos futuros; create_transaction para registrar receitas ou despesas. Valores em BRL.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getCompanyTool,
    financialSummaryTool,
    listTransactionsTool,
    createTransactionTool,
    listInvoicesTool,
    listRecurringTool,
  ],
});
