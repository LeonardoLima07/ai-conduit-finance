import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardLayout } from "@/components/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import InvoicesPage from "./pages/InvoicesPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import AdvisorPage from "./pages/AdvisorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
          <Route path="/features" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
          <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
          <Route path="/dashboard/invoices" element={<DashboardLayout><InvoicesPage /></DashboardLayout>} />
          <Route path="/dashboard/reports" element={<DashboardLayout><ReportsPage /></DashboardLayout>} />
          <Route path="/dashboard/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
          <Route path="/dashboard/advisor" element={<DashboardLayout><AdvisorPage /></DashboardLayout>} />
          <Route path="/dashboard/transactions" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
          <Route path="/dashboard/forecast" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
