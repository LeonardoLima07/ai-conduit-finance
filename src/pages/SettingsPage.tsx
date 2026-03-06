import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input defaultValue="João Silva" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue="joao@empresa.com" />
          </div>
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input defaultValue="Empresa ABC LTDA" />
          </div>
          <div className="space-y-2">
            <Label>CNPJ</Label>
            <Input defaultValue="12.345.678/0001-90" />
          </div>
        </div>
      </div>

      <Separator />

      {/* Notifications */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        <div className="space-y-4">
          {[
            { label: "Invoice reminders", desc: "Get notified about overdue invoices" },
            { label: "AI insights", desc: "Receive AI-generated business recommendations" },
            { label: "Cash flow alerts", desc: "Alert when cash flow drops below threshold" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Plan */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Plan</h2>
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Business Plan</p>
              <p className="text-xs text-muted-foreground">R$ 97/month · Renews Jan 1, 2026</p>
            </div>
            <Button variant="outline" size="sm">Manage Plan</Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="hero">Save Changes</Button>
      </div>
    </div>
  );
}
