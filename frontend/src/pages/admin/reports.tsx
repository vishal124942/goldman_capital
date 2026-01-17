import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, TrendingUp, Users, Wallet, BarChart3, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const SEGMENT_COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
];

function AnimatedNumber({ value, prefix = "", suffix = "", duration = 1.5 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration,
      ease: "power2.out",
      onUpdate: () => setDisplayValue(Math.round(obj.val * 100) / 100),
    });
  }, [value, duration]);

  return (
    <span ref={elementRef}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export default function AdminReportsPage() {
  const { toast } = useToast();
  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  const { data: aumData, isLoading: aumLoading, refetch: refetchAum } = useQuery<{
    totalAum: string;
    investorCount: number;
    history: Array<{ aum: string; date: string }>;
  }>({
    queryKey: ["/api/admin/reports/aum"],
  });

  const { data: inflowsData, isLoading: inflowsLoading, refetch: refetchInflows } = useQuery<{
    totalInflows: number;
    totalOutflows: number;
    recentInflows: Array<{ amount: string; date: string }>;
    recentOutflows: Array<{ amount: string; date: string }>;
  }>({
    queryKey: ["/api/admin/reports/inflows"],
  });

  const { data: allocationsData, isLoading: allocationsLoading, refetch: refetchAllocations } = useQuery<{
    privateCredit: number;
    aif: number;
    cash: number;
    total: number;
  }>({
    queryKey: ["/api/admin/reports/allocations"],
  });

  const { data: segmentsData, isLoading: segmentsLoading, refetch: refetchSegments } = useQuery<{
    byType: Record<string, number>;
    byKycStatus: Record<string, number>;
    byInvestmentTier: { small: number; medium: number; large: number; vip: number };
  }>({
    queryKey: ["/api/admin/reports/investor-segments"],
  });

  const isLoading = aumLoading || inflowsLoading || allocationsLoading || segmentsLoading;

  const handleRefresh = () => {
    refetchAum();
    refetchInflows();
    refetchAllocations();
    refetchSegments();
    toast({ title: "Refreshing Reports", description: "Fetching latest data..." });
  };

  const handleExport = async () => {
    try {
      const res = await apiRequest("POST", "/api/admin/reports/export", {
        reportType: "aum",
        format: "csv",
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_aum_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Export Successful", description: "Report downloaded." });
    } catch (error) {
      console.error("Export failed", error);
      toast({ title: "Export Failed", description: "Could not download report.", variant: "destructive" });
    }
  };

  const totalAum = parseFloat(aumData?.totalAum || "0");
  const investorCount = aumData?.investorCount || 0;
  const netInflows = (inflowsData?.totalInflows || 0) - (inflowsData?.totalOutflows || 0);
  const avgInvestment = investorCount > 0 ? totalAum / investorCount : 0;

  const segmentChartData = segmentsData?.byType
    ? Object.entries(segmentsData.byType).map(([segment, count], index) => ({
      segment: segment.charAt(0).toUpperCase() + segment.slice(1),
      value: count,
      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
    }))
    : [];

  const allocationBreakdown = allocationsData ? [
    { category: "Private Credit", value: Math.round((allocationsData.privateCredit / (allocationsData.total || 1)) * 100) },
    { category: "Alternative Investments", value: Math.round((allocationsData.aif / (allocationsData.total || 1)) * 100) },
    { category: "Cash & Equivalents", value: Math.round((allocationsData.cash / (allocationsData.total || 1)) * 100) },
  ] : [];

  const monthlyMetrics = aumData?.history?.slice(0, 6).reverse().map((h, i) => ({
    month: new Date(h.date).toLocaleDateString('en-US', { month: 'short' }),
    aum: parseFloat(h.aum) / 10000000,
  })) || [];

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <header className="flex items-center justify-between gap-4 h-16 px-6 border-b bg-background/95 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="admin-button-sidebar-toggle" />
              <div>
                <h1 className="text-lg font-semibold">Reports & Analytics</h1>
                <p className="text-sm text-muted-foreground">Fund performance and investor analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isLoading}
                data-testid="admin-button-refresh-reports"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                data-testid="admin-button-export-report"
                onClick={handleExport}
                disabled={isLoading}
              >
                <Download className="w-4 h-4" />
                Export Report
              </Button>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card hover-elevate transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center transition-all duration-300 hover:bg-accent hover:scale-110 group">
                      <Wallet className="w-5 h-5 text-accent group-hover:text-accent-foreground transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total AUM</p>
                      {isLoading ? (
                        <Skeleton className="h-7 w-24" />
                      ) : (
                        <p className="text-xl font-bold">
                          <AnimatedNumber value={totalAum / 10000000} prefix="₹" suffix=" Cr" />
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card hover-elevate transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center transition-all duration-300 hover:bg-green-500 hover:scale-110 group">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Net Inflows</p>
                      {isLoading ? (
                        <Skeleton className="h-7 w-24" />
                      ) : (
                        <p className="text-xl font-bold">
                          <AnimatedNumber value={netInflows / 10000000} prefix="₹" suffix=" Cr" />
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card hover-elevate transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center transition-all duration-300 hover:bg-accent hover:scale-110 group">
                      <Users className="w-5 h-5 text-accent group-hover:text-accent-foreground transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Investors</p>
                      {isLoading ? (
                        <Skeleton className="h-7 w-16" />
                      ) : (
                        <p className="text-xl font-bold">
                          <AnimatedNumber value={investorCount} />
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card hover-elevate transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center transition-all duration-300 hover:bg-accent hover:scale-110 group">
                      <BarChart3 className="w-5 h-5 text-accent group-hover:text-accent-foreground transition-colors" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Investment</p>
                      {isLoading ? (
                        <Skeleton className="h-7 w-24" />
                      ) : (
                        <p className="text-xl font-bold">
                          <AnimatedNumber value={avgInvestment / 10000000} prefix="₹" suffix=" Cr" />
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-card hover-elevate transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">AUM History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyMetrics}>
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
                            tickFormatter={(value) => `₹${value}Cr`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [`₹${value.toFixed(2)} Cr`, "AUM"]}
                          />
                          <Bar dataKey="aum" fill="hsl(var(--accent))" name="AUM" radius={[4, 4, 0, 0]} animationDuration={1500} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card hover-elevate transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Investors by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-[250px] w-full" />
                  ) : segmentChartData.length > 0 ? (
                    <>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={segmentChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={4}
                              dataKey="value"
                              animationDuration={1500}
                            >
                              {segmentChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                              formatter={(value: number) => [`${value} investors`, "Count"]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 space-y-2">
                        {segmentChartData.map((segment, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: segment.color }}
                              />
                              <span className="text-sm">{segment.segment}</span>
                            </div>
                            <span className="text-sm font-medium">
                              {segment.value} investors
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      No investor data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card hover-elevate transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Portfolio Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : allocationBreakdown.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={allocationBreakdown} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                        <XAxis
                          type="number"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                          tickFormatter={(value) => `${value}%`}
                          domain={[0, 100]}
                        />
                        <YAxis
                          type="category"
                          dataKey="category"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                          width={150}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`${value}%`, "Allocation"]}
                        />
                        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} animationDuration={1500} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No allocation data available
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
