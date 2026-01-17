import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { SkeletonShimmer } from "@/components/ui/premium-loader";

interface MetricsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  description?: string;
  delay?: number;
  isLoading?: boolean;
}

export function MetricsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  description,
  delay = 0,
  isLoading = false,
}: MetricsCardProps) {
  const getTrendIcon = () => {
    switch (changeType) {
      case "positive":
        return <TrendingUp className="w-3 h-3" />;
      case "negative":
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30";
      case "negative":
        return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay }}
      >
        <Card className="bg-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                <SkeletonShimmer className="h-4 w-24" />
                <SkeletonShimmer className="h-8 w-32" />
                <SkeletonShimmer className="h-4 w-20" />
              </div>
              <SkeletonShimmer className="w-10 h-10 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay }}
    >
      <Card className="bg-card hover-elevate transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <motion.p 
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: delay + 0.1 }}
              >
                {value}
              </motion.p>
              {change && (
                <div className="flex items-center gap-2">
                  <motion.span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      getChangeColor()
                    )}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: delay + 0.2 }}
                  >
                    {getTrendIcon()}
                    {change}
                  </motion.span>
                  {description && (
                    <span className="text-xs text-muted-foreground">{description}</span>
                  )}
                </div>
              )}
            </div>
            {icon && (
              <motion.div 
                className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: delay + 0.15 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {icon}
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
