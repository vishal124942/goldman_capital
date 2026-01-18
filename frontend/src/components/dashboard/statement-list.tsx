import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar } from "lucide-react";
import type { Statement } from "@shared/schema";

interface StatementListProps {
  statements: Statement[];
  isLoading?: boolean;
}

const getStatementTypeLabel = (type: string) => {
  switch (type) {
    case "monthly":
      return "Monthly Statement";
    case "quarterly":
      return "Quarterly Statement";
    case "annual":
      return "Annual Summary";
    default:
      return type;
  }
};

const getStatementTypeBadgeVariant = (type: string) => {
  switch (type) {
    case "monthly":
      return "secondary";
    case "quarterly":
      return "default";
    case "annual":
      return "outline";
    default:
      return "secondary";
  }
};

export function StatementList({ statements, isLoading }: StatementListProps) {
  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Statements & Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted" />
                <div className="space-y-2">
                  <div className="w-32 h-4 rounded bg-muted" />
                  <div className="w-24 h-3 rounded bg-muted" />
                </div>
              </div>
              <div className="w-20 h-8 rounded bg-muted" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!statements || statements.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Statements & Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No Statements Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your statements will appear here once they are generated.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg font-semibold">Statements & Reports</CardTitle>
        <Button variant="outline" size="sm" data-testid="button-download-all">
          <Download className="w-4 h-4 mr-2" />
          Download All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {statements.map((statement) => (
          <div
            key={statement.id}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{statement.fileName}</p>
                  <Badge variant={getStatementTypeBadgeVariant(statement.type) as any}>
                    {getStatementTypeLabel(statement.type)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{statement.period} {statement.year}</span>
                  {statement.fileSize && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      <span>{(statement.fileSize / 1024).toFixed(0)} KB</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <a 
                href={`/api/investor/statements/${(statement as any)._id || (statement as any).id}/download`} 
                download 
                target="_blank"
                rel="noreferrer"
                data-testid={`button-download-statement-${(statement as any)._id || (statement as any).id}`}
              >
                <Download className="w-4 h-4" />
              </a>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
