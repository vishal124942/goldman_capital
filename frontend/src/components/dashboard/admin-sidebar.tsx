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
  FileText,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Home,
  TrendingUp,
  Upload,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";

interface NotificationCounts {
  tickets: number;
  announcements: number;
}

const adminNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin", badge: null },
  { icon: Users, label: "Investors", href: "/admin/investors", badge: null },
  { icon: MessageSquare, label: "Tickets", href: "/admin/tickets", badge: "tickets" },
  { icon: TrendingUp, label: "NAV & Returns", href: "/admin/nav", badge: null },
  { icon: FileText, label: "Statements", href: "/admin/statements", badge: null },
  { icon: Bell, label: "Announcements", href: "/admin/announcements", badge: "announcements" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports", badge: null },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { user, logout, isSuperAdmin } = useAuth();

  const { data: counts } = useQuery<NotificationCounts>({
    queryKey: ["/api/admin/notifications/counts"],
    refetchInterval: 30000,
  });

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || user.email?.[0]?.toUpperCase() || "A"
    : "A";

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-sidebar-primary-foreground font-serif font-bold text-sm">G</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-sm leading-tight tracking-tight text-sidebar-foreground">Godman</span>
            <span className="text-[10px] text-sidebar-primary tracking-[0.15em] uppercase font-medium">Admin Panel</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const count = item.badge && counts ? (counts as any)[item.badge] : 0;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.href}
                      data-testid={`admin-sidebar-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <Link href={item.href} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {count > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                            {count > 99 ? "99+" : count}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="admin-sidebar-link-upload">
                  <Link href="/admin/upload">
                    <Upload className="w-4 h-4" />
                    <span>Upload Statements</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="admin-sidebar-link-website">
                  <Link href="/">
                    <Home className="w-4 h-4" />
                    <span>Back to Website</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isSuperAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild data-testid="admin-sidebar-link-settings">
                    <Link href="/admin/settings">
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">Administrator</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
            data-testid="admin-button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
