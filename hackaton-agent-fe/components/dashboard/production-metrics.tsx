"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Activity, AlertCircle, CheckCircle, Wrench } from "lucide-react";

const productionData = [
  { line: "Line A", current: 45.5, target: 50.0, efficiency: 91.0, status: "active" },
  { line: "Line B", current: 78.2, target: 80.0, efficiency: 97.8, status: "active" },
  { line: "Line C", current: 25.8, target: 30.0, efficiency: 86.0, status: "maintenance" },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "maintenance":
      return <Wrench className="h-4 w-4 text-amber-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-red-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "text-green-600";
    case "maintenance":
      return "text-amber-600";
    default:
      return "text-red-600";
  }
};

const getBarColor = (efficiency: number) => {
  if (efficiency >= 95) return "#10b981"; // green
  if (efficiency >= 85) return "#f59e0b"; // amber
  return "#ef4444"; // red
};

export function ProductionMetrics() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Production Lines Performance
          </CardTitle>
          <Badge variant="outline">Real-time</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Production Lines Status */}
        <div className="grid gap-4">
          {productionData.map((line) => (
            <div key={line.line} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(line.status)}
                <div>
                  <div className="font-medium">{line.line}</div>
                  <div className="text-sm text-muted-foreground capitalize">{line.status}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Current Rate</div>
                  <div className="font-medium">{line.current} units/hr</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Target</div>
                  <div className="font-medium">{line.target} units/hr</div>
                </div>
                <div className="text-right min-w-[80px]">
                  <div className="text-sm text-muted-foreground">Efficiency</div>
                  <div className={`font-medium ${getStatusColor(line.status)}`}>{line.efficiency}%</div>
                  <Progress value={line.efficiency} className="w-48 h-2 mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Efficiency Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="line" />
              <YAxis label={{ value: "Efficiency %", angle: -90, position: "insideLeft" }} />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Efficiency"]}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="efficiency" radius={[4, 4, 0, 0]}>
                {productionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.efficiency)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
