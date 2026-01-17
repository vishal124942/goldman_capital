import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InvestorSidebar } from "@/components/dashboard/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import { DeploymentStatus } from "@/components/dashboard/deployment-status";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, PieChart, Clock } from "lucide-react";
import type { Portfolio } from "@shared/schema";

interface Allocation {
  _id: string;
  assetClass: string;
  assetName: string;
  percentage: string;
  amount: string;
  status: string;
}

interface ExtendedPortfolio extends Portfolio {
  allocations?: Allocation[];
}

export default function PortfolioPage() {
  const { data: portfolio, isLoading } = useQuery<ExtendedPortfolio>({
    queryKey: ["/api/investor/portfolio"],
  });

  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  const privateCreditAlloc = parseFloat(portfolio?.privateCreditAllocation || "0");
  const aifAlloc = parseFloat(portfolio?.aifExposure || "0");
  const cashAlloc = parseFloat(portfolio?.cashEquivalents || "0");

  const allocationData = [
    { name: "Private Credit", value: privateCreditAlloc, color: "hsl(var(--accent))" },
    { name: "AIF Exposure", value: aifAlloc, color: "hsl(var(--chart-2))" },
    { name: "Cash & Equivalents", value: cashAlloc, color: "hsl(var(--chart-3))" },
  ].filter(d => d.value > 0);

  // If no specific allocation is set, default to showing Cash if total invested > 0
  if (allocationData.length === 0 && portfolio && parseFloat(portfolio.totalInvested) > 0) {
    // If we have investment but no breakdown, it's effectively unallocated/cash or just pending
    // For now, let's just leave it empty or show 100% Cash/Other? 
    // User said "pushing investment", implying it exists. 
    // Better to show an empty chart than fake data.
  }

  const holdings = portfolio?.allocations || [];

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <InvestorSidebar />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <header className="flex items-center justify-between gap-4 h-16 px-6 border-b bg-background/95 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h1 className="text-lg font-semibold">Portfolio</h1>
                <p className="text-sm text-muted-foreground">View your allocation and holdings</p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Private Credit</p>
                      <p className="text-xl font-bold">{privateCreditAlloc}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Allocation</p>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                      <PieChart className="w-5 h-5 text-chart-2" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">AIF Exposure</p>
                      <p className="text-xl font-bold">{aifAlloc}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Allocation</p>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-chart-3" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cash & Equivalents</p>
                      <p className="text-xl font-bold">{cashAlloc}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Allocation</p>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Invested</p>
                      <p className="text-xl font-bold">₹{portfolio ? (parseFloat(portfolio.totalInvested) / 10000000).toFixed(2) + ' Cr' : '0'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Current Value: ₹{portfolio ? (parseFloat(portfolio.currentValue) / 10000000).toFixed(2) + ' Cr' : '0'}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Holdings Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {holdings.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Investment</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Allocation</th>
                              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {holdings.map((holding, index) => (
                              <tr key={holding._id || index} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="py-3 px-4 text-sm font-medium">{holding.assetName || "Unknown Asset"}</td>
                                <td className="py-3 px-4">
                                  <Badge variant="secondary" className="text-xs">
                                    {holding.assetClass}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-right text-sm">{holding.percentage}%</td>
                                <td className="py-3 px-4 text-right text-sm text-green-600 dark:text-green-400">
                                  ₹{(parseFloat(holding.amount) / 100000).toFixed(2)} L
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <Badge variant="outline" className="text-xs">{holding.status}</Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <PieChart className="w-12 h-12 text-muted-foreground/20 mb-3" />
                        <p className="text-muted-foreground font-medium">No holdings found</p>
                        <p className="text-sm text-muted-foreground/50">Your investment allocation details will appear here once processed.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {allocationData.length > 0 ? (
                  <AllocationChart data={allocationData} />
                ) : (
                  <Card className="bg-card h-64 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">No allocation data available</p>
                  </Card>
                )}

                {portfolio && (() => {
                  const total = parseFloat(portfolio.totalInvested);
                  const cash = parseFloat(portfolio.cashEquivalents || "0");
                  const deployed = total - cash;
                  const deploymentPercentage = total > 0 ? (deployed / total) * 100 : 0;

                  let status: "fully" | "partial" | "pending" = "pending";
                  if (deploymentPercentage >= 95) status = "fully";
                  else if (deploymentPercentage > 0) status = "partial";

                  return (
                    <DeploymentStatus
                      status={status}
                      deployed={deployed}
                      total={total}
                    />
                  );
                })()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
