import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InvestorSidebar } from "@/components/dashboard/sidebar";
import { SupportRequestForm } from "@/components/dashboard/support-request-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { MessageSquare, Clock, CheckCircle, AlertCircle } from "lucide-react";
import type { SupportRequest } from "@shared/schema";

const mockRequests: SupportRequest[] = [
  {
    id: "1",
    investorId: "inv1",
    type: "statement_request",
    subject: "Request for Q4 2024 Statement",
    description: "Please provide the quarterly statement for Q4 2024",
    status: "closed",
    priority: "normal",
    assignedTo: null,
    resolvedAt: new Date("2025-01-08"),
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-08"),
  },
  {
    id: "2",
    investorId: "inv1",
    type: "general_inquiry",
    subject: "Query about portfolio allocation",
    description: "Would like to understand the current allocation strategy",
    status: "open",
    priority: "normal",
    assignedTo: "rm1",
    resolvedAt: null,
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-10"),
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "open":
      return <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">Open</Badge>;
    case "in_progress":
      return <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">In Progress</Badge>;
    case "closed":
      return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Resolved</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "open":
      return <AlertCircle className="w-4 h-4 text-blue-500" />;
    case "in_progress":
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case "closed":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    default:
      return <MessageSquare className="w-4 h-4" />;
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

export default function SupportPage() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const preselectedType = urlParams.get("type");

  const { data: requests, isLoading } = useQuery<SupportRequest[]>({
    queryKey: ["/api/investor/support-requests"],
  });

  const displayRequests = requests && requests.length > 0 ? requests : mockRequests;

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
                <h1 className="text-lg font-semibold">Support</h1>
                <p className="text-sm text-muted-foreground">Submit requests and get help</p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="grid lg:grid-cols-2 gap-6">
              <SupportRequestForm defaultType={preselectedType || undefined} />

              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Your Requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="p-4 rounded-lg bg-muted/50 animate-pulse space-y-2">
                          <div className="w-3/4 h-4 rounded bg-muted" />
                          <div className="w-1/2 h-3 rounded bg-muted" />
                        </div>
                      ))}
                    </div>
                  ) : displayRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <MessageSquare className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-1">No Requests Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Your support requests will appear here.
                      </p>
                    </div>
                  ) : (
                    displayRequests.map((request) => (
                      <div
                        key={request.id}
                        className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getStatusIcon(request.status)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h4 className="font-medium text-sm truncate">{request.subject}</h4>
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {request.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDate(request.createdAt)}
                              {request.resolvedAt && (
                                <span className="text-green-600 dark:text-green-400">
                                  {" "}· Resolved {formatDate(request.resolvedAt)}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
