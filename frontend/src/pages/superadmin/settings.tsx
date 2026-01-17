import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/dashboard/superadmin-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Settings, Save, RefreshCw } from "lucide-react";

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description: string;
  updatedAt: string;
}

export default function SuperAdminSettingsPage() {
  const { toast } = useToast();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const { data: settings, isLoading } = useQuery<SystemSetting[]>({
    queryKey: ["/api/superadmin/system-settings"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      return apiRequest("PUT", `/api/superadmin/system-settings/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/system-settings"] });
      setEditingKey(null);
      setEditValue("");
      toast({
        title: "Setting Updated",
        description: "System setting has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update setting.",
        variant: "destructive",
      });
    },
  });

  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  const defaultSettings = [
    { key: "maintenance_mode", label: "Maintenance Mode", description: "Enable to show maintenance page to all users", type: "boolean" },
    { key: "allow_registrations", label: "Allow Registrations", description: "Allow new investor registrations", type: "boolean" },
    { key: "session_timeout", label: "Session Timeout (minutes)", description: "Auto-logout after inactivity", type: "number" },
    { key: "max_login_attempts", label: "Max Login Attempts", description: "Lock account after failed attempts", type: "number" },
    { key: "company_name", label: "Company Name", description: "Display name for the platform", type: "string" },
    { key: "support_email", label: "Support Email", description: "Contact email for support", type: "string" },
  ];

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <SuperAdminSidebar />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <header className="flex items-center justify-between gap-4 h-16 px-6 border-b bg-background/95 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="superadmin-button-sidebar-toggle" />
              <div>
                <h1 className="text-lg font-semibold">System Settings</h1>
                <p className="text-sm text-muted-foreground">Configure platform behavior</p>
              </div>
            </div>
            <ThemeToggle />
          </header>
          
          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Platform Configuration
                </CardTitle>
                <CardDescription>
                  Manage system-wide settings and configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {defaultSettings.map((setting) => {
                      const currentSetting = settings?.find(s => s.key === setting.key);
                      const currentValue = currentSetting?.value;
                      
                      return (
                        <div
                          key={setting.key}
                          className="flex items-center justify-between gap-4 p-4 rounded-lg border"
                          data-testid={`setting-${setting.key}`}
                        >
                          <div className="flex-1">
                            <Label className="font-medium">{setting.label}</Label>
                            <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {setting.type === "boolean" ? (
                              <Switch
                                checked={currentValue === true || currentValue === "true"}
                                onCheckedChange={(checked) => {
                                  updateMutation.mutate({ key: setting.key, value: checked });
                                }}
                                disabled={updateMutation.isPending}
                                data-testid={`switch-${setting.key}`}
                              />
                            ) : editingKey === setting.key ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type={setting.type === "number" ? "number" : "text"}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-40"
                                  data-testid={`input-${setting.key}`}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const value = setting.type === "number" ? parseInt(editValue) : editValue;
                                    updateMutation.mutate({ key: setting.key, value });
                                  }}
                                  disabled={updateMutation.isPending}
                                  data-testid={`button-save-${setting.key}`}
                                >
                                  <Save className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium min-w-[100px] text-right">
                                  {currentValue !== undefined ? String(currentValue) : "Not set"}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingKey(setting.key);
                                    setEditValue(currentValue !== undefined ? String(currentValue) : "");
                                  }}
                                  data-testid={`button-edit-${setting.key}`}
                                >
                                  Edit
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
