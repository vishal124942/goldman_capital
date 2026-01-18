import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient, API_BASE_URL } from "@/lib/queryClient";
import { FileText, Upload, Download, Loader2, Users } from "lucide-react";
import type { Statement, InvestorProfile } from "@shared/schema";

export default function AdminStatementsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const [uploadInvestor, setUploadInvestor] = useState("");
  const [uploadType, setUploadType] = useState("");
  const [uploadPeriod, setUploadPeriod] = useState("");
  const [uploadYear, setUploadYear] = useState(new Date().getFullYear().toString());
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileUrl, setUploadFileUrl] = useState("");

  const { toast } = useToast();

  const { data: statements, isLoading: statementsLoading } = useQuery<Statement[]>({
    queryKey: ["/api/admin/statements"],
  });

  const { data: investors, isLoading: investorsLoading } = useQuery<InvestorProfile[]>({
    queryKey: ["/api/admin/investors"],
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { investorId: string; type: string; period: string; year: number; month?: number; quarter?: number }) => {
      return apiRequest("POST", "/api/admin/statements/generate", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statements"] });
      toast({
        title: "Statement Generated",
        description: "The statement has been generated successfully.",
      });
      setSelectedInvestor("");
      setSelectedType("");
      setSelectedPeriod("");
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/statements/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statements"] });
      toast({
        title: "Statements Uploaded",
        description: data.message || `Successfully processed ${data.statements?.length || 0} statements.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/statements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/statements"] });
      toast({
        title: "Statement Deleted",
        description: "The statement has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = async () => {
    if (!selectedType || !selectedPeriod || !selectedInvestor) {
      toast({
        title: "Missing Information",
        description: "Please select investor, statement type, and period.",
        variant: "destructive",
      });
      return;
    }

    let month: number | undefined;
    let quarter: number | undefined;

    if (selectedType === "monthly") {
      const monthMap: Record<string, number> = {
        "january": 1, "february": 2, "march": 3, "april": 4,
        "may": 5, "june": 6, "july": 7, "august": 8,
        "september": 9, "october": 10, "november": 11, "december": 12
      };
      month = monthMap[selectedPeriod.toLowerCase()];
    } else if (selectedType === "quarterly") {
      const quarterMap: Record<string, number> = { "q1": 1, "q2": 2, "q3": 3, "q4": 4 };
      quarter = quarterMap[selectedPeriod.toLowerCase()];
    }

    generateMutation.mutate({
      investorId: selectedInvestor,
      type: selectedType,
      period: selectedPeriod,
      year: parseInt(selectedYear),
      month,
      quarter,
    });
  };

  const handleGenerateForAll = async () => {
    if (!selectedType || !selectedPeriod) {
      toast({
        title: "Missing Information",
        description: "Please select statement type and period.",
        variant: "destructive",
      });
      return;
    }

    if (!investors || investors.length === 0) {
      toast({
        title: "No Investors",
        description: "No investors found to generate statements for.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    let month: number | undefined;
    let quarter: number | undefined;

    if (selectedType === "monthly") {
      const monthMap: Record<string, number> = {
        "january": 1, "february": 2, "march": 3, "april": 4,
        "may": 5, "june": 6, "july": 7, "august": 8,
        "september": 9, "october": 10, "november": 11, "december": 12
      };
      month = monthMap[selectedPeriod.toLowerCase()];
    } else if (selectedType === "quarterly") {
      const quarterMap: Record<string, number> = { "q1": 1, "q2": 2, "q3": 3, "q4": 4 };
      quarter = quarterMap[selectedPeriod.toLowerCase()];
    }

    try {
      for (const investor of investors) {
        await apiRequest("POST", "/api/admin/statements/generate", {
          investorId: investor.id,
          type: selectedType,
          period: selectedPeriod,
          year: parseInt(selectedYear),
          month,
          quarter,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/admin/statements"] });
      toast({
        title: "Statements Generated",
        description: `Generated ${selectedType} statements for ${investors.length} investors.`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate statements for all investors.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const [isDownloadingFiltered, setIsDownloadingFiltered] = useState(false);

  const handleDownloadFiltered = async () => {
    if (!selectedType && !selectedPeriod && !selectedYear && !selectedInvestor) {
      toast({
        title: "No Filters Selected",
        description: "Please select at least one filter (Type, Period, Year, or Investor) or download all.",
        variant: "default",
      });
      // Allow proceeding even without filters to download everything, just a warning or info might be enough, 
      // but let's proceed to allow "Download All" if nothing selected.
    }

    setIsDownloadingFiltered(true);

    try {
      const response = await fetch("/api/admin/statements/download-filtered", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          investorId: selectedInvestor || undefined,
          type: selectedType || undefined,
          period: selectedPeriod || undefined,
          year: selectedYear ? parseInt(selectedYear) : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Try to get filename from header
      const contentDisposition = response.headers.get("Content-Disposition");
      let fileName = "statements.zip";
      if (contentDisposition) {
        const matches = /filename="([^"]*)"/.exec(contentDisposition);
        if (matches && matches[1]) {
          fileName = matches[1];
        }
      }

      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: "Your filtered statements are downloading.",
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDownloadingFiltered(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadInvestor || !uploadType || !uploadPeriod || !uploadFileName || !uploadFileUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields including file name and URL.",
        variant: "destructive",
      });
      return;
    }

    // This function is no longer used - file upload is handled via handleFileUpload
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an Excel (.xlsx, .xls) or CSV file.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
    e.target.value = ""; // Reset file input
  };

  const getInvestorName = (investorId: string) => {
    const investor = investors?.find(i => i.id === investorId);
    return investor ? `${investor.firstName} ${investor.lastName}` : "Unknown";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "monthly": return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "quarterly": return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
      case "annual": return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const sidebarStyle = {
    "--sidebar-width": "17rem",
    "--sidebar-width-icon": "3.5rem",
  };

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  const years = [2024, 2025, 2026];

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full overflow-hidden">
        <AdminSidebar />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <header className="flex items-center justify-between gap-4 h-16 px-6 border-b bg-background/95 backdrop-blur shrink-0">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="admin-button-sidebar-toggle" />
              <div>
                <h1 className="text-lg font-semibold">Statements</h1>
                <p className="text-sm text-muted-foreground">Generate and manage investor statements</p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 bg-card hover-elevate transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-accent" />
                    Generate Statements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Investor (Optional for bulk)</Label>
                      <Select value={selectedInvestor} onValueChange={setSelectedInvestor}>
                        <SelectTrigger data-testid="admin-select-investor">
                          <SelectValue placeholder="Select investor or generate for all" />
                        </SelectTrigger>
                        <SelectContent>
                          {investorsLoading ? (
                            <div className="p-2"><Skeleton className="h-8 w-full" /></div>
                          ) : investors && investors.length > 0 ? (
                            investors.map((investor) => (
                              <SelectItem key={investor.id} value={investor.id}>
                                {investor.firstName} {investor.lastName}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">No investors found</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Statement Type</Label>
                      <Select value={selectedType} onValueChange={setSelectedType}>
                        <SelectTrigger data-testid="admin-select-statement-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly Statement</SelectItem>
                          <SelectItem value="quarterly">Quarterly Report</SelectItem>
                          <SelectItem value="annual">Annual Summary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Period</Label>
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger data-testid="admin-select-statement-period">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedType === "monthly" && months.map((month) => (
                            <SelectItem key={month} value={month.toLowerCase()}>{month}</SelectItem>
                          ))}
                          {selectedType === "quarterly" && quarters.map((q) => (
                            <SelectItem key={q} value={q.toLowerCase()}>{q}</SelectItem>
                          ))}
                          {selectedType === "annual" && (
                            <SelectItem value="annual">Annual</SelectItem>
                          )}
                          {!selectedType && (
                            <div className="p-2 text-sm text-muted-foreground">Select type first</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger data-testid="admin-select-statement-year">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handleGenerate}
                      disabled={generateMutation.isPending || !selectedInvestor}
                      className="gap-2"
                      data-testid="admin-button-generate-statement"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Generate for Selected
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleGenerateForAll}
                      disabled={isGenerating}
                      variant="outline"
                      className="gap-2"
                      data-testid="admin-button-generate-statements"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4" />
                          Generate for All Investors
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleDownloadFiltered}
                      disabled={isDownloadingFiltered}
                      variant="outline"
                      className="gap-2"
                      data-testid="admin-button-download-filtered"
                    >
                      {isDownloadingFiltered ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Download Filtered
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card hover-elevate transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Upload className="w-5 h-5 text-accent" />
                    Upload Statements (Excel)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Upload an Excel file with investor statement data. The file will be processed and PDFs will be generated automatically.
                  </p>
                  <div className="space-y-3">
                    <Label>Excel File</Label>
                    <div className="flex flex-col gap-3">
                      <Input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileUpload}
                        disabled={uploadMutation.isPending}
                        className="cursor-pointer"
                        data-testid="admin-upload-file-input"
                      />
                      <p className="text-xs text-muted-foreground">
                        Accepted formats: .xlsx, .xls, .csv
                      </p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <h4 className="font-medium text-sm mb-2">Required Excel Columns:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• <strong>investorName</strong> - Full name (e.g., "John Doe")</li>
                      <li>• <strong>type</strong> - monthly, quarterly, or annual</li>
                      <li>• <strong>period</strong> - e.g., "January" or "Q1"</li>
                      <li>• <strong>year</strong> - e.g., 2025</li>
                    </ul>
                  </div>
                  {uploadMutation.isPending && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing Excel file and generating PDFs...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-lg font-semibold">Statement History</CardTitle>
                <Badge variant="secondary">
                  {statements?.length || 0} statements
                </Badge>
              </CardHeader>
              <CardContent>
                {statementsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : statements && statements.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Investor</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Period</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Year</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Generated</th>
                          <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {statements.map((statement) => (
                          <tr key={statement.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 text-sm font-medium">
                              {getInvestorName(statement.investorId)}
                            </td>
                            <td className="py-3 px-4 text-sm capitalize">{statement.period}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge className={getTypeColor(statement.type)}>
                                {statement.type}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-center text-sm">{statement.year}</td>
                            <td className="py-3 px-4 text-sm text-muted-foreground">
                              {statement.generatedAt
                                ? new Date(statement.generatedAt).toLocaleDateString("en-IN")
                                : "—"}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                  data-testid={`admin-button-download-statement-${statement.id}`}
                                >
                                  {statement.fileUrl ? (
                                    <a
                                      href={`${API_BASE_URL}${statement.fileUrl}`}
                                      download
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                  ) : (
                                    <Download className="w-4 h-4 opacity-50 cursor-not-allowed" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No statements generated yet</p>
                    <p className="text-sm">Generate statements using the form above</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
