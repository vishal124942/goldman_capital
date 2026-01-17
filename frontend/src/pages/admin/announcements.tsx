import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Bell, Trash2, Edit, Loader2 } from "lucide-react";
import type { Announcement } from "@shared/schema";

const announcementSchema = z.object({
  title: z.string().min(5, "Title is required"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  type: z.string().min(1, "Please select a type"),
  priority: z.string().min(1, "Please select a priority"),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Q4 2024 Performance Report Available",
    content: "The quarterly performance report for Q4 2024 is now available for download.",
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
    content: "Our offices will be closed on January 26, 2025 for Republic Day.",
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
];

export default function AdminAnnouncementsPage() {
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "",
      priority: "normal",
    },
  });

  const { data: announcements } = useQuery<Announcement[]>({
    queryKey: ["/api/admin/announcements"],
  });

  const mutation = useMutation({
    mutationFn: async (data: AnnouncementFormData) => {
      return apiRequest("POST", "/api/admin/announcements", data);
    },
    onSuccess: () => {
      setShowForm(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      toast({
        title: "Announcement Published",
        description: "Your announcement has been published to investors.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to publish announcement.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AnnouncementFormData) => {
    mutation.mutate(data);
  };

  const displayAnnouncements = announcements || mockAnnouncements;

  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
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
                <h1 className="text-lg font-semibold">Announcements</h1>
                <p className="text-sm text-muted-foreground">Publish updates to investors</p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="flex justify-end">
              <Button
                onClick={() => setShowForm(!showForm)}
                className="gap-2"
                data-testid="admin-button-new-announcement"
              >
                <Plus className="w-4 h-4" />
                New Announcement
              </Button>
            </div>

            {showForm && (
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Create Announcement</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          placeholder="Announcement title"
                          {...form.register("title")}
                          data-testid="admin-input-announcement-title"
                        />
                        {form.formState.errors.title && (
                          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">Type</Label>
                          <Select onValueChange={(value) => form.setValue("type", value)}>
                            <SelectTrigger data-testid="admin-select-announcement-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="update">Update</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            defaultValue="normal"
                            onValueChange={(value) => form.setValue("priority", value)}
                          >
                            <SelectTrigger data-testid="admin-select-announcement-priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Announcement content..."
                        rows={4}
                        {...form.register("content")}
                        data-testid="admin-input-announcement-content"
                      />
                      {form.formState.errors.content && (
                        <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
                      )}
                    </div>
                    <div className="flex gap-4">
                      <Button type="submit" disabled={mutation.isPending} data-testid="admin-button-publish-announcement">
                        {mutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          "Publish Announcement"
                        )}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Published Announcements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayAnnouncements.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Bell className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-medium mb-1">No Announcements</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first announcement to notify investors.
                    </p>
                  </div>
                ) : (
                  displayAnnouncements.map((announcement) => (
                    <div
                      key={announcement.id}
                      className="flex items-start justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-medium">{announcement.title}</h4>
                          <Badge variant="secondary">{announcement.type}</Badge>
                          {announcement.priority === "high" && (
                            <Badge variant="destructive">High Priority</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Published: {new Date(announcement.publishedAt || announcement.createdAt!).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" data-testid={`admin-button-edit-announcement-${announcement.id}`}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" data-testid={`admin-button-delete-announcement-${announcement.id}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
