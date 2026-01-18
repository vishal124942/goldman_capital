import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InvestorSidebar } from "@/components/dashboard/sidebar";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import { AnnouncementList } from "@/components/dashboard/announcement-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { TrendingUp, Wallet, BarChart3, Target, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import type { Portfolio, Announcement, InvestorProfile, Transaction, Notification } from "@shared/schema";

interface DashboardData {
  profile: InvestorProfile;
  portfolio: Portfolio;
  recentTransactions: Transaction[];
  announcements: Announcement[];
}

const generatePerformanceData = (portfolio: Portfolio | null) => {
  if (!portfolio) return [];
  const baseValue = Number(portfolio.totalInvested);
  const currentValue = Number(portfolio.currentValue);
  const growth = currentValue / baseValue;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month, i) => ({
    date: month,
    value: Math.round(baseValue * (1 + ((growth - 1) * (i + 1) / 12))),
  }));
};

const formatToCrores = (value: string | number | undefined) => {
  if (value === undefined || value === null) return "—";
  const num = Number(value);
  if (isNaN(num)) return "—";
  
  if (num === 0) return "₹0";
  
  // Convert to Crores (1 Cr = 1,00,00,000)
  const inCrores = num / 10000000;
  
  // If it's less than 1 Cr but greater than 0, maybe show Lakhs? 
  // But user asked for Cr specifically. Let's stick to Cr for large numbers, 
  // or just use Cr for everything if it's the requested format for this dashboard.
  // Actually, for small numbers (like 0), we handled it.
  // Let's format to 2 decimal places.
  
  return `₹${inCrores.toFixed(2)} Cr`;
};

export default function InvestorDashboard() {
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardData>({
    queryKey: ["/api/investor/dashboard"],
  });

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/investor/notifications"],
  });

  const { data: systemSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/system/settings"],
  });

  const portfolio = dashboardData?.portfolio;
  const announcements = dashboardData?.announcements || [];
  const unreadNotifications = notifications?.filter(n => !n.isRead).length || 0;

  const targetAllocations = [
    { name: "Private Credit", value: Number(systemSettings?.target_private_credit || 65), color: "hsl(var(--accent))" },
    { name: "AIF Exposure", value: Number(systemSettings?.target_aif_exposure || 25), color: "hsl(var(--chart-2))" },
    { name: "Cash & Equivalents", value: Number(systemSettings?.target_cash || 10), color: "hsl(var(--chart-3))" },
  ];

  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <InvestorSidebar />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <header className="flex items-center justify-between gap-4 h-16 px-6 border-b bg-background/95 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h1 className="text-lg font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome{dashboardData?.profile?.firstName ? `, ${dashboardData.profile.firstName}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/announcements">
                <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricsCard
                title="Total Invested"
                value={formatToCrores(portfolio?.totalInvested)}
                icon={<Wallet className="w-5 h-5 text-accent" />}
                delay={0}
                isLoading={dashboardLoading}
              />
              <MetricsCard
                title="Current Value"
                value={formatToCrores(portfolio?.currentValue)}
                change={portfolio ? `+${((Number(portfolio.currentValue) / Number(portfolio.totalInvested) - 1) * 100).toFixed(1)}%` : undefined}
                changeType="positive"
                description="Since inception"
                icon={<TrendingUp className="w-5 h-5 text-accent" />}
                delay={0.08}
                isLoading={dashboardLoading}
              />
              <MetricsCard
                title="Net Returns"
                value={portfolio ? `${Number(portfolio.returns).toFixed(2)}%` : "—"}
                changeType="positive"
                description="Since inception"
                icon={<BarChart3 className="w-5 h-5 text-accent" />}
                delay={0.16}
                isLoading={dashboardLoading}
              />
              <MetricsCard
                title="Net IRR"
                value={portfolio ? `${Number(portfolio.irr).toFixed(2)}%` : "—"}
                changeType="positive"
                description="Annualized"
                icon={<Target className="w-5 h-5 text-accent" />}
                delay={0.24}
                isLoading={dashboardLoading}
              />
            </div>

            <motion.div
              className="grid lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <div className="lg:col-span-2">
                <PerformanceChart data={generatePerformanceData(portfolio || null)} title="Portfolio Performance" />
              </div>
              <div>
                <AllocationChart data={targetAllocations} />
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6">
              <AnnouncementList
                announcements={announcements}
                isLoading={dashboardLoading}
              />
              <div className="p-6 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border">
                <h3 className="font-semibold mb-2">Need Assistance?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our dedicated relationship manager is here to help with any questions about your investment.
                </p>
                <div className="text-sm">
                  <p className="font-medium">Contact Support</p>
                  <p className="text-muted-foreground">investor.relations@godmancapital.in</p>
                  <p className="text-muted-foreground">+91 98765 43210</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
