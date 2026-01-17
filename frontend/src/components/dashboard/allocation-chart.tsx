import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";

interface AllocationChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  title?: string;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" className="fill-foreground text-sm font-medium">
        {payload.name}
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="fill-accent text-xl font-bold">
        {(percent * 100).toFixed(0)}%
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
    </g>
  );
};

export function AllocationChart({ data, title = "Portfolio Allocation" }: AllocationChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Card className="bg-card h-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      strokeWidth={0}
                      className="transition-all duration-200"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {data.map((item, index) => (
              <motion.div 
                key={index} 
                className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${
                  activeIndex === index ? "bg-accent/10" : "hover:bg-muted/50"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {((item.value / total) * 100).toFixed(0)}%
                </span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
