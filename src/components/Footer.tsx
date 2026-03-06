import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-sunken">
      <div className="container mx-auto px-6 py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-hero">
                <span className="text-sm font-bold text-primary-foreground">C</span>
              </div>
              <span className="text-xl font-bold text-foreground">Contuit</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The AI Copilot for Your Business. Smart financial management for modern companies.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              {["Features", "Pricing", "Dashboard"].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              {["Privacy", "Terms", "Security"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">© 2026 Contuit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
