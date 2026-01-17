import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Clock } from "lucide-react";
import type { Transaction } from "@shared/schema";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Completed</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">Pending</Badge>;
    case "failed":
      return <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">Failed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "contribution":
    case "deposit":
      return <ArrowDownLeft className="w-4 h-4 text-green-600 dark:text-green-400" />;
    case "withdrawal":
    case "redemption":
      return <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />;
    default:
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
};

const formatDate = (date: Date | string | null) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  if (isLoading) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="w-24 h-4 rounded bg-muted" />
                  <div className="w-16 h-3 rounded bg-muted" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="w-20 h-4 rounded bg-muted ml-auto" />
                <div className="w-16 h-3 rounded bg-muted ml-auto" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No Transactions Yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Your transaction history will appear here once you make your first investment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-lg font-semibold">Transaction History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                {getTransactionIcon(transaction.type)}
              </div>
              <div>
                <p className="font-medium text-sm capitalize">{transaction.type}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {transaction.type === "withdrawal" || transaction.type === "redemption" ? "-" : "+"}
                ₹{Number(transaction.amount).toLocaleString("en-IN")}
              </p>
              <div className="mt-1">{getStatusBadge(transaction.status)}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
