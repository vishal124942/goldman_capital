import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/dashboard/superadmin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Activity, User, Shield, FileText, Settings } from "lucide-react";

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  details: any;
  ipAddress: string;
  createdAt: string;
}

const getActionIcon = (action: string) => {
  if (action.includes("login")) return User;
  if (action.includes("admin")) return Shield;
  if (action.includes("setting")) return Settings;
  return Activity;
};

const getActionColor = (action: string) => {
  if (action.includes("create") || action.includes("add")) return "default";
  if (action.includes("delete") || action.includes("remove")) return "destructive";
  if (action.includes("update") || action.includes("edit")) return "secondary";
  return "outline";
};

export default function SuperAdminActivityPage() {
  const { data: activityLogs, isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/superadmin/activity-logs"],
  });

  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <SuperAdminSidebar />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <header className="flex items-center justify-between gap-4 h-16 px-6 border-b bg-background/95 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="superadmin-button-sidebar-toggle" />
              <div>
                <h1 className="text-lg font-semibold">Activity Logs</h1>
                <p className="text-sm text-muted-foreground">System audit trail</p>
              </div>
            </div>
            <ThemeToggle />
          </header>
          
          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : activityLogs && activityLogs.length > 0 ? (
                  <div className="space-y-3">
                    {activityLogs.map((log) => {
                      const IconComponent = getActionIcon(log.action);
                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-4 p-4 rounded-lg border"
                          data-testid={`activity-log-${log.id}`}
                        >
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium">{log.action}</p>
                              <Badge variant={getActionColor(log.action)} className="text-xs">
                                {log.entityType}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              User: {log.userId.slice(0, 12)}... | IP: {log.ipAddress || "N/A"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No activity logs found</p>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
