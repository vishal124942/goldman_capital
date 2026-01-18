import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InvestorSidebar } from "@/components/dashboard/sidebar";
import { AnnouncementList } from "@/components/dashboard/announcement-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiRequest } from "@/lib/queryClient";
import type { Announcement } from "@shared/schema";
import { useEffect } from "react";

const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Q4 2024 Performance Report Available",
    content: "The quarterly performance report for Q4 2024 is now available for download in your statements section. The fund delivered 6.2% returns for the quarter.",
    type: "update",
    priority: "normal",
    targetAudience: "all",
    isActive: true,
    publishedAt: new Date("2025-01-10"),
    expiresAt: null,
    createdBy: "admin1",
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
  },
  {
    id: "2",
    title: "Holiday Notice - Republic Day",
    content: "Please note that our offices will be closed on January 26, 2025 for Republic Day. Normal operations will resume on January 27, 2025.",
    type: "general",
    priority: "low",
    targetAudience: "all",
    isActive: true,
    publishedAt: new Date("2025-01-15"),
    expiresAt: new Date("2025-01-27"),
    createdBy: "admin1",
    createdAt: new Date("2025-01-15"),
    updatedAt: new Date("2025-01-15"),
  },
  {
    id: "3",
    title: "New Investment Opportunity - Real Estate Fund",
    content: "We are excited to announce a new co-investment opportunity in a premium real estate fund. Minimum commitment: ₹50 lakhs. Contact your relationship manager for details.",
    type: "update",
    priority: "high",
    targetAudience: "all",
    isActive: true,
    publishedAt: new Date("2025-01-08"),
    expiresAt: null,
    createdBy: "admin1",
    createdAt: new Date("2025-01-08"),
    updatedAt: new Date("2025-01-08"),
  },
  {
    id: "4",
    title: "Annual Investor Meet 2025",
    content: "You are cordially invited to our Annual Investor Meet on February 15, 2025 at The Taj Mahal Palace, Mumbai. RSVP by February 10, 2025.",
    type: "general",
    priority: "normal",
    targetAudience: "all",
    isActive: true,
    publishedAt: new Date("2025-01-05"),
    expiresAt: null,
    createdBy: "admin1",
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-05"),
  },
];

export default function AnnouncementsPage() {
  const queryClient = useQueryClient();
  
  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const displayAnnouncements = announcements || mockAnnouncements;

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
