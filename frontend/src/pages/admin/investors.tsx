import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, MoreHorizontal, Mail, Phone, X, Loader2, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, API_BASE_URL } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const investorSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  panNumber: z.string().optional(),
  investmentAmount: z.string().optional(),
  investorType: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => {
  if (data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type InvestorFormData = z.infer<typeof investorSchema>;

const mockInvestors = [
  {
    id: "1",
    name: "Rahul Sharma",
    email: "rahul.sharma@email.com",
    phone: "+91 98765 43210",
    investedAmount: 10000000,
    currentValue: 12750000,
    kycStatus: "verified",
    joinDate: "2023-06-15",
  },
  {
    id: "2",
    name: "Priya Mehta",
    email: "priya.mehta@email.com",
    phone: "+91 98765 43211",
    investedAmount: 25000000,
    currentValue: 31250000,
    kycStatus: "verified",
    joinDate: "2023-08-20",
  },
  {
    id: "3",
    name: "Amit Kapoor",
    email: "amit.kapoor@email.com",
    phone: "+91 98765 43212",
    investedAmount: 50000000,
    currentValue: 62500000,
    kycStatus: "verified",
    joinDate: "2023-04-10",
  },
  {
    id: "4",
    name: "Sneha Reddy",
    email: "sneha.reddy@email.com",
    phone: "+91 98765 43213",
    investedAmount: 15000000,
    currentValue: 18750000,
    kycStatus: "pending",
    joinDate: "2024-01-05",
  },
  {
    id: "5",
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    phone: "+91 98765 43214",
    investedAmount: 100000000,
    currentValue: 125000000,
    kycStatus: "verified",
    joinDate: "2023-02-28",
  },
];

interface InvestorWithPortfolio {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  kycStatus: string;
  createdAt: string | null;
  portfolio?: {
    totalInvested: string;
    currentValue: string;
  } | null;
}

export default function AdminInvestorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; tempPassword: string } | null>(null);

  // New state for action dialogs
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorWithPortfolio | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTransactionsDialog, setShowTransactionsDialog] = useState(false);
  const [showGenerateStatementDialog, setShowGenerateStatementDialog] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: backendInvestors } = useQuery<InvestorWithPortfolio[]>({
    queryKey: ["/api/admin/investors"],
  });

  // Fetch investor details when viewing
  const { data: investorDetails, isLoading: loadingDetails } = useQuery({
    queryKey: ["/api/admin/investors", selectedInvestor?.id],
    queryFn: async () => {
      if (!selectedInvestor?.id) return null;
      const res = await fetch(`${API_BASE_URL}/api/admin/investors/${selectedInvestor.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch details");
      return res.json();
    },
    enabled: !!selectedInvestor?.id && (showViewDialog || showEditDialog),
  });

  // Fetch investor transactions
  const { data: investorTransactions, isLoading: loadingTransactions } = useQuery({
    queryKey: ["/api/admin/investors", selectedInvestor?.id, "transactions"],
    queryFn: async () => {
      if (!selectedInvestor?.id) return [];
      const res = await fetch(`${API_BASE_URL}/api/admin/transactions?investorId=${selectedInvestor.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
    enabled: !!selectedInvestor?.id && showTransactionsDialog,
  });

  // Generate statement mutation
  const generateStatementMutation = useMutation({
    mutationFn: async (data: { investorId: string; type: string; period: string; year: number }) => {
      const response = await apiRequest("POST", "/api/admin/statements/generate", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Statement Generated",
        description: "The statement has been generated successfully.",
      });
      setShowGenerateStatementDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statements"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate statement. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Edit investor mutation
  const editInvestorMutation = useMutation({
    mutationFn: async (data: { id: string; updates: any }) => {
      const response = await apiRequest("PUT", `/api/admin/investors/${data.id}`, data.updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Investor profile has been updated successfully.",
      });
      setShowEditDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/investors"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Action handlers
  const handleViewDetails = (investor: any) => {
    const inv = backendInvestors?.find(i => i.id === investor.id);
    setSelectedInvestor(inv || null);
    setShowViewDialog(true);
  };

  const handleEditProfile = (investor: any) => {
    const inv = backendInvestors?.find(i => i.id === investor.id);
    setSelectedInvestor(inv || null);
    setShowEditDialog(true);
  };

  const handleGenerateStatement = (investor: any) => {
    const inv = backendInvestors?.find(i => i.id === investor.id);
    setSelectedInvestor(inv || null);
    setShowGenerateStatementDialog(true);
  };

  const handleViewTransactions = (investor: any) => {
    const inv = backendInvestors?.find(i => i.id === investor.id);
    setSelectedInvestor(inv || null);
    setShowTransactionsDialog(true);
  };

  const investors = backendInvestors && backendInvestors.length > 0
    ? backendInvestors.map((inv) => ({
      id: inv.id,
      name: `${inv.firstName || ""} ${inv.lastName || ""}`.trim() || "Unknown",
      email: inv.email || "—",
      phone: inv.phone || "—",
      investedAmount: inv.portfolio?.totalInvested ? parseFloat(inv.portfolio.totalInvested) : 0,
      currentValue: inv.portfolio?.currentValue ? parseFloat(inv.portfolio.currentValue) : 0,
      kycStatus: inv.kycStatus,
      joinDate: inv.createdAt ? new Date(inv.createdAt).toISOString().split("T")[0] : "—",
    }))
    : mockInvestors;

  const form = useForm<InvestorFormData>({
    resolver: zodResolver(investorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      panNumber: "",
      investmentAmount: "",
      investorType: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InvestorFormData) => {
      const response = await apiRequest("POST", "/api/admin/investors", data);
      return response.json();
    },
    onSuccess: (responseData) => {
      if (responseData.credentials) {
        setGeneratedCredentials({
          email: responseData.credentials.email,
          tempPassword: responseData.credentials.tempPassword,
        });
      }
      setOnboardingComplete(true);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/investors"] });
      toast({
        title: "Investor Onboarded",
        description: "New investor has been successfully added to the system.",
      });
    },
    onError: (error: Error) => {
      console.error("Create investor error:", error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to add investor. Please checking your input.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InvestorFormData) => {
    mutation.mutate(data);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setOnboardingComplete(false);
    setGeneratedCredentials(null);
    form.reset();
  };

  const filteredInvestors = investors.filter(
    (investor) =>
      investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <h1 className="text-lg font-semibold">Investors</h1>
                <p className="text-sm text-muted-foreground">Manage investor accounts</p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search investors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="admin-input-search-investors"
                />
              </div>
              <Button className="gap-2" onClick={() => setShowAddDialog(true)} data-testid="admin-button-add-investor">
                <Plus className="w-4 h-4" />
                Add Investor
              </Button>
            </div>

            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  All Investors ({filteredInvestors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Investor</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Invested</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Current Value</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">KYC Status</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvestors.map((investor) => (
                        <tr key={investor.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-accent/10 text-accent text-sm">
                                  {investor.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{investor.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Joined {new Date(investor.joinDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                {investor.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {investor.phone}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right text-sm font-medium">
                            ₹{(investor.investedAmount / 10000000).toFixed(2)} Cr
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div>
                              <p className="text-sm font-medium">₹{(investor.currentValue / 10000000).toFixed(2)} Cr</p>
                              <p className="text-xs text-green-600 dark:text-green-400">
                                +{(((investor.currentValue - investor.investedAmount) / investor.investedAmount) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge
                              className={
                                investor.kycStatus === "verified"
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                              }
                            >
                              {investor.kycStatus === "verified" ? "Verified" : "Pending"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`admin-button-investor-actions-${investor.id}`}>
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(investor)}>View Details</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditProfile(investor)}>Edit Profile</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleGenerateStatement(investor)}>Generate Statement</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewTransactions(investor)}>View Transactions</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{onboardingComplete ? "Investor Onboarded" : "Onboard New Investor"}</DialogTitle>
            <DialogDescription>
              {onboardingComplete
                ? "The investor account has been created successfully."
                : "Add a new investor to the Velocity Fund platform."}
            </DialogDescription>
          </DialogHeader>

          {onboardingComplete && generatedCredentials ? (
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-medium">Account Created</h4>
                    <p className="text-sm text-muted-foreground">Share these credentials with the investor</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-md bg-background">
                    <p className="text-xs text-muted-foreground mb-1">Login Email</p>
                    <p className="font-mono text-sm">{generatedCredentials.email}</p>
                  </div>
                  <div className="p-3 rounded-md bg-background">
                    <p className="text-xs text-muted-foreground mb-1">Temporary Password</p>
                    <p className="font-mono text-sm">{generatedCredentials.tempPassword}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={handleCloseDialog}>
                  Close
                </Button>
                <Button className="flex-1" onClick={() => {
                  navigator.clipboard.writeText(`Login: ${generatedCredentials.email}\nPassword: ${generatedCredentials.tempPassword}`);
                  toast({ title: "Copied", description: "Credentials copied to clipboard" });
                }}>
                  Copy Credentials
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="Rahul"
                    {...form.register("firstName")}
                    data-testid="admin-input-investor-firstname"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Sharma"
                    {...form.register("lastName")}
                    data-testid="admin-input-investor-lastname"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="rahul.sharma@email.com"
                  {...form.register("email")}
                  data-testid="admin-input-investor-email"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+91 98765 43210"
                    {...form.register("phone")}
                    data-testid="admin-input-investor-phone"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    placeholder="ABCDE1234F"
                    {...form.register("panNumber")}
                    className="uppercase"
                    data-testid="admin-input-investor-pan"
                  />
                  {form.formState.errors.panNumber && (
                    <p className="text-sm text-destructive">{form.formState.errors.panNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="investmentAmount">Investment Amount (₹)</Label>
                  <Input
                    id="investmentAmount"
                    type="number"
                    placeholder="10000000"
                    {...form.register("investmentAmount")}
                    data-testid="admin-input-investor-amount"
                  />
                  {form.formState.errors.investmentAmount && (
                    <p className="text-sm text-destructive">{form.formState.errors.investmentAmount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="investorType">Investor Type</Label>
                  <Select onValueChange={(value) => form.setValue("investorType", value)}>
                    <SelectTrigger data-testid="admin-select-investor-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hni">HNI (₹1-5 Cr)</SelectItem>
                      <SelectItem value="uhni">UHNI (₹5-25 Cr)</SelectItem>
                      <SelectItem value="institutional">Institutional (₹25+ Cr)</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.investorType && (
                    <p className="text-sm text-destructive">{form.formState.errors.investorType.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    {...form.register("password")}
                    data-testid="admin-input-investor-password"
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    {...form.register("confirmPassword")}
                    data-testid="admin-input-investor-confirm-password"
                  />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={mutation.isPending} data-testid="admin-button-submit-investor">
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Investor Account"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Investor Details</DialogTitle>
            <DialogDescription>View complete investor profile information</DialogDescription>
          </DialogHeader>
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : investorDetails ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{investorDetails.firstName} {investorDetails.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{investorDetails.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{investorDetails.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">KYC Status</p>
                  <Badge className={investorDetails.kycStatus === "verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                    {investorDetails.kycStatus || "pending"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Invested</p>
                  <p className="font-medium">₹{((investorDetails.portfolio?.totalInvested || 0) / 10000000).toFixed(2)} Cr</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Value</p>
                  <p className="font-medium">₹{((investorDetails.portfolio?.currentValue || 0) / 10000000).toFixed(2)} Cr</p>
                </div>
              </div>
              <Button className="w-full" onClick={() => setShowViewDialog(false)}>Close</Button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">No details available</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Investor Profile</DialogTitle>
            <DialogDescription>Update investor information</DialogDescription>
          </DialogHeader>
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : investorDetails ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              editInvestorMutation.mutate({
                id: selectedInvestor?.id || "",
                updates: {
                  firstName: formData.get("firstName"),
                  lastName: formData.get("lastName"),
                  phone: formData.get("phone"),
                  kycStatus: formData.get("kycStatus"),
                  password: formData.get("password"),
                }
              });
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input id="editFirstName" name="firstName" defaultValue={investorDetails.firstName || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input id="editLastName" name="lastName" defaultValue={investorDetails.lastName || ""} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPassword">New Password (Optional)</Label>
                <Input id="editPassword" name="password" type="password" placeholder="Enter new password to update" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editPhone">Phone</Label>
                <Input id="editPhone" name="phone" defaultValue={investorDetails.phone || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editKycStatus">KYC Status</Label>
                <Select name="kycStatus" defaultValue={investorDetails.kycStatus || "pending"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEditDialog(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={editInvestorMutation.isPending}>
                  {editInvestorMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Generate Statement Dialog */}
      <Dialog open={showGenerateStatementDialog} onOpenChange={setShowGenerateStatementDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Statement</DialogTitle>
            <DialogDescription>Create a new statement for {selectedInvestor?.firstName} {selectedInvestor?.lastName}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const period = formData.get("period") as string;
            const year = parseInt(period.split("_")[1] || "2025");
            generateStatementMutation.mutate({
              investorId: selectedInvestor?.id || "",
              type: formData.get("type") as string,
              period: period,
              year: year,
            });
          }} className="space-y-4">
            <div className="space-y-2">
              <Label>Statement Type</Label>
              <Select name="type" defaultValue="quarterly">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">Quarterly Statement</SelectItem>
                  <SelectItem value="annual">Annual Statement</SelectItem>
                  <SelectItem value="capital_account">Capital Account Statement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Select name="period" defaultValue="Q4_2025">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Q1_2025">Q1 2025</SelectItem>
                  <SelectItem value="Q2_2025">Q2 2025</SelectItem>
                  <SelectItem value="Q3_2025">Q3 2025</SelectItem>
                  <SelectItem value="Q4_2025">Q4 2025</SelectItem>
                  <SelectItem value="FY_2025">FY 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowGenerateStatementDialog(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={generateStatementMutation.isPending}>
                {generateStatementMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : "Generate"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Transactions Dialog */}
      <Dialog open={showTransactionsDialog} onOpenChange={setShowTransactionsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
            <DialogDescription>View all transactions for {selectedInvestor?.firstName} {selectedInvestor?.lastName}</DialogDescription>
          </DialogHeader>
          {loadingTransactions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : investorTransactions && investorTransactions.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-2 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-right py-2 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-center py-2 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {investorTransactions.map((txn: any) => (
                    <tr key={txn._id || txn.id} className="border-b last:border-0">
                      <td className="py-3 text-sm">{new Date(txn.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-sm capitalize">{txn.type}</td>
                      <td className="py-3 text-sm text-right font-medium">₹{(parseFloat(txn.amount) / 100000).toFixed(2)} L</td>
                      <td className="py-3 text-center">
                        <Badge className={txn.status === "processed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                          {txn.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No transactions found</p>
          )}
          <Button className="w-full" onClick={() => setShowTransactionsDialog(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </SidebarProvider >
  );
}
