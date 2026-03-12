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
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import ForecastPage from "./pages/ForecastPage";
import CashFlowPage from "./pages/CashFlowPage";
import RecurringTransactionsPage from "./pages/RecurringTransactionsPage";
import InvoicesPage from "./pages/InvoicesPage";
import ClientsPage from "./pages/ClientsPage";
import ReportsPage from "./pages/ReportsPage";
import MonthlyReportPage from "./pages/MonthlyReportPage";
import SettingsPage from "./pages/SettingsPage";
import AdvisorPage from "./pages/AdvisorPage";
import CompanyBriefingPage from "./pages/CompanyBriefingPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import EducationPage from "./pages/EducationPage";
import FeedbackPage from "./pages/FeedbackPage";
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
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
          <Route path="/dashboard/transactions" element={<DashboardLayout><TransactionsPage /></DashboardLayout>} />
          <Route path="/dashboard/forecast" element={<DashboardLayout><ForecastPage /></DashboardLayout>} />
          <Route path="/dashboard/cash-flow" element={<DashboardLayout><CashFlowPage /></DashboardLayout>} />
          <Route path="/dashboard/invoices" element={<DashboardLayout><InvoicesPage /></DashboardLayout>} />
          <Route path="/dashboard/clients" element={<DashboardLayout><ClientsPage /></DashboardLayout>} />
          <Route path="/dashboard/reports" element={<DashboardLayout><ReportsPage /></DashboardLayout>} />
          <Route path="/dashboard/monthly-report" element={<DashboardLayout><MonthlyReportPage /></DashboardLayout>} />
          <Route path="/dashboard/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
          <Route path="/dashboard/advisor" element={<DashboardLayout><AdvisorPage /></DashboardLayout>} />
          <Route path="/dashboard/briefing" element={<DashboardLayout><CompanyBriefingPage /></DashboardLayout>} />
          <Route path="/dashboard/integrations" element={<DashboardLayout><IntegrationsPage /></DashboardLayout>} />
          <Route path="/dashboard/education" element={<DashboardLayout><EducationPage /></DashboardLayout>} />
          <Route path="/dashboard/feedback" element={<DashboardLayout><FeedbackPage /></DashboardLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
