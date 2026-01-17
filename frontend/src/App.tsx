import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { GSAPProvider } from "@/lib/gsap-context";
import { useAuth } from "@/hooks/use-auth";
import { PremiumLoader } from "@/components/ui/premium-loader";
import { ScrollProgress } from "@/components/ui/scroll-animations";
import { CustomCursor } from "@/components/ui/custom-cursor";
import { PageTransition } from "@/components/ui/page-transition";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import ServicesPage from "@/pages/services";
import VelocityFundPage from "@/pages/velocity-fund";
import TeamPage from "@/pages/team";
import ContactPage from "@/pages/contact";
import InvestorDashboard from "@/pages/dashboard/index";
import PortfolioPage from "@/pages/dashboard/portfolio";
import StatementsPage from "@/pages/dashboard/statements";
import TransactionsPage from "@/pages/dashboard/transactions";
import SupportPage from "@/pages/dashboard/support";
import AnnouncementsPage from "@/pages/dashboard/announcements";
import AdminDashboard from "@/pages/admin/index";
import AdminInvestorsPage from "@/pages/admin/investors";
import AdminNavPage from "@/pages/admin/nav";
import AdminStatementsPage from "@/pages/admin/statements";
import AdminTicketsPage from "@/pages/admin/tickets";
import AdminAnnouncementsPage from "@/pages/admin/announcements";
import AdminReportsPage from "@/pages/admin/reports";
import AdminSettingsPage from "@/pages/admin/settings";
import AdminUploadPage from "@/pages/admin/upload";
import SuperAdminDashboard from "@/pages/superadmin/index";
import SuperAdminAdminsPage from "@/pages/superadmin/admins";
import SuperAdminActivityPage from "@/pages/superadmin/activity";
import SuperAdminSettingsPage from "@/pages/superadmin/settings";
import LoginPage from "@/pages/login";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <PremiumLoader variant="orbital" size="lg" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <PremiumLoader variant="ring" size="lg" />
          <p className="text-sm text-muted-foreground animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (!isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function SuperAdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isSuperAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <PremiumLoader variant="pulse" size="lg" />
          <p className="text-sm text-muted-foreground animate-pulse">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (!isSuperAdmin) {
    return <Redirect to="/admin" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/velocity-fund" component={VelocityFundPage} />
      <Route path="/team" component={TeamPage} />
      <Route path="/contact" component={ContactPage} />

      <Route path="/dashboard">
        {() => <ProtectedRoute component={InvestorDashboard} />}
      </Route>
      <Route path="/dashboard/portfolio">
        {() => <ProtectedRoute component={PortfolioPage} />}
      </Route>
      <Route path="/dashboard/statements">
        {() => <ProtectedRoute component={StatementsPage} />}
      </Route>
      <Route path="/dashboard/transactions">
        {() => <ProtectedRoute component={TransactionsPage} />}
      </Route>
      <Route path="/dashboard/support">
        {() => <ProtectedRoute component={SupportPage} />}
      </Route>
      <Route path="/dashboard/announcements">
        {() => <ProtectedRoute component={AnnouncementsPage} />}
      </Route>

      <Route path="/admin">
        {() => <AdminRoute component={AdminDashboard} />}
      </Route>
      <Route path="/admin/tickets">
        {() => <AdminRoute component={AdminTicketsPage} />}
      </Route>
      <Route path="/admin/investors">
        {() => <AdminRoute component={AdminInvestorsPage} />}
      </Route>
      <Route path="/admin/nav">
        {() => <AdminRoute component={AdminNavPage} />}
      </Route>
      <Route path="/admin/statements">
        {() => <AdminRoute component={AdminStatementsPage} />}
      </Route>
      <Route path="/admin/announcements">
        {() => <AdminRoute component={AdminAnnouncementsPage} />}
      </Route>
      <Route path="/admin/reports">
        {() => <AdminRoute component={AdminReportsPage} />}
      </Route>
      <Route path="/admin/settings">
        {() => <AdminRoute component={AdminSettingsPage} />}
      </Route>
      <Route path="/admin/upload">
        {() => <AdminRoute component={AdminUploadPage} />}
      </Route>

      <Route path="/superadmin">
        {() => <SuperAdminRoute component={SuperAdminDashboard} />}
      </Route>
      <Route path="/superadmin/admins">
        {() => <SuperAdminRoute component={SuperAdminAdminsPage} />}
      </Route>
      <Route path="/superadmin/activity">
        {() => <SuperAdminRoute component={SuperAdminActivityPage} />}
      </Route>
      <Route path="/superadmin/settings">
        {() => <SuperAdminRoute component={SuperAdminSettingsPage} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="godman-ui-theme">
        <GSAPProvider>
          <TooltipProvider>
            <CustomCursor />
            <ScrollProgress />
            <Toaster />
            <PageTransition>
              <Router />
            </PageTransition>
          </TooltipProvider>
        </GSAPProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
