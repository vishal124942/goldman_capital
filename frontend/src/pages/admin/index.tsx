import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, TrendingUp, Wallet, FileText, ArrowDownRight } from "lucide-react";
import { Link } from "wouter";
import type { InvestorProfile, NavHistory } from "@shared/schema";

interface AumReport {
  totalAum: string;
  investorCount: number;
  history: NavHistory[];
}

interface InvestorSegments {
  byType: Record<string, number>;
  byKycStatus: Record<string, number>;
  byInvestmentTier: { small: number; medium: number; large: number; vip: number };
}

interface AllocationsReport {
  privateCredit: number;
  aifExposure: number;
  cashEquivalents: number;
}

interface Stats {
  pendingStatements: number;
}

export default function AdminDashboard() {
  const { data: aumReport, isLoading: aumLoading } = useQuery<AumReport>({
    queryKey: ["/api/admin/reports/aum"],
  });

  const { data: investors, isLoading: investorsLoading } = useQuery<InvestorProfile[]>({
    queryKey: ["/api/admin/investors"],
  });

  const { data: segments } = useQuery<InvestorSegments>({
    queryKey: ["/api/admin/reports/investor-segments"],
  });

  const { data: allocations } = useQuery<AllocationsReport>({
    queryKey: ["/api/admin/reports/allocations"],
  });

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  const monthlyInflows = aumReport?.history?.slice(0, 6).reverse().map(nav => ({
    month: new Date(nav.date).toLocaleString('default', { month: 'short' }),
    inflow: parseFloat(nav.aum),
  })) || [];

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const totalAllocation = (allocations?.privateCredit || 0) + (allocations?.aifExposure || 0) + (allocations?.cashEquivalents || 0);
  const pcPercent = totalAllocation ? Math.round(((allocations?.privateCredit || 0) / totalAllocation) * 100) : 0;
  const aifPercent = totalAllocation ? Math.round(((allocations?.aifExposure || 0) / totalAllocation) * 100) : 0;
  const cashPercent = totalAllocation ? Math.round(((allocations?.cashEquivalents || 0) / totalAllocation) * 100) : 0;

  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <header className="flex items-center justify-between gap-4 h-16 px-6 border-b bg-background/95 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="admin-button-sidebar-toggle" />
              <div>
                <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Velocity Fund Management</p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricsCard
                title="Total AUM"
                value={aumLoading ? "Loading..." : aumReport?.totalAum ? formatCurrency(parseFloat(aumReport.totalAum)) : "—"}
                description="Assets Under Management"
                icon={<Wallet className="w-5 h-5 text-accent" />}
              />
              <MetricsCard
                title="Active Investors"
                value={investorsLoading ? "Loading..." : String(investors?.length || 0)}
                description="Total registered"
                icon={<Users className="w-5 h-5 text-accent" />}
              />
              <MetricsCard
                title="Net NAV"
                value={aumLoading ? "Loading..." : aumReport?.history?.[0] ? formatCurrency(parseFloat(aumReport.history[0].nav)) : "—"}
                description="Latest per unit value"
                icon={<TrendingUp className="w-5 h-5 text-accent" />}
              />
              <MetricsCard
                title="Pending Statements"
                value={stats?.pendingStatements !== undefined ? String(stats.pendingStatements) : "—"}
                description="Awaiting generation"
                icon={<FileText className="w-5 h-5 text-accent" />}
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-card hover-elevate transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">AUM History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {monthlyInflows.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyInflows}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => `₹${(value / 10000000).toFixed(0)}Cr`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [`₹${(value / 10000000).toFixed(2)} Cr`, "AUM"]}
                          />
                          <Bar dataKey="inflow" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} animationDuration={1500} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No NAV history available. Add NAV entries to see the chart.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card hover-elevate transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Investors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {investorsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : investors && investors.length > 0 ? (
                    investors.slice(0, 5).map((investor, index) => (
                      <div key={investor.id || index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100 dark:bg-green-900/30 transition-transform duration-300 hover:scale-110">
                          <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{investor.firstName} {investor.lastName}</p>
                          <p className="text-xs text-muted-foreground truncate">{investor.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">{investor.kycStatus} KYC</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No investors yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card hover-elevate transition-all duration-300">
                <CardContent className="p-6">
                  <h4 className="font-medium mb-4">Allocation Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">Private Credit</span>
                      <span className="font-medium">{formatCurrency(allocations?.privateCredit || 0)} ({pcPercent}%)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">AIF Exposure</span>
                      <span className="font-medium">{formatCurrency(allocations?.aifExposure || 0)} ({aifPercent}%)</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">Cash & Equivalents</span>
                      <span className="font-medium">{formatCurrency(allocations?.cashEquivalents || 0)} ({cashPercent}%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card hover-elevate transition-all duration-300">
                <CardContent className="p-6">
                  <h4 className="font-medium mb-4">Investor Segments</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">Small (₹10L-1Cr)</span>
                      <span className="font-medium">{segments?.byInvestmentTier?.small || 0} investors</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">Medium (₹1-5Cr)</span>
                      <span className="font-medium">{segments?.byInvestmentTier?.medium || 0} investors</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">Large (₹5-10Cr)</span>
                      <span className="font-medium">{segments?.byInvestmentTier?.large || 0} investors</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-sm text-muted-foreground">VIP (₹10Cr+)</span>
                      <span className="font-medium">{segments?.byInvestmentTier?.vip || 0} investors</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card hover-elevate transition-all duration-300">
                <CardContent className="p-6">
                  <h4 className="font-medium mb-4">Quick Actions</h4>
                  <div className="space-y-2">
                    <Link href="/admin/nav">
                      <button className="w-full text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm transition-all duration-200 hover:translate-x-1" data-testid="admin-quick-action-update-nav">
                        Update NAV
                      </button>
                    </Link>
                    <Link href="/admin/statements">
                      <button className="w-full text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm transition-all duration-200 hover:translate-x-1" data-testid="admin-quick-action-generate-statements">
                        Generate Statements
                      </button>
                    </Link>
                    <Link href="/admin/investors">
                      <button className="w-full text-left px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm transition-all duration-200 hover:translate-x-1" data-testid="admin-quick-action-onboard-investor">
                        Onboard Investor
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
