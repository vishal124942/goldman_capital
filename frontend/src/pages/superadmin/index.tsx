import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/dashboard/superadmin-sidebar";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  Users,
  Shield,
  Settings,
  Activity,
  Database,
  Server,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface SystemSettings {
  key: string;
  value: any;
}

interface ActivityLog {
  id: string;
  action: string;
  userId: string;
  details: any;
  createdAt: string;
}

interface AdminUser {
  id: string;
  userId: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const { data: admins, isLoading: adminsLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/superadmin/admins"],
  });

  const { data: activityLogs, isLoading: logsLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/superadmin/activity-logs"],
  });

  const { data: settings } = useQuery<SystemSettings[]>({
    queryKey: ["/api/superadmin/system-settings"],
  });

  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  const activeAdmins = admins?.filter(a => a.isActive).length || 0;
  const superAdmins = admins?.filter(a => a.role === "super_admin").length || 0;

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <SuperAdminSidebar />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <header className="flex items-center justify-between gap-4 h-16 px-6 border-b bg-background/95 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="superadmin-button-sidebar-toggle" />
              <div>
                <h1 className="text-lg font-semibold">Super Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">System Management & Control</p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricsCard
                title="Total Admins"
                value={adminsLoading ? "Loading..." : String(admins?.length || 0)}
                description="System administrators"
                icon={<Shield className="w-5 h-5 text-accent" />}
              />
              <MetricsCard
                title="Active Admins"
                value={adminsLoading ? "Loading..." : String(activeAdmins)}
                description="Currently active"
                icon={<Users className="w-5 h-5 text-accent" />}
              />
              <MetricsCard
                title="Super Admins"
                value={adminsLoading ? "Loading..." : String(superAdmins)}
                description="Full access users"
                icon={<Shield className="w-5 h-5 text-accent" />}
              />
              <MetricsCard
                title="System Status"
                value="Operational"
                description="All systems normal"
                icon={<Server className="w-5 h-5 text-accent" />}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  <Link href="/superadmin/activity">
                    <Button variant="ghost" size="sm" data-testid="link-view-all-activity">View All</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {logsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : activityLogs && activityLogs.length > 0 ? (
                    <div className="space-y-3">
                      {activityLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{log.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                  <CardTitle className="text-lg font-semibold">Admin Users</CardTitle>
                  <Link href="/superadmin/admins">
                    <Button variant="ghost" size="sm" data-testid="link-manage-admins">Manage</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {adminsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : admins && admins.length > 0 ? (
                    <div className="space-y-3">
                      {admins.slice(0, 5).map((admin) => (
                        <div key={admin.id} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{admin.userId.slice(0, 8)}...</p>
                              <Badge variant={admin.role === "super_admin" ? "default" : "secondary"} className="text-xs">
                                {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                              </Badge>
                            </div>
                          </div>
                          <Badge variant={admin.isActive ? "default" : "secondary"}>
                            {admin.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No admin users found</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-lg font-semibold">System Health</CardTitle>
                <Link href="/superadmin/settings">
                  <Button variant="ghost" size="sm" data-testid="link-system-settings">Settings</Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg border">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Database</p>
                      <p className="text-xs text-muted-foreground">Connected</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">API Server</p>
                      <p className="text-xs text-muted-foreground">Running</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Auth System</p>
                      <p className="text-xs text-muted-foreground">Operational</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-lg border">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">File Storage</p>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
