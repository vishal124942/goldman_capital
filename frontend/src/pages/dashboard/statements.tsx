import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InvestorSidebar } from "@/components/dashboard/sidebar";
import { StatementList } from "@/components/dashboard/statement-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Statement } from "@shared/schema";

const mockStatements: Statement[] = [
  {
    id: "1",
    investorId: "inv1",
    type: "monthly",
    period: "December",
    year: 2024,
    month: 12,
    quarter: null,
    fileName: "Statement_Dec_2024.pdf",
    fileUrl: "#",
    fileSize: 245000,
    version: 1,
    generatedAt: new Date("2025-01-05"),
    createdAt: new Date("2025-01-05"),
  },
  {
    id: "2",
    investorId: "inv1",
    type: "monthly",
    period: "November",
    year: 2024,
    month: 11,
    quarter: null,
    fileName: "Statement_Nov_2024.pdf",
    fileUrl: "#",
    fileSize: 238000,
    version: 1,
    generatedAt: new Date("2024-12-05"),
    createdAt: new Date("2024-12-05"),
  },
  {
    id: "3",
    investorId: "inv1",
    type: "quarterly",
    period: "Q3",
    year: 2024,
    month: null,
    quarter: 3,
    fileName: "Quarterly_Report_Q3_2024.pdf",
    fileUrl: "#",
    fileSize: 512000,
    version: 1,
    generatedAt: new Date("2024-10-15"),
    createdAt: new Date("2024-10-15"),
  },
  {
    id: "4",
    investorId: "inv1",
    type: "quarterly",
    period: "Q2",
    year: 2024,
    month: null,
    quarter: 2,
    fileName: "Quarterly_Report_Q2_2024.pdf",
    fileUrl: "#",
    fileSize: 498000,
    version: 1,
    generatedAt: new Date("2024-07-15"),
    createdAt: new Date("2024-07-15"),
  },
  {
    id: "5",
    investorId: "inv1",
    type: "annual",
    period: "FY",
    year: 2024,
    month: null,
    quarter: null,
    fileName: "Annual_Summary_FY2024.pdf",
    fileUrl: "#",
    fileSize: 1250000,
    version: 1,
    generatedAt: new Date("2024-04-30"),
    createdAt: new Date("2024-04-30"),
  },
];

export default function StatementsPage() {
  const { data: statements, isLoading } = useQuery<Statement[]>({
    queryKey: ["/api/investor/statements"],
  });

  const displayStatements = statements && statements.length > 0 ? statements : mockStatements;

  const monthlyStatements = displayStatements.filter(s => s.type === "monthly");
  const quarterlyStatements = displayStatements.filter(s => s.type === "quarterly");
  const annualStatements = displayStatements.filter(s => s.type === "annual");

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
                <h1 className="text-lg font-semibold">Statements & Reports</h1>
                <p className="text-sm text-muted-foreground">Download your investment statements</p>
              </div>
            </div>
            <ThemeToggle />
          </header>
          
          <main className="flex-1 p-6 overflow-y-auto">
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all" data-testid="tab-all-statements">All</TabsTrigger>
                <TabsTrigger value="monthly" data-testid="tab-monthly-statements">Monthly</TabsTrigger>
                <TabsTrigger value="quarterly" data-testid="tab-quarterly-statements">Quarterly</TabsTrigger>
                <TabsTrigger value="annual" data-testid="tab-annual-statements">Annual</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <StatementList statements={displayStatements} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="monthly">
                <StatementList statements={monthlyStatements} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="quarterly">
                <StatementList statements={quarterlyStatements} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="annual">
                <StatementList statements={annualStatements} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
