import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "@/components/dashboard/superadmin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Shield, Trash2, Edit } from "lucide-react";

interface AdminUser {
  id: string;
  userId: string;
  role: string;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
}

export default function SuperAdminAdminsPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState("admin");

  const { data: admins, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/superadmin/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      return apiRequest("POST", "/api/superadmin/users", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/users"] });
      setIsCreateOpen(false);
      setNewUserId("");
      setNewRole("admin");
      toast({
        title: "Admin Created",
        description: "New admin user has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/superadmin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/users"] });
      toast({
        title: "Admin Removed",
        description: "Admin user has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove admin user.",
        variant: "destructive",
      });
    },
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
                <h1 className="text-lg font-semibold">Admin Users</h1>
                <p className="text-sm text-muted-foreground">Manage system administrators</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" data-testid="button-create-admin">
                    <Plus className="w-4 h-4" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Admin</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="userId">User ID</Label>
                      <Input
                        id="userId"
                        value={newUserId}
                        onChange={(e) => setNewUserId(e.target.value)}
                        placeholder="Enter user ID"
                        data-testid="input-admin-user-id"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger data-testid="select-admin-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => createMutation.mutate({ userId: newUserId, role: newRole })}
                      disabled={!newUserId || createMutation.isPending}
                      data-testid="button-submit-create-admin"
                    >
                      {createMutation.isPending ? "Creating..." : "Create Admin"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <ThemeToggle />
            </div>
          </header>
          
          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">All Administrators</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : admins && admins.length > 0 ? (
                  <div className="space-y-3">
                    {admins.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex items-center justify-between gap-4 p-4 rounded-lg border"
                        data-testid={`admin-row-${admin.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{admin.userId}</p>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(admin.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={admin.role === "super_admin" ? "default" : "secondary"}>
                            {admin.role === "super_admin" ? "Super Admin" : "Admin"}
                          </Badge>
                          <Badge variant={admin.isActive ? "default" : "outline"}>
                            {admin.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(admin.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-admin-${admin.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No admin users found</p>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
