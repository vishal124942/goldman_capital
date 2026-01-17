import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Activity,
  LogOut,
  Home,
  Database,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const superadminNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/superadmin" },
  { icon: Shield, label: "Admin Users", href: "/superadmin/admins" },
  { icon: Activity, label: "Activity Logs", href: "/superadmin/activity" },
  { icon: Settings, label: "System Settings", href: "/superadmin/settings" },
];

const quickLinks = [
  { icon: Users, label: "Manage Investors", href: "/admin/investors" },
  { icon: Database, label: "NAV & Returns", href: "/admin/nav" },
];

export function SuperAdminSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || user.email?.[0]?.toUpperCase() || "SA"
    : "SA";

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-sidebar-primary-foreground font-serif font-bold text-sm">G</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-sm leading-tight tracking-tight text-sidebar-foreground">Godman</span>
            <span className="text-[10px] text-sidebar-primary tracking-[0.15em] uppercase font-medium">Super Admin</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>System Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {superadminNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                    data-testid={`superadmin-sidebar-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickLinks.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.href}
                    data-testid={`superadmin-sidebar-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "SA"} />
              <AvatarFallback className="bg-accent text-primary text-sm font-medium">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">
                {user?.firstName || "Super"} {user?.lastName || "Admin"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user?.email || "superadmin@godmancapital.in"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Link href="/" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2" data-testid="superadmin-button-home">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => logout()} 
            className="flex-1 gap-2"
            data-testid="superadmin-button-logout"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
