import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InvestorSidebar } from "@/components/dashboard/sidebar";
import { StatementList } from "@/components/dashboard/statement-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Statement } from "@shared/schema";



export default function StatementsPage() {
  const { data: statements, isLoading } = useQuery<Statement[]>({
    queryKey: ["/api/investor/statements"],
  });

  const displayStatements = statements || [];

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
