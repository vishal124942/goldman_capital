import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar, Loader2 } from "lucide-react";
import type { NavHistory } from "@shared/schema";

const navUpdateSchema = z.object({
  date: z.string().min(1, "Date is required"),
  nav: z.string().min(1, "NAV is required"),
  aum: z.string().min(1, "AUM is required"),
});

type NavUpdateFormData = z.infer<typeof navUpdateSchema>;

const defaultNavHistory = [
  { date: "Jul 2024", nav: 1150.25, aum: 420 },
  { date: "Aug 2024", nav: 1168.50, aum: 445 },
  { date: "Sep 2024", nav: 1185.75, aum: 468 },
  { date: "Oct 2024", nav: 1205.00, aum: 492 },
  { date: "Nov 2024", nav: 1225.50, aum: 508 },
  { date: "Dec 2024", nav: 1247.85, aum: 523 },
];

export default function AdminNavPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: backendNavHistory } = useQuery<NavHistory[]>({
    queryKey: ["/api/admin/nav"],
  });

  const navHistory = backendNavHistory && backendNavHistory.length > 0
    ? [...backendNavHistory].reverse().map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      nav: parseFloat(entry.nav),
      aum: parseFloat(entry.aum),
    }))
    : defaultNavHistory;

  const form = useForm<NavUpdateFormData>({
    resolver: zodResolver(navUpdateSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      nav: "",
      aum: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: NavUpdateFormData) => {
      return apiRequest("POST", "/api/admin/nav", data);
    },
    onSuccess: () => {
      form.reset({
        date: new Date().toISOString().split("T")[0],
        nav: "",
        aum: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/nav"] });
      toast({
        title: "NAV Updated",
        description: "NAV and AUM have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update NAV.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NavUpdateFormData) => {
    mutation.mutate(data);
  };

  const latestNav = navHistory[navHistory.length - 1];
  const previousNav = navHistory[navHistory.length - 2] || latestNav;
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const navChange = previousNav ? ((latestNav.nav - previousNav.nav) / previousNav.nav * 100).toFixed(2) : "0";

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
                <h1 className="text-lg font-semibold">NAV & Returns</h1>
                <p className="text-sm text-muted-foreground">Update fund NAV and track AUM</p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">Current NAV</p>
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-3xl font-bold">{formatCurrency(latestNav.nav)}</p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    +{navChange}% MoM
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">Total AUM</p>
                    <Calendar className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-3xl font-bold">₹{latestNav.aum} Cr</p>
                  <p className="text-sm text-muted-foreground">
                    Last updated: Dec 2024
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">YTD Return</p>
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">+24.8%</p>
                  <p className="text-sm text-muted-foreground">
                    Benchmark: Nifty +18.2%
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">NAV History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={navHistory}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                          domain={["auto", "auto"]}
                          tickFormatter={(value) => value >= 10000000 ? `${(value/10000000).toFixed(0)}Cr` : value}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [formatCurrency(value), "NAV"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="nav"
                          stroke="hsl(var(--accent))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--accent))", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Update NAV</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        {...form.register("date")}
                        data-testid="admin-input-nav-date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nav">NAV (₹)</Label>
                      <Input
                        id="nav"
                        type="number"
                        step="0.01"
                        placeholder="1250.00"
                        {...form.register("nav")}
                        data-testid="admin-input-nav-value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aum">AUM (₹ Cr)</Label>
                      <Input
                        id="aum"
                        type="number"
                        step="0.01"
                        placeholder="530.00"
                        {...form.register("aum")}
                        data-testid="admin-input-aum-value"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={mutation.isPending}
                      data-testid="admin-button-update-nav"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update NAV"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">NAV History Table</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">NAV (₹)</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">AUM (₹ Cr)</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">MoM Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...navHistory].reverse().map((entry, index) => {
                        const prevEntry = navHistory[navHistory.length - index - 2];
                        const change = prevEntry
                          ? ((entry.nav - prevEntry.nav) / prevEntry.nav * 100).toFixed(2)
                          : "—";
                        return (
                          <tr key={index} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 text-sm font-medium">{entry.date}</td>
                            <td className="py-3 px-4 text-right text-sm">{formatCurrency(entry.nav)}</td>
                            <td className="py-3 px-4 text-right text-sm">₹{entry.aum} Cr</td>
                            <td className={`py-3 px-4 text-right text-sm ${change !== "—" && parseFloat(change) >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                              }`}>
                              {change !== "—" ? `${parseFloat(change) >= 0 ? "+" : ""}${change}%` : change}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
