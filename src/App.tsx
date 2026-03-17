import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import ProfitPlannerPage from "./pages/ProfitPlannerPage";
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

function DashboardRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicLayout><LandingPage /></PublicLayout>} />
            <Route path="/features" element={<PublicLayout><FeaturesPage /></PublicLayout>} />
            <Route path="/pricing" element={<PublicLayout><PricingPage /></PublicLayout>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<DashboardRoute><DashboardPage /></DashboardRoute>} />
            <Route path="/dashboard/transactions" element={<DashboardRoute><TransactionsPage /></DashboardRoute>} />
            <Route path="/dashboard/forecast" element={<DashboardRoute><ForecastPage /></DashboardRoute>} />
            <Route path="/dashboard/cash-flow" element={<DashboardRoute><CashFlowPage /></DashboardRoute>} />
            <Route path="/dashboard/recurring" element={<DashboardRoute><RecurringTransactionsPage /></DashboardRoute>} />
            <Route path="/dashboard/invoices" element={<DashboardRoute><InvoicesPage /></DashboardRoute>} />
            <Route path="/dashboard/clients" element={<DashboardRoute><ClientsPage /></DashboardRoute>} />
            <Route path="/dashboard/reports" element={<DashboardRoute><ReportsPage /></DashboardRoute>} />
            <Route path="/dashboard/monthly-report" element={<DashboardRoute><MonthlyReportPage /></DashboardRoute>} />
            <Route path="/dashboard/settings" element={<DashboardRoute><SettingsPage /></DashboardRoute>} />
            <Route path="/dashboard/advisor" element={<DashboardRoute><AdvisorPage /></DashboardRoute>} />
            <Route path="/dashboard/briefing" element={<DashboardRoute><CompanyBriefingPage /></DashboardRoute>} />
            <Route path="/dashboard/integrations" element={<DashboardRoute><IntegrationsPage /></DashboardRoute>} />
            <Route path="/dashboard/education" element={<DashboardRoute><EducationPage /></DashboardRoute>} />
            <Route path="/dashboard/feedback" element={<DashboardRoute><FeedbackPage /></DashboardRoute>} />
            <Route path="/dashboard/profit-planner" element={<DashboardRoute><ProfitPlannerPage /></DashboardRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
