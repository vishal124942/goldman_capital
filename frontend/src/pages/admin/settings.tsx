import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Shield,
  UserPlus,
  Settings,
  Eye,
  Edit,
  Users,
  FileText,
  Bell,
  BarChart3,
  TrendingUp,
} from "lucide-react";

interface AdminUserData {
  id: string;
  userId: string;
  role: string;
  permissions: string[] | null;
  createdAt: string;
  updatedAt: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
}

const defaultAdminUsers: AdminUserData[] = [
  {
    id: "1",
    userId: "system",
    role: "super_admin",
    permissions: ["all"],
    createdAt: "2024-01-14",
    updatedAt: null,
    firstName: "System",
    lastName: "Admin",
    email: "admin@godmancapital.com",
  },
];

const availablePermissions = [
  { key: "investors", label: "Manage Investors", icon: Users, description: "Create, edit, delete investors" },
  { key: "investors_view", label: "View Investors", icon: Eye, description: "View investor details only" },
  { key: "nav", label: "Manage NAV", icon: TrendingUp, description: "Update NAV and returns data" },
  { key: "statements", label: "Manage Statements", icon: FileText, description: "Generate and upload statements" },
  { key: "announcements", label: "Manage Announcements", icon: Bell, description: "Create and publish announcements" },
  { key: "reports", label: "Full Reports Access", icon: BarChart3, description: "View all reporting dashboards" },
  { key: "reports_view", label: "View Reports Only", icon: Eye, description: "View basic reports" },
];

const roleLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  super_admin: { label: "Super Admin", variant: "default" },
  admin: { label: "Admin", variant: "secondary" },
  read_only: { label: "Read Only", variant: "outline" },
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserData | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [editRole, setEditRole] = useState<string>("");

  const { data: backendAdminUsers } = useQuery<AdminUserData[]>({
    queryKey: ["/api/superadmin/users"],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      return apiRequest("PUT", `/api/superadmin/users/${id}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/users"] });
      setEditingUser(null);
      toast({
        title: "Role Updated",
        description: "Admin role has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Unable to update admin role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const adminUsers = backendAdminUsers && backendAdminUsers.length > 0
    ? backendAdminUsers
    : defaultAdminUsers;

  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    if (role === "super_admin") {
      setSelectedPermissions(["all"]);
    } else if (role === "read_only") {
      setSelectedPermissions(["investors_view", "reports_view"]);
    } else {
      setSelectedPermissions([]);
    }
  };

  const handleSaveRole = () => {
    if (editingUser && editRole) {
      updateRoleMutation.mutate({ id: editingUser.id, role: editRole });
    }
  };

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const openEditDialog = (admin: AdminUserData) => {
    setEditingUser(admin);
    setEditRole(admin.role);
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
                <h1 className="text-lg font-semibold">Settings</h1>
                <p className="text-sm text-muted-foreground">Admin Users & Permissions</p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Admin User Management</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage administrator access and permissions for the fund management platform
                </p>
              </div>
              <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-admin">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Admin User
              </Button>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Role Hierarchy</CardTitle>
                <CardDescription>
                  Three permission levels control access throughout the admin panel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-primary/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span className="font-semibold">Super Admin</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Full access to all features including user management and system settings
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="w-5 h-5 text-foreground" />
                      <span className="font-semibold">Admin</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Manage investors, NAV, statements, and announcements with configurable permissions
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-muted-foreground" />
                      <span className="font-semibold">Read Only</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      View-only access to investor data and reports without modification rights
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Admin Users</CardTitle>
                <CardDescription>
                  {adminUsers.length} administrators with platform access
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Added</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((admin) => (
                      <TableRow key={admin.id} data-testid={`row-admin-${admin.id}`}>
                        <TableCell className="font-medium">
                          {admin.firstName && admin.lastName
                            ? `${admin.firstName} ${admin.lastName}`
                            : admin.userId}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {admin.email || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleLabels[admin.role]?.variant || "secondary"}>
                            {roleLabels[admin.role]?.label || admin.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {admin.permissions?.includes("all") ? (
                            <span className="text-sm text-muted-foreground">All permissions</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              {admin.permissions?.length || 0} permissions
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(admin.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(admin)}
                            data-testid={`button-edit-admin-${admin.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Admin User</DialogTitle>
            <DialogDescription>
              Create a new administrator account with specific permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter first name" data-testid="input-admin-firstname" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" data-testid="input-admin-lastname" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="admin@godmancapital.com" data-testid="input-admin-email" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={handleRoleChange}>
                <SelectTrigger data-testid="select-new-admin-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin" data-testid="option-new-super-admin">Super Admin - Full Access</SelectItem>
                  <SelectItem value="admin" data-testid="option-new-admin">Admin - Configurable Permissions</SelectItem>
                  <SelectItem value="read_only" data-testid="option-new-read-only">Read Only - View Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedRole === "admin" && (
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="grid gap-3 max-h-48 overflow-y-auto p-1">
                  {availablePermissions
                    .filter((p) => !p.key.includes("_view"))
                    .map((permission) => (
                      <div
                        key={permission.key}
                        className="flex items-center gap-3 p-3 rounded-lg border hover-elevate cursor-pointer"
                        onClick={() => togglePermission(permission.key)}
                        data-testid={`permission-toggle-${permission.key}`}
                      >
                        <Checkbox
                          checked={selectedPermissions.includes(permission.key)}
                          onCheckedChange={() => togglePermission(permission.key)}
                          data-testid={`checkbox-permission-${permission.key}`}
                        />
                        <permission.icon className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{permission.label}</p>
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} data-testid="button-cancel-add">
              Cancel
            </Button>
            <Button onClick={() => setShowAddDialog(false)} data-testid="button-save-admin">
              Create Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Admin User</DialogTitle>
            <DialogDescription>
              Modify permissions for {editingUser?.userId}
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="font-medium">
                  {editingUser.firstName && editingUser.lastName
                    ? `${editingUser.firstName} ${editingUser.lastName}`
                    : editingUser.userId}
                </p>
                <p className="text-sm text-muted-foreground">
                  {editingUser.email || roleLabels[editingUser.role]?.label || editingUser.role}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editRole} onValueChange={setEditRole} data-testid="select-admin-role">
                  <SelectTrigger data-testid="select-trigger-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin" data-testid="option-super-admin">Super Admin</SelectItem>
                    <SelectItem value="admin" data-testid="option-admin">Admin</SelectItem>
                    <SelectItem value="read_only" data-testid="option-read-only">Read Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Current Permissions</Label>
                <div className="flex flex-wrap gap-2">
                  {(editingUser.permissions || []).map((perm) => (
                    <Badge key={perm} variant="secondary">
                      {perm === "all" ? "All Permissions" : perm.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} data-testid="button-cancel-edit">
              Cancel
            </Button>
            <Button onClick={handleSaveRole} disabled={updateRoleMutation.isPending} data-testid="button-update-admin">
              {updateRoleMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
