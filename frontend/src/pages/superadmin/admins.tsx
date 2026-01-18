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
import { Plus, Shield, Trash2, Search, Filter, MoreHorizontal, Users, FileText, TrendingUp, Check } from "lucide-react";

interface AdminUser {
  _id: string;
  id: string;
  userId: string;
  role: string;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
}
// ...


export default function SuperAdminAdminsPage() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
    permissions: [] as string[],
  });

  const { data: admins, isLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/superadmin/users"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newAdminData) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...apiData } = data; // Exclude confirmPassword from API call
      return apiRequest("POST", "/api/superadmin/users", apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/users"] });
      setIsCreateOpen(false);
      setNewAdminData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "admin",
        permissions: [],
      });
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
                <DialogContent className="max-w-2xl bg-[#0B0C10] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Add Admin User</DialogTitle>
                    <div className="text-sm text-muted-foreground">
                      Create a new administrator account with specific permissions
                    </div>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-zinc-400">First Name</Label>
                        <Input
                          id="firstName"
                          value={newAdminData.firstName}
                          onChange={(e) => setNewAdminData({ ...newAdminData, firstName: e.target.value })}
                          placeholder="Enter first name"
                          className="bg-[#1C1E26] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary/20"
                          data-testid="input-admin-firstname"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-zinc-400">Last Name</Label>
                        <Input
                          id="lastName"
                          value={newAdminData.lastName}
                          onChange={(e) => setNewAdminData({ ...newAdminData, lastName: e.target.value })}
                          placeholder="Enter last name"
                          className="bg-[#1C1E26] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary/20"
                          data-testid="input-admin-lastname"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-zinc-400">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newAdminData.email}
                        onChange={(e) => setNewAdminData({ ...newAdminData, email: e.target.value })}
                        placeholder="admin@godmancapital.com"
                        className="bg-[#1C1E26] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary/20"
                        data-testid="input-admin-email"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-zinc-400">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newAdminData.password}
                          onChange={(e) => setNewAdminData({ ...newAdminData, password: e.target.value })}
                          placeholder="Create password"
                          className="bg-[#1C1E26] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary/20"
                          data-testid="input-admin-password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-zinc-400">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={newAdminData.confirmPassword}
                          onChange={(e) => setNewAdminData({ ...newAdminData, confirmPassword: e.target.value })}
                          placeholder="Confirm password"
                          className={`bg-[#1C1E26] border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-primary/20 ${
                            newAdminData.confirmPassword && newAdminData.password !== newAdminData.confirmPassword ? "border-red-500/50" : ""
                          }`}
                          data-testid="input-admin-confirm-password"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-zinc-400">Role</Label>
                      <Select value={newAdminData.role} onValueChange={(val) => setNewAdminData({ ...newAdminData, role: val })}>
                        <SelectTrigger className="bg-[#1C1E26] border-white/10 text-white data-[placeholder]:text-zinc-600" data-testid="select-admin-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1C1E26] border-white/10 text-white">
                          <SelectItem value="admin">Admin - Configurable Permissions</SelectItem>
                          <SelectItem value="super_admin">Super Admin - Full Access</SelectItem>
                          <SelectItem value="read_only">Read Only - View Access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-zinc-400">Permissions</Label>
                      <div className="space-y-2">
                        {[
                          { id: "manage_investors", label: "Manage Investors", desc: "Create, edit, delete investors", icon: Users },
                          { id: "manage_nav", label: "Manage NAV", desc: "Update NAV and returns data", icon: TrendingUp },
                          { id: "manage_statements", label: "Manage Statements", desc: "Generate and upload statements", icon: FileText },
                        ].map((perm) => (
                          <div
                            key={perm.id}
                            className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                              newAdminData.permissions.includes(perm.id)
                                ? "bg-primary/10 border-primary/50"
                                : "bg-[#1C1E26] border-white/5 hover:border-white/10"
                            }`}
                            onClick={() => {
                              const newPerms = newAdminData.permissions.includes(perm.id)
                                ? newAdminData.permissions.filter((p) => p !== perm.id)
                                : [...newAdminData.permissions, perm.id];
                              setNewAdminData({ ...newAdminData, permissions: newPerms });
                            }}
                          >
                             <div className={`mt-1 h-5 w-5 rounded border flex items-center justify-center ${
                                newAdminData.permissions.includes(perm.id) ? "bg-primary border-primary" : "border-zinc-600"
                             }`}>
                                {newAdminData.permissions.includes(perm.id) && <Check className="h-3 w-3 text-white" />}
                             </div>
                             <div className="flex-1">
                               <div className="flex items-center gap-2">
                                 <perm.icon className="h-4 w-4 text-primary" />
                                 <p className="text-sm font-medium text-white">{perm.label}</p>
                               </div>
                               <p className="text-xs text-zinc-400">{perm.desc}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateOpen(false)}
                        className="border-white/10 text-white hover:bg-white/5 hover:text-white"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => createMutation.mutate(newAdminData)}
                        disabled={
                          !newAdminData.email || 
                          !newAdminData.password || 
                          !newAdminData.confirmPassword ||
                          newAdminData.password !== newAdminData.confirmPassword ||
                          createMutation.isPending
                        }
                        className="bg-primary hover:bg-primary/90 text-white"
                        data-testid="button-submit-create-admin"
                      >
                        {createMutation.isPending ? "Creating..." : "Create Admin"}
                      </Button>
                    </div>
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
                            <p className="font-medium">
                              {(admin as any).firstName && (admin as any).lastName 
                                ? `${(admin as any).firstName} ${(admin as any).lastName}` 
                                : admin.userId}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {(admin as any).email || admin.userId}
                            </p>
                            <p className="text-xs text-muted-foreground">
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
                            onClick={() => {
                              if (confirm("Are you sure you want to remove this admin?")) {
                                deleteMutation.mutate(admin._id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-admin-${admin._id}`}
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
