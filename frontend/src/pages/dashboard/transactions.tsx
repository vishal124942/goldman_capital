import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InvestorSidebar } from "@/components/dashboard/sidebar";
import { TransactionList } from "@/components/dashboard/transaction-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Copy, CheckCircle, Upload, Loader2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Transaction } from "@shared/schema";

const paymentDetails = {
  bankName: "HDFC Bank",
  accountName: "Godman Capital Asset Management LLP - Velocity Fund",
  accountNumber: "50200012345678",
  ifscCode: "HDFC0001234",
  branchName: "Nariman Point, Mumbai",
};

export default function TransactionsPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [confirmationUrl, setConfirmationUrl] = useState("");
  const { toast } = useToast();
  
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/investor/transactions"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { transactionId: string; confirmationUrl: string }) => {
      return apiRequest("POST", "/api/investor/transactions/upload-confirmation", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investor/transactions"] });
      toast({
        title: "Confirmation Uploaded",
        description: "Your payment confirmation has been submitted for verification.",
      });
      setUploadDialogOpen(false);
      setSelectedTransaction(null);
      setConfirmationUrl("");
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleUploadConfirmation = () => {
    if (!selectedTransaction || !confirmationUrl.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide the payment confirmation URL or reference.",
        variant: "destructive",
      });
      return;
    }
    
    uploadMutation.mutate({
      transactionId: selectedTransaction.id,
      confirmationUrl: confirmationUrl.trim(),
    });
  };

  const pendingTransactions = transactions?.filter(t => t.status === "pending" || t.status === "pending_verification") || [];

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
                <h1 className="text-lg font-semibold">Transactions</h1>
                <p className="text-sm text-muted-foreground">View your contribution history</p>
              </div>
            </div>
            <ThemeToggle />
          </header>
          
          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <TransactionList transactions={transactions || []} isLoading={isLoading} />
                
                {pendingTransactions.length > 0 && (
                  <Card className="bg-card border-amber-200 dark:border-amber-800">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Upload className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        Pending Confirmations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload payment confirmation for your pending transactions to speed up processing.
                      </p>
                      {pendingTransactions.map((transaction) => (
                        <div 
                          key={transaction.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              ₹{Number(transaction.amount).toLocaleString("en-IN")}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString("en-IN") : "—"}
                              {transaction.status === "pending_verification" && " • Awaiting verification"}
                            </p>
                          </div>
                          <Dialog open={uploadDialogOpen && selectedTransaction?.id === transaction.id} onOpenChange={(open) => {
                            setUploadDialogOpen(open);
                            if (!open) {
                              setSelectedTransaction(null);
                              setConfirmationUrl("");
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="gap-2"
                                onClick={() => setSelectedTransaction(transaction)}
                                data-testid={`button-upload-confirmation-${transaction.id}`}
                              >
                                <Upload className="w-4 h-4" />
                                {transaction.confirmationUrl ? "Update" : "Upload"} Confirmation
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Upload Payment Confirmation</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="p-4 rounded-lg bg-muted/50">
                                  <p className="text-sm font-medium">Transaction Details</p>
                                  <p className="text-2xl font-bold mt-1" data-testid="text-transaction-amount">
                                    ₹{Number(transaction.amount).toLocaleString("en-IN")}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1" data-testid="text-transaction-date">
                                    {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString("en-IN", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }) : "—"}
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="confirmation-input">Payment Reference / UTR Number</Label>
                                  <Input
                                    id="confirmation-input"
                                    placeholder="Enter UTR number or payment reference"
                                    value={confirmationUrl}
                                    onChange={(e) => setConfirmationUrl(e.target.value)}
                                    data-testid="input-confirmation-url"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Enter the UTR number from your bank transfer, RTGS/NEFT reference, or transaction ID.
                                  </p>
                                </div>
                                
                                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                                  <p className="text-sm text-accent font-medium">Need to share a screenshot?</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Email your payment confirmation to investor.relations@godmancapital.in with your name and transaction details.
                                  </p>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button 
                                  onClick={handleUploadConfirmation}
                                  disabled={uploadMutation.isPending}
                                  className="gap-2"
                                  data-testid="button-submit-confirmation"
                                >
                                  {uploadMutation.isPending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      Submit Confirmation
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>
              
              <div className="space-y-6">
                <Card className="bg-card hover-elevate transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-accent" />
                      Payment Instructions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      For additional investments, please transfer funds to the following account:
                    </p>
                    
                    {Object.entries(paymentDetails).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2">
                        <div>
                          <p className="text-xs text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-sm font-medium">{value}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(value, key)}
                          data-testid={`button-copy-${key}`}
                        >
                          {copied === key ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        After transferring, upload the payment confirmation using the form above or email it to:
                      </p>
                      <p className="text-sm font-medium text-accent mt-1">
                        investor.relations@godmancapital.in
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/5 border-accent/20 hover-elevate transition-all duration-300">
                  <CardContent className="p-6">
                    <h4 className="font-medium mb-2">Need to make an additional investment?</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Contact your relationship manager to discuss additional contributions to the fund.
                    </p>
                    <Button className="w-full" asChild data-testid="button-request-investment">
                      <Link href="/dashboard/support?type=additional_investment">
                        Request Additional Investment
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
