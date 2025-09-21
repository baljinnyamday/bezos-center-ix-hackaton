"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Truck, Building2, Clock, Target } from "lucide-react";

const allocationData = [
  { company: "Company A", allocated: 500, requested: 500, percentage: 100, color: "#3b82f6" },
  { company: "Company B", allocated: 600, requested: 750, percentage: 80, color: "#10b981" },
  { company: "Company C", allocated: 200, requested: 300, percentage: 67, color: "#f59e0b" },
];

const pieData = allocationData.map((item) => ({
  name: item.company,
  value: item.allocated,
  color: item.color,
}));

export function SupplyAllocation() {
  const totalAllocated = allocationData.reduce((sum, item) => sum + item.allocated, 0);
  const totalRequested = allocationData.reduce((sum, item) => sum + item.requested, 0);
  const overallFulfillment = Math.round((totalAllocated / totalRequested) * 100);

  return (
    <Card className="flex-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Supply Allocation Status
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <Target className="h-3 w-3" />
            {overallFulfillment}% Fulfilled
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Allocation Details */}
          <div className="space-y-4">
            {allocationData.map((item) => (
              <div key={item.company} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{item.company}</span>
                  </div>
                  <Badge
                    variant={item.percentage >= 90 ? "default" : item.percentage >= 70 ? "secondary" : "destructive"}
                  >
                    {item.percentage}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {item.allocated} / {item.requested} units
                  </span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Due in 7 days</span>
                  </div>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </div>

          {/* Allocation Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value} units`, "Allocated"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
