import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InvestorSidebar } from "@/components/dashboard/sidebar";
import { AnnouncementList } from "@/components/dashboard/announcement-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiRequest } from "@/lib/queryClient";
import type { Announcement } from "@shared/schema";
import { useEffect } from "react";



export default function AnnouncementsPage() {
  const queryClient = useQueryClient();
  
  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const displayAnnouncements = announcements || [];

  // Mark all announcements as read when page is viewed
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/investor/announcements/mark-all-read", {});
      return res.json();
    },
    onSuccess: () => {
      // Invalidate unread count query to update badge
      queryClient.invalidateQueries({ queryKey: ["/api/investor/unread-announcements"] });
    },
  });

  // Auto-mark as read when page loads
  useEffect(() => {
    if (!isLoading && displayAnnouncements.length > 0) {
      markAllReadMutation.mutate();
    }
  }, [isLoading]); // Only run once when data is loaded

  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <InvestorSidebar />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <header className="flex items-center justify-between gap-4 h-16 px-6 border-b bg-background/95 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div>
                <h1 className="text-lg font-semibold">Announcements</h1>
                <p className="text-sm text-muted-foreground">Important updates and notifications</p>
              </div>
            </div>
            <ThemeToggle />
          </header>
          
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-3xl">
              <AnnouncementList announcements={displayAnnouncements} isLoading={isLoading} />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
