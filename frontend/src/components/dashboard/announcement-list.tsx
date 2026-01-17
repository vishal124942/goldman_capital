import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, Info, CheckCircle } from "lucide-react";
import type { Announcement } from "@shared/schema";

interface AnnouncementListProps {
  announcements: Announcement[];
  isLoading?: boolean;
}

const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "high":
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case "normal":
      return <Info className="w-4 h-4 text-blue-500" />;
    case "low":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    default:
      return <Bell className="w-4 h-4 text-muted-foreground" />;
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case "urgent":
      return <Badge variant="destructive">Urgent</Badge>;
    case "update":
      return <Badge variant="default">Update</Badge>;
    case "general":
      return <Badge variant="secondary">General</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
};

const formatDate = (date: Date | string | null) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function AnnouncementList({ announcements, isLoading }: AnnouncementListProps) {
  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Announcements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-muted/50 animate-pulse space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted" />
                <div className="w-32 h-4 rounded bg-muted" />
              </div>
              <div className="w-full h-10 rounded bg-muted" />
              <div className="w-24 h-3 rounded bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!announcements || announcements.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No Announcements</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Important updates and announcements will appear here.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Announcements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getPriorityIcon(announcement.priority)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h4 className="font-medium text-sm">{announcement.title}</h4>
                  {getTypeBadge(announcement.type)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {announcement.content}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(announcement.publishedAt || announcement.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
