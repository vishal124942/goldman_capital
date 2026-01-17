import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface DeploymentStatusProps {
  status: "deployed" | "partial" | "pending";
  deployed?: number;
  total?: number;
}

const statusConfig = {
  deployed: {
    label: "Fully Deployed",
    description: "All capital has been deployed",
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  partial: {
    label: "Partially Deployed",
    description: "Capital deployment in progress",
    icon: Clock,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
  },
  pending: {
    label: "Pending Deployment",
    description: "Awaiting capital deployment",
    icon: AlertCircle,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
};

export function DeploymentStatus({ status, deployed = 0, total = 100 }: DeploymentStatusProps) {
  const config = statusConfig[status];
  const percentage = total > 0 ? (deployed / total) * 100 : 0;

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Deployment Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg ${config.bgColor} flex items-center justify-center`}>
            <config.icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div>
            <p className={`font-semibold ${config.color}`}>{config.label}</p>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Capital Deployed</span>
            <span className="font-medium">{percentage.toFixed(0)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Deployed</p>
            <p className="text-lg font-bold">₹{deployed.toLocaleString("en-IN")}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">Total Committed</p>
            <p className="text-lg font-bold">₹{total.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
