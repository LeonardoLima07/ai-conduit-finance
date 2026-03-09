import { FileText, Plus, Search, Send, Eye, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const stateTaxRates: Record<string, { icms: number; iss: number }> = {
  SP: { icms: 18, iss: 5 }, RJ: { icms: 20, iss: 5 }, MG: { icms: 18, iss: 5 },
  BA: { icms: 19, iss: 5 }, RS: { icms: 17, iss: 5 }, PR: { icms: 19, iss: 5 },
  SC: { icms: 17, iss: 5 }, PE: { icms: 18, iss: 5 }, CE: { icms: 18, iss: 5 },
  GO: { icms: 17, iss: 5 }, DF: { icms: 18, iss: 5 },
};

const clients = [
  { name: "Empresa ABC", state: "SP", cnpj: "12.345.678/0001-90" },
  { name: "Loja XYZ", state: "BA", cnpj: "98.765.432/0001-10" },
  { name: "Tech Corp", state: "RJ", cnpj: "11.222.333/0001-44" },
  { name: "Startup Inc", state: "RS", cnpj: "55.666.777/0001-88" },
  { name: "Consultoria MN", state: "MG", cnpj: "33.444.555/0001-22" },
];

const invoices = [
  { id: "NF-001", client: "Empresa ABC", state: "SP", amount: 15000, tax: 2700, status: "Paga", date: "5 Mar 2026" },
  { id: "NF-002", client: "Loja XYZ", state: "BA", amount: 8500, tax: 1615, status: "Paga", date: "3 Mar 2026" },
  { id: "NF-003", client: "Tech Corp", state: "RJ", amount: 22000, tax: 4400, status: "Pendente", date: "1 Mar 2026" },
  { id: "NF-004", client: "Startup Inc", state: "RS", amount: 5200, tax: 884, status: "Vencida", date: "28 Fev 2026" },
  { id: "NF-005", client: "Consultoria MN", state: "MG", amount: 12800, tax: 2304, status: "Rascunho", date: "25 Fev 2026" },
];

const statusStyles: Record<string, string> = {
  Paga: "bg-primary/10 text-primary",
  Pendente: "bg-yellow-500/10 text-yellow-600",
  Vencida: "bg-destructive/10 text-destructive",
  Rascunho: "bg-muted text-muted-foreground",
};

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");

  const client = clients.find((c) => c.name === selectedClient);
  const taxRates = client ? stateTaxRates[client.state] || { icms: 18, iss: 5 } : null;
  const amount = parseFloat(invoiceAmount) || 0;
  const taxAmount = taxRates ? amount * (taxRates.icms + taxRates.iss) / 100 : 0;

  const filtered = invoices.filter((inv) =>
    inv.client.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notas Fiscais</h1>
          <p className="text-sm text-muted-foreground">Crie, gerencie e acompanhe suas notas fiscais com cálculo automático de impostos</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="hero" size="default">
              <Plus className="mr-1 h-4 w-4" /> Nova Nota Fiscal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Emitir Nota Fiscal
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        <span className="flex items-center gap-2">
                          {c.name} <span className="text-muted-foreground text-xs">({c.state})</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {client && (
                <div className="rounded-lg bg-secondary p-3 text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{client.name} — {client.state}</p>
                    <p className="text-xs text-muted-foreground">CNPJ: {client.cnpj} · ICMS: {taxRates?.icms}% · ISS: {taxRates?.iss}%</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Descrição do Serviço / Produto</Label>
                <Input placeholder="Ex: Consultoria de marketing digital" value={serviceDesc} onChange={(e) => setServiceDesc(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" placeholder="0,00" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} />
              </div>

              {amount > 0 && taxRates && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Cálculo Automático de Impostos</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Valor bruto</p>
                      <p className="font-semibold text-foreground">R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ICMS ({taxRates.icms}%)</p>
                      <p className="font-semibold text-foreground">R$ {(amount * taxRates.icms / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ISS ({taxRates.iss}%)</p>
                      <p className="font-semibold text-foreground">R$ {(amount * taxRates.iss / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total impostos</p>
                      <p className="font-semibold text-destructive">R$ {taxAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  <div className="border-t border-border pt-2 mt-2 flex justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Valor líquido</span>
                    <span className="text-lg font-bold text-foreground">R$ {(amount - taxAmount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Eye className="mr-1 h-4 w-4" /> Prévia
                </Button>
                <Button variant="hero" className="flex-1">
                  <Send className="mr-1 h-4 w-4" /> Emitir NF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar notas fiscais..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary">
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nota</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Impostos</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer">
                <td className="px-5 py-4 text-sm font-medium text-foreground">{inv.id}</td>
                <td className="px-5 py-4 text-sm text-foreground">{inv.client}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{inv.state}</td>
                <td className="px-5 py-4 text-sm font-semibold text-foreground">R$ {inv.amount.toLocaleString("pt-BR")}</td>
                <td className="px-5 py-4 text-sm text-destructive">R$ {inv.tax.toLocaleString("pt-BR")}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[inv.status]}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{inv.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
