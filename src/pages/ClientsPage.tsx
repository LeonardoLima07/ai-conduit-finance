import { Plus, Search, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const brazilianStates = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA",
  "PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const stateTaxRates: Record<string, { icms: number; iss: number }> = {
  SP: { icms: 18, iss: 5 }, RJ: { icms: 20, iss: 5 }, MG: { icms: 18, iss: 5 },
  BA: { icms: 19, iss: 5 }, RS: { icms: 17, iss: 5 }, PR: { icms: 19, iss: 5 },
  SC: { icms: 17, iss: 5 }, PE: { icms: 18, iss: 5 }, CE: { icms: 18, iss: 5 },
  GO: { icms: 17, iss: 5 }, DF: { icms: 18, iss: 5 }, PA: { icms: 17, iss: 5 },
  AM: { icms: 18, iss: 5 }, MT: { icms: 17, iss: 5 }, MS: { icms: 17, iss: 5 },
  MA: { icms: 18, iss: 5 }, AL: { icms: 18, iss: 5 }, PI: { icms: 18, iss: 5 },
  RN: { icms: 18, iss: 5 }, PB: { icms: 18, iss: 5 }, SE: { icms: 18, iss: 5 },
  ES: { icms: 17, iss: 5 }, RO: { icms: 17.5, iss: 5 }, AP: { icms: 18, iss: 5 },
  AC: { icms: 17, iss: 5 }, TO: { icms: 18, iss: 5 }, RR: { icms: 17, iss: 5 },
};

interface Client {
  id: number;
  name: string;
  cnpj: string;
  state: string;
  city: string;
  email: string;
  invoiceCount: number;
}

const sampleClients: Client[] = [
  { id: 1, name: "Empresa ABC LTDA", cnpj: "12.345.678/0001-90", state: "SP", city: "São Paulo", email: "contato@abc.com.br", invoiceCount: 12 },
  { id: 2, name: "Loja XYZ ME", cnpj: "98.765.432/0001-10", state: "BA", city: "Salvador", email: "financeiro@xyz.com.br", invoiceCount: 8 },
  { id: 3, name: "Tech Corp LTDA", cnpj: "11.222.333/0001-44", state: "RJ", city: "Rio de Janeiro", email: "admin@techcorp.com.br", invoiceCount: 15 },
  { id: 4, name: "Startup Inc", cnpj: "55.666.777/0001-88", state: "RS", city: "Porto Alegre", email: "hello@startup.com.br", invoiceCount: 5 },
  { id: 5, name: "Consultoria MN", cnpj: "33.444.555/0001-22", state: "MG", city: "Belo Horizonte", email: "contato@mn.com.br", invoiceCount: 20 },
];

export default function ClientsPage() {
  const [clients] = useState(sampleClients);
  const [search, setSearch] = useState("");
  const [newClient, setNewClient] = useState({ name: "", cnpj: "", state: "", city: "", email: "" });

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.cnpj.includes(search)
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground">Gerencie sua base de clientes e regras fiscais</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="hero" size="default">
              <Plus className="mr-1 h-4 w-4" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome / Razão Social</Label>
                <Input placeholder="Empresa LTDA" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input placeholder="12.345.678/0001-90" value={newClient.cnpj} onChange={(e) => setNewClient({ ...newClient, cnpj: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={newClient.state} onValueChange={(v) => setNewClient({ ...newClient, state: v })}>
                    <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                    <SelectContent>
                      {brazilianStates.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input placeholder="São Paulo" value={newClient.city} onChange={(e) => setNewClient({ ...newClient, city: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="contato@empresa.com.br" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
              </div>
              {newClient.state && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                  <p className="font-medium text-foreground">Regras fiscais: {newClient.state}</p>
                  <p className="text-muted-foreground mt-1">
                    ICMS: {stateTaxRates[newClient.state]?.icms || 18}% · ISS: {stateTaxRates[newClient.state]?.iss || 5}%
                  </p>
                </div>
              )}
              <Button variant="hero" className="w-full">Salvar Cliente</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar clientes..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5 hover:shadow-card hover:border-primary/20 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">{client.name}</h3>
                <p className="text-xs text-muted-foreground">{client.cnpj}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {client.city}, {client.state}
              </span>
              <span>{client.invoiceCount} notas</span>
            </div>
            <div className="mt-3 rounded-md bg-secondary px-3 py-1.5 text-xs">
              <span className="text-muted-foreground">ICMS: </span>
              <span className="font-medium text-foreground">{stateTaxRates[client.state]?.icms || 18}%</span>
              <span className="text-muted-foreground ml-3">ISS: </span>
              <span className="font-medium text-foreground">{stateTaxRates[client.state]?.iss || 5}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
