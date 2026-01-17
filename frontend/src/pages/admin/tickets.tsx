import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { MessageSquare, Calendar, User, Eye, CheckCircle, Mail, AlertCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SupportRequest {
    _id: string;
    investorId: string;
    investorName?: string;
    email?: string;
    subject: string;
    message?: string;
    description?: string;
    status: "open" | "closed" | "pending" | "resolved";
    priority: "low" | "medium" | "high" | "normal";
    createdAt: string;
    updatedAt: string;
}

export default function AdminTicketsPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: tickets, isLoading } = useQuery<SupportRequest[]>({
        queryKey: ["/api/admin/support-requests"],
    });

    const [selectedTicket, setSelectedTicket] = useState<SupportRequest | null>(null);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const res = await apiRequest("PUT", `/api/admin/support-requests/${id}/status`, { status });
            return res.json();
        },
        onSuccess: (updatedTicket) => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/support-requests"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications/counts"] }); // Update badges

            // Update selected ticket state so the dialog reflects the new status immediately
            if (selectedTicket && selectedTicket._id === updatedTicket._id) {
                setSelectedTicket(updatedTicket);
            }

            toast({
                title: "Status Updated",
                description: `Ticket status changed to ${updatedTicket.status}`,
            });
        },
        onError: () => {
            toast({
                title: "Update Failed",
                description: "Failed to update ticket status. Please try again.",
                variant: "destructive",
            });
        },
    });

    const sidebarStyle = {
        "--sidebar-width": "17rem",
        "--sidebar-width-icon": "3.5rem",
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "destructive";
            case "medium": return "default";
            case "low": return "secondary";
            default: return "outline";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open": return "bg-orange-500 hover:bg-orange-600";
            case "pending": return "bg-yellow-500 hover:bg-yellow-600";
            case "resolved": return "bg-green-500 hover:bg-green-600";
            case "closed": return "bg-gray-500 hover:bg-gray-600";
            default: return "";
        }
    };

    const handleStatusChange = (newStatus: string) => {
        if (selectedTicket) {
            updateStatusMutation.mutate({ id: selectedTicket._id, status: newStatus });
        }
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
                                <h1 className="text-lg font-semibold">Support Tickets</h1>
                                <p className="text-sm text-muted-foreground">Manage investor inquiries</p>
                            </div>
                        </div>
                        <ThemeToggle />
                    </header>

                    <main className="flex-1 p-6 space-y-6 overflow-y-auto">
                        <Card className="bg-card">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    All Tickets
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isLoading ? (
                                    <div className="text-center py-8">Loading tickets...</div>
                                ) : !tickets || tickets.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                                            <MessageSquare className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="font-medium mb-1">No Tickets</h3>
                                        <p className="text-sm text-muted-foreground">
                                            No support requests found from investors.
                                        </p>
                                    </div>
                                ) : (
                                    tickets.map((ticket) => (
                                        <div
                                            key={ticket._id}
                                            className="flex items-start justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
                                        >
                                            <div className="flex-1 min-w-0 mr-4 space-y-2">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h4 className="font-medium text-base">{ticket.subject}</h4>
                                                    <Badge className={getStatusColor(ticket.status)}>
                                                        {ticket.status.toUpperCase()}
                                                    </Badge>
                                                    <Badge variant={getPriorityColor(ticket.priority) as any}>
                                                        {ticket.priority.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {ticket.description || ticket.message}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(ticket.createdAt).toLocaleDateString("en-IN")}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {ticket.investorName ? `Investor: ${ticket.investorName}` : `Investor ID: ${ticket.investorId.substring(0, 8)}...`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2"
                                                    onClick={() => setSelectedTicket(ticket)}
                                                >
                                                    <Eye className="w-4 h-4" /> View
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </main>

                    <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{selectedTicket?.subject}</DialogTitle>
                                <DialogDescription className="flex items-center gap-4 pt-2">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {selectedTicket && new Date(selectedTicket.createdAt).toLocaleString("en-IN")}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {selectedTicket?.investorName || selectedTicket?.investorId}
                                    </span>
                                    {selectedTicket?.email && (
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {selectedTicket.email}
                                        </span>
                                    )}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 pt-4">
                                <div className="flex gap-2 items-center">
                                    <div className="w-[180px]">
                                        <Select
                                            disabled={updateStatusMutation.isPending}
                                            value={selectedTicket?.status}
                                            onValueChange={handleStatusChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="open">Open</SelectItem>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="resolved">Resolved</SelectItem>
                                                <SelectItem value="closed">Closed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Badge variant={selectedTicket ? getPriorityColor(selectedTicket.priority) as any : "outline"}>
                                        {selectedTicket?.priority.toUpperCase()}
                                    </Badge>
                                </div>

                                <div className="bg-muted/30 p-4 rounded-lg border">
                                    <h4 className="text-sm font-medium mb-2 text-foreground/80">Message</h4>
                                    <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                                        {selectedTicket?.description || selectedTicket?.message}
                                    </p>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </SidebarProvider>
    );
}
